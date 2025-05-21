import { useCallback } from "react";
import apiClient from "../services/apiClient";
import useChatStore from "../stores/chatStore";

const useChats = () => {
  const {
    setChats,
    setUsers,
    addChat,
    setSelectedChat,
    setMessages,
    chats,
    messages,
  } = useChatStore();

  const fetchChats = useCallback(
    async (userId) => {
      if (!chats[userId]) {
        const response = await apiClient.get(`/api/chats/${userId}`);
        const data = response.data;

        setChats(data);
      }
    },
    [setChats]
  );

  const fetchUsers = useCallback(async () => {
    const response = await apiClient.get(`/api/users`);
    console.log("users", response.data);

    setUsers(response.data);
  }, [setUsers]);

  const createChat = async (senderId, receiverId) => {
    try {
      const response = await apiClient.post(`/api/chats/createchat`, {
        senderId,
        receiverId,
      });
      const newChat = response.data;
      console.log("New chat:", newChat);

      if (newChat._id) {
        addChat(newChat);
        setSelectedChat(newChat);
      } else {
        console.error("Chat creation failed. No _id returned.");
      }
    } catch (err) {
      console.error("Error creating chat:", err);
      throw err;
    }
  };

  const fetchMessages = useCallback(
    async (chatId) => {
      try {
        const response = await apiClient.get(`/api/chats/messages/${chatId}`);

        const rawMessages = response.data;

        const normalizedMessages = rawMessages.map((msg) => ({
          ...msg,
          senderId: msg.senderID?._id || msg.senderID,
          receiverId: msg.receiverID?._id || msg.receiverID,
        }));

        setMessages(chatId, normalizedMessages);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    },
    [setMessages]
  );

  return { fetchChats, fetchUsers, createChat, fetchMessages };
};

export default useChats;
