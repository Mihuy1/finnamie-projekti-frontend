import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";
import { useAuth } from "../auth/AuthContext";
import { getConversations, getMessagesByConvId } from "../api/apiClient";

export const MessageTest = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [conversations, setConversations] = useState([]);
  const [fetchedMessages, setFetchedMessages] = useState([]);
  const [receiver, setReceiver] = useState("");
  const [convId, setConvId] = useState("");
  const { user } = useAuth();
  const message = useRef();

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
  // jos frontendi ei lataudu ja heittää error 404, käynnistä backend uudestaan.
  useEffect(() => {
    if (!socket.connected) socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleNewMessage = (msg) => {
      //setFetchedMessages((prev) => prev.concat(msg));
      console.log(msg);
    };

    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat message", handleNewMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat message", handleNewMessage);
    };
  }, []);

  const send = (e) => {
    e.preventDefault();
    try {
      const now = new Date().toISOString();
      setFetchedMessages(
        fetchedMessages.concat({
          sent_at: now,
          conv_id: convId,
          sender_id: user.id,
          receiver_id: receiver,
          content: message.current.value,
        }),
      );
      socket.emit("chat message", message.current.value);
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

  const handleOpenConversation = (id) => {
    setConvId(id);
    getMessages(id);
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
        conversations.map((conv) => {
          return (
            <p onClick={() => handleOpenConversation(conv.id)} key={conv.id}>
              {conv.id}
            </p>
          );
        })}
      <ul style={{ listStyleType: "none" }}>
        {fetchedMessages &&
          fetchedMessages.map((msg, index) => {
            if (!receiver && msg.sender_id !== user.id)
              setReceiver(msg.sender_id);
            return (
              <li
                key={index}
                style={msg.receiver_id === user.id ? ownStyle : resStyle}
              >
                <p>
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
