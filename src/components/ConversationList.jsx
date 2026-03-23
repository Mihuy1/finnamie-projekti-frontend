import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { getConversations, startConversation } from "../api/apiClient";
import { CListItem } from "./CListItem";

// TODO:
//  - avaa oikean keskustelun, kun avaa keskustelut vastaanottajan profiilista.
export const ConversationList = ({ handleOpen, convId, messageReceiver }) => {
  const [conversations, setConversations] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const getConvs = async () => {
        try {
          const data = await getConversations();
          setConversations(data);
          if (messageReceiver) {
            const userIds = data.map((receiver) => receiver.user_id);
            if (!userIds.includes(messageReceiver.user_id)) {
              const newConvId = await startConversation(
                messageReceiver.user_id,
              );
              const newConv = {
                ...messageReceiver,
                conv_id: newConvId,
              };
              setConversations([newConv, ...data]);
            }
          }
        } catch (err) {
          console.log(err);
        }
      };
      getConvs();
    }
  }, [user, messageReceiver]);
  return (
    <div
      style={{
        width: "20%",
        backgroundColor: "#a0ceff",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {conversations &&
        conversations.map((c) => (
          <CListItem
            handleOpen={handleOpen}
            c={c}
            key={c.conv_id}
            isSelected={c.conv_id === convId}
          />
        ))}
    </div>
  );
};
