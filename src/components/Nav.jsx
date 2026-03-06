import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export const Nav = () => {
  const { user } = useAuth();
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
          </>
        )}
      </nav>
    </header>
  );
};
