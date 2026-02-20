import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postLogin } from "../api/apiClient";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { refresh } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await toast.promise(postLogin(email, password), {
        pending: "Logging in...",
        success: "Login successful!",
        error: (err) => `Login failed: ${err?.message || "Unknown error"}`,
      });

      await refresh();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
    }
  }

  return (
    <div className="login_register-page">
      <Link to="/" className="back-link">
        ← Back to home page{" "}
      </Link>
      <div className="login_register-card">
        <h1>Login</h1>

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
            Sign in
          </button>
        </form>

        <div className="login_register-links">
          <p>
            Are you a host? <Link to="/host/login">Login here</Link>
          </p>
          <p>
            No account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
