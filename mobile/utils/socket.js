import { io } from "socket.io-client";

const SOCKET_URL = "https://3761ac2877dc.ngrok-free.app";
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