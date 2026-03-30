import { createContext, useContext } from "react";

export const ChatboxContext = createContext(null);

export const useChatbox = () => {
  const context = useContext(ChatboxContext);

  if (!context) {
    throw new Error("useChatbox must be used within a ChatboxProvider");
  }

  return context;
};
