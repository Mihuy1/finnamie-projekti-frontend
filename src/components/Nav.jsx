import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { logout } from "../api/apiClient";

export const Nav = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    console.log("Logout initiated");
    try {
      await logout();
      localStorage.removeItem("token");

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
            <a className="logout-link" onClick={handleLogout}>
              Logout
            </a>
          </>
        )}
      </nav>
    </header>
  );
};
