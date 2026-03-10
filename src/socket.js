import { io } from "socket.io-client";
const API_URL = import.meta.env.VITE_BASE_URL;

export const socket = io(API_URL, {
  autoConnect: false,
});
console.log(socket);
