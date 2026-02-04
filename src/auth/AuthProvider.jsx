import { useEffect, useMemo, useState } from "react";
import { verifyMe } from "../api/apiClient";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const payload = await verifyMe(); // null OR { user, message }
      setSession(payload);
      setUser(payload?.user ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({ user, session, loading, isAuthed: !!user, refresh, setUser }),
    [user, session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
