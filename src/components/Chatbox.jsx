import { useState, useEffect } from "react";
import { socket } from "../socket";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { ConversationList } from "./ConversationList";
import "../styles/message-styles.css";

//TODO:
// -Refaktoroi tyylit yhteen css filuun.
// -Tapaus, jossa käyttäjällä ei ole aikaisempia keskusteluja.
export const Chatbox = ({ closeChat }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [receiver, setReceiver] = useState({
    first_name: null,
    last_name: null,
    id: null,
  });
  const [convId, setConvId] = useState("");

  // init and cleanup
  useEffect(() => {
    if (!socket.connected) socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenConversation = (c) => {
    const { conv_id, first_name, last_name, user_id } = c;
    if (conv_id !== convId) {
      socket.emit("join conversation", conv_id);
      setConvId(conv_id);
      setIsOpen(true);
    } else {
      socket.emit("leave conversation", conv_id);
      setConvId("");
      setIsOpen(false);
    }
    if (isOpen && convId !== conv_id) setIsOpen(true);
    else setIsOpen(!isOpen);

    setReceiver({
      first_name,
      last_name,
      id: user_id,
    });
  };

  return (
    <>
      {
        <div className="chatbox" style={{}}>
          <div className="chat-header">
            <div className="chat-title">
              {receiver?.first_name
                ? `${receiver.first_name} ${receiver.last_name}`
                : "Messages"}
            </div>
            <div className="chat-actions">
              <button
                className="chat-close"
                aria-label="Close chat"
                onClick={() => closeChat()}
              >
                ✕
              </button>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              margin: "auto",
              display: "flex",
              height: "500px",
            }}
          >
            <ConversationList
              handleOpen={handleOpenConversation}
              convId={convId}
            />
            <div
              style={{
                width: "80%",
                display: "flex",
                flexDirection: "column",
                maxHeight: "500px",
              }}
            >
              {isOpen && <MessageList receiver={receiver} conv_id={convId} />}
              <MessageInput
                conv_id={convId}
                receiver_id={receiver.id}
                isOpen={isOpen}
              />
            </div>
          </div>
        </div>
      }
    </>
  );
};
