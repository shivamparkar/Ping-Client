import React, { useEffect, useState, useRef } from 'react';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import useSocketStore from '../../stores/socketStore';
import useChatStore from "../../stores/chatStore";
import useChats from '../../hooks/useChats';
import CameraCapture from '../camera/CameraCapture';
import VideoCall from '../videoCall/VideoCall';

const Chat = () => {
  const { socket, initializeSocket } = useSocketStore();
  const { fetchMessages } = useChats();
  const { messages, addMessage } = useChatStore();
  const selectedChat = useChatStore(state => state.selectedChat);
  const [videoCallActive, setVideoCallActive] = useState(false);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [text, setText] = useState("");
  const endRef = useRef(null);
  const fileInputRef = useRef(null);

  const loggedInUser = JSON.parse(localStorage.getItem('user'));

  const API_BASE_URL = import.meta.env.VITE_SOCKET_URL;

  useEffect(() => {
    if (loggedInUser?._id) {
      initializeSocket(loggedInUser);
    }
  }, [initializeSocket, loggedInUser]);

  useEffect(() => {
    if (selectedChat?._id) {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat?._id, fetchMessages]);

  useEffect(() => {
    if (!socket) return;

    const receiveMessage = (message) => {
      const normalizedMessage = {
        ...message,
        senderId: message.senderId || message.senderID,
        receiverId: message.receiverId || message.receiverID,
      };

      const chatMessages = useChatStore.getState().messages[normalizedMessage.chatId] || [];

      const alreadyExists = chatMessages.some(
        (msg) =>
          msg._id === normalizedMessage._id ||
          (msg.text === normalizedMessage.text && msg.senderId === normalizedMessage.senderId)
      );

      if (!alreadyExists && !normalizedMessage._id.startsWith("temp-")) {
        addMessage(normalizedMessage.chatId, normalizedMessage);
      }
    };

    socket.on('receiveMessage', receiveMessage);
    return () => socket.off('receiveMessage', receiveMessage);
  }, [socket, addMessage]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages[selectedChat?._id]?.length]);

  const otherUser = selectedChat?.participants?.find(p => p._id !== loggedInUser?._id);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => sendImageMessage(reader.result);
    reader.readAsDataURL(file);

    e.target.value = null;
  };


  const handleCapture = (imageDataUrl) => {
    sendImageMessage(imageDataUrl);
    setCameraOpen(false);
  };

  const sendImageMessage = (base64Image) => {
    if (!selectedChat?._id) return;

    const tempId = "temp-" + Date.now();
    const receiverId = otherUser?._id;

    const message = {
      _id: tempId,
      chatId: selectedChat._id,
      senderId: loggedInUser._id,
      receiverId,
      text: "",
      image: base64Image,
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    addMessage(selectedChat._id, message);

    socket.emit("sendMessage",
      {
        chatId: selectedChat._id,
        senderId: loggedInUser._id,
        receiverId,
        text: "",
        image: base64Image,
      },
      (serverMessage) => {
        if (serverMessage?._id) {
          useChatStore.getState().updateMessage(selectedChat._id, tempId, serverMessage);
        }
      });
  };


  const handleSend = () => {
    if (!text.trim() || !selectedChat?._id) return;

    const tempId = "temp-" + Date.now();
    const receiverId = otherUser?._id;

    const message = {
      _id: tempId,
      chatId: selectedChat._id,
      senderId: loggedInUser._id,
      receiverId,
      text,
      image: "",
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    addMessage(selectedChat._id, message);

    socket.emit("sendMessage",
      {
        chatId: selectedChat._id,
        senderId: loggedInUser._id,
        receiverId,
        text,
        image: "",
      },
      (serverMessage) => {
        if (serverMessage?._id) {
          useChatStore.getState().updateMessage(selectedChat._id, tempId, serverMessage);
        }
      });

    setText("");
  };

  

  return (
    <div className='chat'>

      <div className="top">
        <div className="user">
          <img
            src={otherUser?.img ? `${API_BASE_URL}/uploads/${otherUser.img}` : "/default-avatar.png"}
            alt="User avatar"
          />
          <div className="texts">
            <span>{selectedChat?.name ? selectedChat.name.charAt(0).toUpperCase() + selectedChat.name.slice(1) : "No User Selected"}</span>
          </div>
        </div>

        <div className="icons">
          <img src="./phone.png" alt="Phone icon" />
          <img
            src="./video.png"
            alt="Video icon"
            style={{ cursor: "pointer" }}
            onClick={() => setVideoCallActive((prev => !prev))}
          />
          <img src="./info.png" alt="Info icon" />
        </div>
      </div>

      <div className="center">

        {videoCallActive && otherUser ? (

          <VideoCall
            currentUserId={loggedInUser._id}
            remoteUserId={otherUser._id}
            onCallEnd={() => setVideoCallActive(false)}
          />
        ) : (
          <>
            {selectedChat && messages[selectedChat._id]?.map(message => {
            const sender = message.senderId || message.senderID;
              const isOwnMessage = sender === loggedInUser?._id;
           

              return (
                <div className={`message ${isOwnMessage ? 'own' : ''}`} key={message._id}>
                  <img
                    src={
                      isOwnMessage
                        ? (loggedInUser?.img ? `${API_BASE_URL}/uploads/${loggedInUser.img}` : "/default-avatar.png")
                        : (otherUser?.img ? `${API_BASE_URL}/uploads/${otherUser.img}` : "/default-avatar.png")
                    }
                    alt="Sender avatar"
                  />
                  <div className="texts">
                    <small>{isOwnMessage ? 'You' : otherUser?.username || selectedChat?.name}</small>
                    {message.text && <p>{message.text}</p>}
                    {message.image && <img src={message.image} alt="Sent" className="message-image" />}
                    <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })}
            <div ref={endRef}></div>
          </>
        )}

      </div>

      <div className="bottom">
        <div className="icons">
          <img src="./img.png" alt="Image upload icon" onClick={() => fileInputRef.current?.click()} />
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <img src="./camera.png" alt="Open camera" onClick={() => setCameraOpen(true)} />
          <img src="./mic.png" alt="Microphone icon" />
        </div>

        <input
          type="text"
          value={text}
          placeholder={selectedChat ? 'Type a message...' : 'Select a chat first'}
          onChange={e => setText(e.target.value)}
          disabled={!selectedChat}
        />

        <div className="emoji">
          <img src="./emoji.png" alt="Emoji picker" onClick={() => setEmojiPickerOpen(prev => !prev)} />
          {emojiPickerOpen && (
            <div className="picker">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>

        <button
          className='sendButton'
          onClick={handleSend}
          disabled={!selectedChat || !text.trim()}
        >
          Send
        </button>
      </div>

      {cameraOpen && <CameraCapture onCapture={handleCapture} onClose={() => setCameraOpen(false)} />}
    </div>
  );
};

export default Chat;
