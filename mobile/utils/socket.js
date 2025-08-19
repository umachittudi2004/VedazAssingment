import { io } from "socket.io-client";

const SOCKET_URL = "http://YOUR_SERVER_IP:5000";
let socket;

export const initSocket = (userId) => {
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, { transports: ["websocket"] });
  socket.on("connect", () => {
    socket.emit("join", userId);
  });
  return socket;
};

export const getSocket = () => socket;