import { create } from "zustand";
import { io } from "socket.io-client";

const useSocketStore = create((set, get) => ({
  socket: null,
  messages: {},
  chats: [],

  initializeSocket: () => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    const existingSocket = get().socket;
    if (existingSocket) return;

    const socketInstance = io(import.meta.env.VITE_SOCKET_URL);
    set({ socket: socketInstance });

    socketInstance.on("connect", () => {
      if (loggedInUser?._id) {
        socketInstance.emit("setup", loggedInUser);
      }
    });

    socketInstance.on("receiveMessage", (message) => {
      set((state) => {
        const chatId = message.chatId;
        const updated = [...(state.messages[chatId] || []), message];
        return {
          messages: {
            ...state.messages,
            [chatId]: updated,
          },
        };
      });
    });

    socketInstance.on("chatListUpdate", (data) => {
      set((state) => {
        const updatedChats = [...state.chats];
        const chatIndex = updatedChats.findIndex(
          (chat) => chat.chatId === data.chatId
        );

        if (chatIndex > -1) {
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            lastMessage: data.text,
            updatedAt: data.updatedAt,
          };
        } else {
          updatedChats.unshift({
            chatId: data.chatId,
            lastMessage: data.text,
            updatedAt: data.updatedAt,
            senderId: data.senderId,
          });
        }

        return { chats: updatedChats };
      });
    });
  },

  sendMessage: (data) => {
    const socket = get().socket;
    if (socket) {
      socket.emit("sendMessage", data);
    } else {
      console.error("Socket not initialized!");
    }
  },
}));

export default useSocketStore;
