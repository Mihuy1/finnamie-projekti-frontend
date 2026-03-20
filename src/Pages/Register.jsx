import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadCountries, postLogin, register } from "../api/apiClient";
import toast from "react-hot-toast";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  // const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const { refresh } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await loadCountries();
        setCountries(data);
      } catch (err) {
        console.error("Error fetching countries:", err);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    const res = await toast.promise(
      register({
        first_name: firstName,
        last_name: lastName,
        email,
        // phone,
        country,
        date_of_birth: dateOfBirth,
        gender,
        password,
        confirmPassword: confirm,
        role: "guest",
      }),
      {
        loading: "Registering account...",
        success: "Account created successfully!",
        error: (err) => err?.message || "Registration failed.",
      },
    );

    if (res?.userId) {
      await postLogin(email, password);

      await refresh();

      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    }
  }

  return (
    <div className="login_register-page">
      <Link to="/" className="back-link">
        ← Back to home page
      </Link>

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
            <span className="required">Country</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              disabled={loadingCountries}
              className="country-select"
            >
              <option value="" disabled>
                {loadingCountries
                  ? "Loading countries..."
                  : "Select your country"}
              </option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="required">Date of Birth</span>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </label>

          <label>
            <span className="required"> Gender </span>
            <select
              value={gender}
              required
              onChange={(e) => setGender(e.target.value)}
              className="country-select"
            >
              <option value="" disabled>
                Gender
              </option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
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
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
