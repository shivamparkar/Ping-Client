import { useEffect } from "react";
import useSocketStore from "../../stores/socketStore";
import useChatStore from "../../stores/chatStore";


const SocketListener = () => {
  const { socket } = useSocketStore();
  const addMessage = useChatStore((state) => state.addMessage);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      addMessage(message.chatId, message);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, addMessage]);

  return null;
};

export default SocketListener;
