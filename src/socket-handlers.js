export const handleConnect = (setIsConnected) => () => {
  setIsConnected(true);
};

export const handleDisconnect = (setIsConnected) => () => {
  setIsConnected(false);
};

export const handleNewMessage = (setFetchedMessages) => (msg) => {
  setFetchedMessages((prev) => {
    if (prev.some((m) => m.id === msg.id)) return prev;
    return [...prev, msg];
  });
};
