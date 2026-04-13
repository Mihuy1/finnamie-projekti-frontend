import { useState, useEffect, useCallback } from "react";
import { ChatboxContext } from "./ChatboxContext";
import { getUnreadCount } from "../api/apiClient";
import { useAuth } from "../auth/AuthContext";

export const ChatboxProvider = ({ children }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [newReceiver, setNewReceiver] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUnreadCount();
      setUnreadCount(data?.count || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshUnreadCount();

      const interval = setInterval(refreshUnreadCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [user, refreshUnreadCount]);

  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    setIsOpen(false);
    setNewReceiver(null);
    refreshUnreadCount();
  };

  const toggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  };

  /*const triggerChatWithHost = (host) => {
    if (!host) return;
    setNewReceiver({
      user_id: host.id || host.user_id || host.host_id,
      first_name: host.first_name,
      last_name: host.last_name
    });
    setIsOpen(true);
  };*/

  return (
    <ChatboxContext.Provider
      value={{
        isOpen,
        handleOpen,
        handleClose,
        toggle,
        //triggerChatWithHost,
        newReceiver,
        unreadCount,
        refreshUnreadCount
      }}
    >
      {children}
    </ChatboxContext.Provider>
  );
};