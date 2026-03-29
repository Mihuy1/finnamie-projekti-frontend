import { useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import { socket } from "../socket";

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
    <div
      style={{
        display: "flex",
        margin: "auto",
        position: "absolute",
        bottom: "8px",
      }}
    >
      <textarea
        onKeyDown={handleEnter}
        disabled={!conv_id}
        ref={message}
        placeholder={"Type a message.."}
        style={{
          margin: "4px",
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
          fontSize: "28px",
          marginTop: "4px",
          marginLeft: "4px",
          marginBottom: "4px",
          color: "#51a5ff",
        }}
      >
        ➤
      </p>
    </div>
  );
};
