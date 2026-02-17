import { useState } from "react";
import { Link } from "react-router-dom";
import { register } from "../api/apiClient";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role: "guest",
      });
      alert("Registration successful!");
    } catch (err) {
      setError(err?.message || "Registration failed.");
    }
  }

  return (
    <div className="login_register-page">
      <Link to="/" className="back-link">← Back to home page </Link>
      <div className="login_register-card">
        <h1>Register</h1>

        <form onSubmit={handleSubmit} className="login_register-form">
          <div className="address-grid">
            <label>
              <span className="required">First Name</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </label>
            <label>
              <span className="required">Last Name</span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </label>
          </div>

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

          <label>
            <span className="required">Confirm password</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </label>

          {error && <p className="login_register-error">{error}</p>}

          <button type="submit" className="login_register-btn">
            Create account
          </button>
        </form>

        <div className="login_register-links">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}