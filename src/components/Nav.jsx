import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { logout } from "../api/apiClient";
import { useState } from "react";
import { Chatbox } from "./Chatbox";

export const Nav = () => {
  const { user } = useAuth();
  const [openChat, setOpenChat] = useState(false);

  const handleLogout = async () => {
    console.log("Logout initiated");
    try {
      await logout();
      localStorage.removeItem("token");
      // jos logouttaa, kun on profiilisivulla niin profiili jää auki
      // onko haluttu toiminnallisuus?
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        Finnamie
      </Link>
      <nav className="nav">
        {!user ? (
          <ul>
            <Link to="/discover">Discover activities</Link>
            <Link to="/host/register">Become a Host</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </ul>
        ) : (
          <>
            <Link to="/discover">Discover activities</Link>
            <Link to="/profile">
              {user.first_name} {user.last_name}
            </Link>
            <a
              className="nav-conversations-link"
              onClick={() => setOpenChat(prev => !prev)}
              style={{
                cursor: 'pointer',
                alignItems: 'center',
              }}
            >
              Conversations
              <span className="nav-chat-dot"></span>
            </a>
            <a className="logout-link" onClick={handleLogout}>
              Logout
            </a>
          </>
        )}
      </nav>
      {openChat && <Chatbox closeChat={() => setOpenChat(false)} />}
    </header>
  );
};
