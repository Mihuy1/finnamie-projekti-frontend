import "../styles/message-styles.css";

export const Message = ({ msg, user }) => {
  const isOwnMessage = msg.sender_id === user.id;

  return (
    <div className={`message-container ${isOwnMessage ? "own" : "other"}`}>
      <p className="message-time">
        {new Date(msg.sent_at).toLocaleString("en-GB", {
          timeZoneName: "shortOffset",
        })}
      </p>

      <div className="message-bubble">{msg.content}</div>
    </div>
  );
};
