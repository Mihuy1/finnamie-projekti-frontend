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
          <>
            <Link to="/discover" className="nav-btn primary">Discover activities</Link>
            <Link to="/host/register" className="nav-btn ghost">Become a Host</Link>
            <Link to="/login" className="nav-btn ghost">Login</Link>
            <Link to="/register" className="nav-btn outline">Register</Link>
          </>
        ) : (
          <>
            <Link to="/discover" className="nav-btn primary">Discover activities</Link>
            <Link to="/profile" className="nav-btn ghost">
              👤 {user.first_name}
            </Link>
            <a className="nav-btn ghost conversations" onClick={toggle}>
              Messages
              {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
            </a>
            {user.role === "admin" && <Link to="/admin" className="nav-btn ghost">Admin</Link>}
            <a className="nav-btn logout" onClick={handleLogout}>Logout</a>
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
