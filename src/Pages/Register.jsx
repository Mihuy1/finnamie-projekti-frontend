import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadCountries, postLogin, register } from "../api/apiClient";
import toast from "react-hot-toast";
import { useAuth } from "../auth/AuthContext";
import { useLocation } from "react-router-dom";

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

  const [filteredCountries, setFilteredCountries] = useState([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  const { state } = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.location-wrapper-host') && !event.target.closest('.activity-wrapper-host')) {
        setShowCountryDropdown(false);
        setShowGenderDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

    try {
      const res = await toast.promise(
        register({
          first_name: firstName,
          last_name: lastName,
          email,
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

        if (state?.redirectTo) {
          navigate(state.redirectTo, {
            replace: true,
            state: { slot: state.bookingData }
          });
        } else {
          navigate("/profile", { replace: true });
        }
      }
    } catch (err) {
      console.error("Registration flow error:", err);
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
            <div className={`guest-wrapper ${showCountryDropdown ? 'open' : ''}`}>
              <input
                type="text"
                placeholder={loadingCountries ? "Loading..." : "Select country"}
                className="guest-input"
                value={country}
                onFocus={() => {
                  setShowGenderDropdown(false);
                  setFilteredCountries(country ? countries.filter(c => c.toLowerCase().includes(country.toLowerCase())) : countries);
                  setShowCountryDropdown(true);
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  setCountry(val);
                  setFilteredCountries(countries.filter(c => c.toLowerCase().includes(val.toLowerCase())));
                }}
              />
              {country && (
                <button type="button" className="guest-clear-btn" onClick={() => { setCountry(""); setShowCountryDropdown(false); }}>
                  ✕
                </button>
              )}
              {showCountryDropdown && (
                <ul className="guest-dropdown">
                  {filteredCountries.map((c) => (
                    <li key={c} onMouseDown={() => { setCountry(c); setShowCountryDropdown(false); }}>
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
            <span className="required">Gender</span>
            <div className={`guest-wrapper ${showGenderDropdown ? 'open' : ''}`}>
              <input
                type="text"
                className="guest-input"
                value={gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : ""}
                placeholder="Select gender"
                readOnly
                onClick={() => {
                  setShowCountryDropdown(false);
                  setShowGenderDropdown(!showGenderDropdown);
                }}
              />
              {showGenderDropdown && (
                <ul className="guest-dropdown">
                  {["female", "male", "other"].map((g) => (
                    <li key={g} onMouseDown={() => { setGender(g); setShowGenderDropdown(false); }}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
