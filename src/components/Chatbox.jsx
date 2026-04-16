import { useState, useEffect } from "react";
import { socket } from "../socket";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { ConversationList } from "./ConversationList";
import "../styles/message-styles.css";
import { getConversationId } from "../api/apiClient";
import { useChatbox } from "../contexts/ChatboxContext";

export const Chatbox = ({ newReceiver = null, loadMessages }) => {
  const { handleClose } = useChatbox();
  const isMobile = window.innerWidth <= 768;

  const [openConversation, setOpenConversation] = useState(loadMessages);
  const [receiver, setReceiver] = useState({
    first_name: null,
    last_name: null,
    id: null,
  });
  const [convId, setConvId] = useState("");

  useEffect(() => {
    if (newReceiver) {
      const getConvId = async () => {
        try {
          const data = await getConversationId(newReceiver.user_id);
          if (data && data.conv_id) {
            setConvId(data.conv_id);
            setOpenConversation(true);
            setReceiver({
              first_name: newReceiver.first_name,
              last_name: newReceiver.last_name,
              id: newReceiver.user_id,
            });
            socket.emit("join conversation", data.conv_id);
          }
        } catch (err) {
          console.error("Error fetching conversation ID:", err);
        }
      };
      getConvId();
    }
  }, [newReceiver]);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  // tausta ei skrollaannu, kun chatbox on auki mobiilissa
  useEffect(() => {
    if (window.innerWidth <= 768) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    }

    return () => {
      document.body.style.overflow = "auto";
      document.body.style.position = "static";
      document.body.style.width = "auto";
    };
  }, []);

  const handleOpenConversation = (c) => {
    const { conv_id, first_name, last_name, user_id } = c;
    if (conv_id !== convId) {
      socket.emit("join conversation", conv_id);
      setConvId(conv_id);
      setOpenConversation(true);
    } else {
      socket.emit("leave conversation", conv_id);
      setConvId("");
      setOpenConversation(false);
    }

    setReceiver({
      first_name,
      last_name,
      id: user_id,
    });
  };

  const handleBackToList = () => {
    socket.emit("leave conversation", convId);
    setConvId("");
    setOpenConversation(false);
    setReceiver({ first_name: null, last_name: null, id: null });
  };

  return (
    <div className={`chatbox ${convId ? "conversation-open" : ""}`}>
      <div className="chat-header">

        <button className="chat-back-btn" onClick={handleBackToList}>
          ←
        </button>

        <div className="chat-title">
          {receiver?.first_name
            ? `${receiver.first_name} ${receiver.last_name}`
            : "Messages"}
        </div>

        <div className="chat-actions">
          <button
            className="chat-close"
            aria-label="Close chat"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="chatbox-main">
        {!(isMobile && convId) && (
          <ConversationList
            handleOpenClick={handleOpenConversation}
            convId={convId}
            messageReceiver={convId ? null : newReceiver}
          />
        )}
        <div className="message-history-wrapper">
          {openConversation && <MessageList conv_id={convId} />}
          <MessageInput conv_id={convId} receiver_id={receiver.id} />
        </div>
      </div>
    </div>
  );
};