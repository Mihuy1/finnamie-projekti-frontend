import { useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import { socket } from "../socket";

export const MessageInput = ({ conv_id, receiver_id, isOpen }) => {
  const message = useRef();
  const { user } = useAuth();

  if (!isOpen) {
    return (
      <p style={{ margin: "auto", color: "black" }}>Select a conversation.</p>
    );
  }

  const send = (e) => {
    e.preventDefault();
    // TODO: error handle
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
    <div style={{ display: "flex", margin: "auto" }}>
      <textarea
        onKeyDown={handleEnter}
        disabled={!isOpen}
        ref={message}
        placeholder={"Type a message.."}
        style={{
          height: "32px",
          width: "256px",
          resize: "none",
          borderRadius: "4px",
          scrollbarWidth: "none",
        }}
      ></textarea>
      <p
        onClick={send}
        style={{
          cursor: "pointer",
          fontSize: "32px",
          marginTop: "0",
          marginLeft: "8px",
          marginBottom: "4px",
          color: "#51a5ff",
        }}
      >
        ➤
      </p>
    </div>
  );
};
