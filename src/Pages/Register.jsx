import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/apiClient";
import toast from "react-hot-toast";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [country2, setCountryIso2] = useState("Fi");
  const [dialCode, setDialCode] = useState("358");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("+358");
  const navigate = useNavigate();

  
  const stripLeadingCountryCode = (value) => {
    return value.replace(/^\+\d+/, "");
  };

  
   const handleCountryChange = (_value, meta) => {
    const newIso2 = meta.country.iso2;
    const newDial = meta.country.dialCode;

    const rest = stripLeadingCountryCode(phone);
    setCountryIso2(newIso2);
    setCountry(newIso2.toUpperCase());
    setDialCode(newDial);
    setPhone(`+${newDial}${rest}`);

    // Sulkee dropdownin 
    setTimeout(() => {
      document.activeElement?.blur();
    }, 0);
  };

  // Phone number kenttä
  const handlePhoneInputChange = (e) => {
    const inputVal = e.target.value;
    const prefix = `+${dialCode}`;
    
    if (!inputVal.startsWith(prefix)) {
      setPhone(prefix);
    } else {
      const numberPart = inputVal.replace(prefix, '').replace(/\D/g, '');
      setPhone(prefix + numberPart);
    }
  };
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    await toast.promise(
      register({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,   
        country, 
        date_of_birth: dateOfBirth,
        password,
        confirmPassword: confirm,
        role: "guest",
      }),
      {
        pending: "Registering account...",
        success: "Account created successfully!",
        error: (err) => err?.message || "Registration failed.",
      }
    );

    setTimeout(() => {
      navigate("/login");
    }, 1000);
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
            <span className="required">Street Address</span>
            <input
              type="text"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              required
            />
          </label>

          <label>
            <span className="required">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

{/*Country code*/} 
<label>
  <span className="required">Country code</span>
  <PhoneInput
    value={`+${dialCode}`}
    defaultCountry="fi"
    country={country2}
    onChange={handleCountryChange}
    disableCountryGuess  
    inputProps={{
      readOnly: true,
      tabIndex: -1, 
    }}
  />
</label>

          {/*Phone number*/}
          <label>
            <span className="required">Phone number</span>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneInputChange}
              placeholder={`+${dialCode}...`}
              required
            />
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