import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";
import { useAuth } from "../auth/AuthContext";
import { getConversations, getMessagesByConvId } from "../api/apiClient";
import {
  handleConnect,
  handleDisconnect,
  handleNewMessage,
} from "../socket-handlers";

//TODO: Refaktoroi
export const MessageTest = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [conversations, setConversations] = useState([]);
  const [fetchedMessages, setFetchedMessages] = useState([]);
  const [receiver, setReceiver] = useState({
    first_name: null,
    last_name: null,
    id: null,
  });
  const [convId, setConvId] = useState("");
  const { user } = useAuth();
  const message = useRef();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const getConvs = async () => {
        try {
          const data = await getConversations();
          setConversations(data);
        } catch (err) {
          console.log(err);
        }
      };
      getConvs();
    }
  }, [user]);

  // init and cleanup
  useEffect(() => {
    if (!socket.connected) socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const onConnect = handleConnect(setIsConnected);
    const onDisconnect = handleDisconnect(setIsConnected);
    const onNewMessage = handleNewMessage(setFetchedMessages);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat message", onNewMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat message", handleNewMessage);
    };
  }, []);

  const send = (e) => {
    e.preventDefault();
    try {
      const newMessage = {
        conv_id: convId,
        sender_id: user.id,
        receiver_id: receiver.id,
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

  const getMessages = async (id) => {
    try {
      const data = await getMessagesByConvId(id);
      setFetchedMessages(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleOpenConversation = (c) => {
    const { conv_id, first_name, last_name, user_id } = c;
    if (conv_id !== convId) {
      socket.emit("join conversation", conv_id);
    } else {
      socket.emit("leave conversation", conv_id);
    }
    setConvId(conv_id);
    getMessages(conv_id);
    setIsOpen(!isOpen);
    setReceiver({
      first_name,
      last_name,
      id: user_id,
    });
  };

  const ownStyle = {
    color: "white",
    background: "blue",
  };

  const resStyle = {
    color: "white",
    background: "black",
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "50%",
        margin: "auto",
        alignItems: "center",
      }}
    >
      <h1>Messages</h1>
      <p>{isConnected ? "Connected." : "Not connected."}</p>
      <textarea
        onKeyDown={handleEnter}
        ref={message}
        placeholder="Type a message.."
        style={{
          marginTop: "2rem",
          height: "200px",
          width: "400px",
          resize: "none",
        }}
      ></textarea>
      <button onClick={send}>Send</button>
      {conversations &&
        conversations.map((c) => {
          return (
            <p onClick={() => handleOpenConversation(c)} key={c.conv_id}>
              {c.first_name} {c.last_name}
            </p>
          );
        })}
      <ul style={{ listStyleType: "none" }}>
        {fetchedMessages &&
          isOpen &&
          fetchedMessages.map((msg, index) => {
            return (
              <li
                key={index}
                style={msg.sender_id === user.id ? ownStyle : resStyle}
              >
                <p>
                  {msg.sender_id === user.id
                    ? user.first_name
                    : receiver.first_name}{" "}
                  {msg.sender_id === user.id
                    ? user.last_name
                    : receiver.last_name}{" "}
                  Sent at:{" "}
                  {new Date(msg.sent_at).toLocaleString("en-GB", {
                    timeZoneName: "shortOffset",
                  })}
                </p>
                {msg.content}
              </li>
            );
          })}
      </ul>
    </div>
  );
};
