import { useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    alert(` rekisteröityminen onnistui`);
  }

  return (
    <div className="login_register-page">
      <div className="login_register-card">
        <h1>Register</h1>

        <form onSubmit={handleSubmit} className="login_register-form">
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=""
              required
            />
          </label>

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

          <label>
            Confirm password
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder=""
              required
            />
          </label>

          {error && <p className="login_register-error">{error}</p>}

          <button type="submit" className="login_register-btn">Create account</button>
        </form>

        <p className="login_register-links">
          Already have an account? <Link to="/login">Login</Link>
        </p>
        <p className="login_register-links">
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
