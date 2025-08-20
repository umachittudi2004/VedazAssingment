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

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/conversations", messageRoutes);

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", async (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { online: true });
    io.emit("user:online", userId);
    console.log(`${userId} is online`);
  });

  socket.on("message:send", async ({ sender, receiver, text }) => {
    try {
      const msg = await Message.create({
        sender,
        receiver,
        text,
        status: "sent",
      });

      if (onlineUsers.has(receiver)) {
        io.to(receiver).emit("message:new", { ...msg.toObject(), status: "delivered" });
        msg=await Message.findByIdAndUpdate(msg._id, { status: "delivered" },{ new: true });
      }

      io.to(sender).emit("message:status", { msgId: msg._id, status: "delivered" });
      io.to(sender).emit("message:new", msg);
    } catch (err) {
      console.error("Message send error:", err);
    }
  });

  socket.on("typing:start", ({ sender, receiver }) => {
    io.to(receiver).emit("typing:start", sender);
  });

  socket.on("typing:stop", ({ sender, receiver }) => {
    io.to(receiver).emit("typing:stop", sender);
  });

  socket.on("message:read", async (msgId) => {
    try {
      await Message.findByIdAndUpdate(msgId, { status: "read" });
      io.emit("message:read", msgId);
    } catch (err) {
      console.error("Read status error:", err);
    }
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    const userId = [...onlineUsers.entries()].find(([_, sId]) => sId === socket.id)?.[0];
    if (userId) {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { online: false });
      io.emit("user:offline", userId);
      console.log(`${userId} is offline`);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
