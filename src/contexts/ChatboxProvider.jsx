import { useState } from "react";
import { ChatboxContext } from "./ChatboxContext";

export const ChatboxProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <ChatboxContext.Provider
      value={{ isOpen, handleOpen, handleClose, toggle }}
    >
      {children}
    </ChatboxContext.Provider>
  );
};
