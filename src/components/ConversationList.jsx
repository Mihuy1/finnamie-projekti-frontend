import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { getConversations } from "../api/apiClient";
import { CListItem } from "./CListItem";

export const ConversationList = ({ handleOpen, convId }) => {
  const [conversations, setConversations] = useState([]);
  const { user } = useAuth();

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
