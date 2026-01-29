import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function HostLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    alert("Host login onnistui");
    navigate("/host/dashboard");
  }

  return (
    <div className="login_register-page">
      <div className="login_register-card">
        <h1>Host Login</h1>

        <form onSubmit={handleSubmit} className="login_register-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
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

        <p className="login_register-links">
          Normal user? <Link to="/login">Login here</Link>
        </p>

        <p className="login_register-links">
          <Link to="/">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
