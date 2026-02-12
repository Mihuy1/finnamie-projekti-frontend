import { useState, useEffect, useRef } from "react";
import { getMessagesByConvId } from "../api/apiClient";
import { useAuth } from "../auth/AuthContext";
import { handleNewMessage } from "../socket-handlers";
import { socket } from "../socket";
import { Message } from "./Message";
import "../styles/message-styles.css";

export const MessageList = ({ conv_id }) => {
  const [fetchedMessages, setFetchedMessages] = useState([]);
  const { user } = useAuth();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (conv_id) {
      const getMessages = async () => {
        try {
          const data = await getMessagesByConvId(conv_id);
          setFetchedMessages(data);
        } catch (err) {
          console.log(err);
        }
      };
      getMessages();
    }
  }, [conv_id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [fetchedMessages]);

  useEffect(() => {
    const onNewMessage = handleNewMessage(setFetchedMessages);

    socket.on("chat message", onNewMessage);
    return () => {
      socket.off("chat message", handleNewMessage);
    };
  }, []);

  if (!conv_id) {
    return <p>Loading messages..</p>;
  }

  return (
    <div ref={scrollRef} className="message-wrapper">
      {fetchedMessages &&
        fetchedMessages.map((msg) => (
          <Message user={user} msg={msg} key={msg.id} />
        ))}
    </div>
  );
};
