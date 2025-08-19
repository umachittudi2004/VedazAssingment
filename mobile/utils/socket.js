import { io } from "socket.io-client";

const SOCKET_URL = "https://6579bef6e77c.ngrok-free.app";
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