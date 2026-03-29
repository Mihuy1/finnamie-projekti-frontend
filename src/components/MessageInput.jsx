import { useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import { socket } from "../socket";
import "../styles/message-styles.css";

export const MessageInput = ({ conv_id, receiver_id }) => {
  const message = useRef(null);
  const { user } = useAuth();

  if (!conv_id) {
    return (
      <p style={{ margin: "auto", color: "black" }}>Select a conversation.</p>
    );
  }

  const send = (e) => {
    e.preventDefault();
    if (message.current.value === "") return;
    try {
      const newMessage = {
        conv_id,
        sender_id: user.id,
        receiver_id,
        content: message.current.value,
      };
      socket.emit("chat message", newMessage);
      message.current.value = "";
      message.current.focus();
    } catch (err) {
      console.log(err);
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      send(e);
    }
  };
  return (
    <div className="input-wrapper">
      <textarea
        onKeyDown={handleEnter}
        disabled={!conv_id}
        ref={message}
        placeholder={"Type a message.."}
        className="input-textarea"
      ></textarea>
      <p className="send-message-button" onClick={send}>
        ➤
      </p>
    </div>
  );
};
