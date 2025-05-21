import { create } from 'zustand';

const useChatStore = create((set) => ({
  selectedChat: null,
  chats: [],
  messages: {},
  users: [],

  setSelectedChat: (chat) => { set({ selectedChat: chat })},
  setChats: (chats) => set({ chats }),
  addChat: (newChat) =>
    set((state) => ({
      chats: [...state.chats, newChat],
    })),
    
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [chatId]: messages },
    })),
  
    addMessage: (chatId, message) =>
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] || []), message],
        },
      })),
    
      updateMessage: (chatId, tempId, updatedMessage) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: state.messages[chatId].map((msg) =>
              msg._id === tempId ? updatedMessage : msg
            ),
          },
        })),

    setUsers: (users) => set({users})
}));





export default useChatStore;
