import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postLogin } from "../api/apiClient";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { refresh } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await postLogin(email, password);
      await refresh();
      navigate("/", { replace: true });
    } catch (err) {
      alert(`login failed: ${err?.message || "Unkown error"}`);
    }
  }

  return (
    <div className="login_register-page">
      <div className="login_register-card">
        <h1>Login</h1>

        <form onSubmit={handleSubmit} className="login_register-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              required
            />
          </label>

          <button type="submit" className="login_register-btn">
            Sign in
          </button>
        </form>

        <p className="login_register-links">
          Are you a host? <Link to="/host/login">Login here</Link>
        </p>
        <p className="login_register-links">
          No account? <Link to="/register">Register</Link>
        </p>
        <p className="login_register-links">
          <Link to="/">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
