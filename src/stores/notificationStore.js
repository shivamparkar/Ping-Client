import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  unseenMessages: {},

  incrementCount: (chatId) =>
    set((state) => ({
      unseenMessages: { 
        ...state.unseenMessages, 
        [chatId]: (state.unseenMessages[chatId] || 0) + 1 
      },
    })),
  
  resetCount: (chatId) =>
    set((state) => ({
      unseenMessages: { 
        ...state.unseenMessages, 
        [chatId]: 0 
      },
    })),
}));

export default useNotificationStore;
