import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { logout } from "../api/apiClient";
import { Chatbox } from "./Chatbox";
import { useChatbox } from "../contexts/ChatboxContext";
import logo from "../assets/finnamie.jpeg";

export const Nav = () => {
  const { user, setUser } = useAuth();
  const { isOpen, handleClose, handleOpen, toggle, unreadCount, newReceiver } = useChatbox();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      handleClose();
      navigate("/", { replace: true });
    }
  };

  console.log("Nav unreadCount:", unreadCount, typeof unreadCount);

  return (
    <header className="header">
      <Link to="/" className="logo-link">
        <img src={logo} alt="Finnamie Logo" className="nav-logo" />
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
              onClick={toggle}
              style={{
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                position: "relative"
              }}
            >
              Conversations
              {unreadCount > 0 && (
                <span className="nav-chat-dot">
                  {unreadCount}
                </span>
              )}
            </a>
            {user.role === "admin" && <Link to="/admin"> Admin page</Link>}
            <a className="logout-link" onClick={handleLogout}>
              Logout
            </a>
          </>
        )}
      </nav>
      {isOpen && (
        <Chatbox
          newReceiver={newReceiver}
          loadMessages={!!newReceiver}
        />
      )}
    </header>
  );
};
