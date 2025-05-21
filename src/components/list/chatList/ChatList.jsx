import React, { useState, useEffect } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import useChatStore from "../../../stores/chatStore";
import useChats from "../../../hooks/useChats";
import useSocketStore from "../../../stores/socketStore";
import useNotificationStore from "../../../stores/notificationStore";

const ChatList = () => {
  const [addMode, setAddMode] = useState(false);
  const { setSelectedChat, chats } = useChatStore((state) => state);
  const { fetchChats } = useChats();
  const { incrementCount } = useNotificationStore();

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const API_BASE_URL = import.meta.env.VITE_SOCKET_URL;



  const userId = loggedInUser?._id;

  useEffect(() => {
    if (userId) {
      fetchChats(userId);
    }
  }, [userId, fetchChats]);

  useEffect(() => {
    const socket = useSocketStore.getState().socket;
    if (!socket) return;

    const handleNewMessage = (message) => {
      fetchChats(userId);
      incrementCount(message.chatId);
    };

    socket.on("receiveMessage", handleNewMessage);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
    };
  }, [userId, fetchChats, incrementCount]);

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="/search.png" alt="" />
          <input type="text" placeholder="search" />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {chats.map((chat) => {
        return (
          <div
            key={chat._id}
            className="item"
            onClick={() => {
              setSelectedChat({
                _id: chat._id,
                name: chat.username || "New Chat",
                receiverId: chat.receivedId,
                participants: chat.participants,
              });
            }}
          >
            <img
              src={
                chat.avatar
                  ? `${API_BASE_URL}/uploads/${chat.avatar}`
                  : "/default-avatar.png"
              }
              alt=""
            />
            <div className="texts">
              <h3>{chat.username || "New Chat"}</h3>

              <span>{chat.lastmessage}</span>
              <p>
                {chat.lastMessage?.senderID?._id !== loggedInUser._id
                  ? chat.lastMessage?.text || ""
                  : ""}
              </p>

              {useNotificationStore.getState().unseenMessages[chat._id] > 0 && (
                <span className="notificationCount">
                  {useNotificationStore.getState().unseenMessages[chat._id]}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
