import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { logout } from "../api/apiClient";
import { Chatbox } from "./Chatbox";
import { useChatbox } from "../contexts/ChatboxContext";

export const Nav = () => {
  const { user } = useAuth();
  const { isOpen, handleClose, handleOpen, toggle } = useChatbox();

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
              onClick={handleOpen}
              style={{
                cursor: "pointer",
                alignItems: "center",
              }}
            >
              Conversations
              <span className="nav-chat-dot"></span>
            </a>
            <Link to="/admin"> Admin page</Link>
            <a className="logout-link" onClick={handleLogout}>
              Logout
            </a>
          </>
        )}
      </nav>
      {isOpen && (
        <Chatbox
          loadMessages={
            false
          } /* Don't open messages from a specific user when opening from Navbar*/
        />
      )}
    </header>
  );
};
