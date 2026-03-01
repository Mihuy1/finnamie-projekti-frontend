import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postLogin } from "../api/apiClient";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";

export default function HostLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { refresh } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await toast.promise(postLogin(email, password), {
        pending: "Logging in as host...",
        success: "Host login successful!",
        error: (err) => `Login failed: ${err?.message || "Check your credentials"}`,
      });

      await refresh();
      navigate("/host/dashboard", { replace: true });
    } catch (error) {
      console.error("Host login error:", error);
    }
  }

  return (
    <div className="login_register-page">
      <Link to="/" className="back-link">
        ← Back to home page
      </Link>

      <div className="login_register-card">
        <h1>Host Login</h1>

        <form onSubmit={handleSubmit} className="login_register-form">
          <label>
            <span className="required">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            <span className="required">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="login_register-btn">
            Sign in as Host
          </button>
        </form>

        <div className="login_register-links">
          <p>
            Are you a guest? <Link to="/login">Login here</Link>
          </p>
          <p>
            Want to become a host? <Link to="/host/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}