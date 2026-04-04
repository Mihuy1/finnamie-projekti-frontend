import { useState } from "react";
import { ChatboxContext } from "./ChatboxContext";

export const ChatboxProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newReceiver, setNewReceiver] = useState(null);

  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    setIsOpen(false);
    setNewReceiver(null);
  };

  const toggle = () => setIsOpen((prev) => !prev);

  const triggerChatWithHost = (host) => {
    if (!host) return;

    setNewReceiver({
      user_id: host.id || host.user_id || host.host_id,
      first_name: host.first_name,
      last_name: host.last_name
    });
    setIsOpen(true);
  };

  return (
    <ChatboxContext.Provider
      value={{
        isOpen,
        handleOpen,
        handleClose,
        toggle,
        triggerChatWithHost,
        newReceiver
      }}
    >
      {children}
    </ChatboxContext.Provider>
  );
};