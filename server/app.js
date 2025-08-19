const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");
const Message = require("./models/Message");
const User = require("./models/User");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/conversations", messageRoutes);

// Track online users
const onlineUsers = new Map();

/* ---------------------- SOCKET.IO ---------------------- */
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins
  socket.on("join", async (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { online: true });
    io.emit("user:online", userId);
    console.log(`${userId} is online`);
  });

  // Send message
  socket.on("message:send", async ({ sender, receiver, text }) => {
    try {
      const msg = await Message.create({
        sender,
        receiver,
        text,
        status: "sent",
      });

      // Deliver message to receiver if online
      if (onlineUsers.has(receiver)) {
        io.to(receiver).emit("message:new", { ...msg.toObject(), status: "delivered" });
        msg=await Message.findByIdAndUpdate(msg._id, { status: "delivered" },{ new: true });
      }
      // ✅ also notify sender that message is delivered
      io.to(sender).emit("message:status", { msgId: msg._id, status: "delivered" });
      // Echo back to sender
      io.to(sender).emit("message:new", msg);
    } catch (err) {
      console.error("Message send error:", err);
    }
  });

  // Typing indicators
  socket.on("typing:start", ({ sender, receiver }) => {
    io.to(receiver).emit("typing:start", sender);
  });

  socket.on("typing:stop", ({ sender, receiver }) => {
    io.to(receiver).emit("typing:stop", sender);
  });

  // Mark message as read
  socket.on("message:read", async (msgId) => {
    try {
      await Message.findByIdAndUpdate(msgId, { status: "read" });
      io.emit("message:read", msgId);
    } catch (err) {
      console.error("Read status error:", err);
    }
  });

  // User disconnects
  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    // Find which user disconnected
    const userId = [...onlineUsers.entries()].find(([_, sId]) => sId === socket.id)?.[0];
    if (userId) {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { online: false });
      io.emit("user:offline", userId);
      console.log(`${userId} is offline`);
    }
  });
});
/* ------------------------------------------------------- */

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
