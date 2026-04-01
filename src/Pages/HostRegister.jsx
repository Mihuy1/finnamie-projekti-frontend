import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getActivities,
  loadCountries,
  postLogin,
  register,
} from "../api/apiClient";
import isEmail from "validator/lib/isEmail";
import toast from "react-hot-toast";
import { useAuth } from "../auth/AuthContext";
import PhoneInput, { isPossiblePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function HostRegister() {
  const [activities, setActivites] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [halfDay, setHalfDay] = useState(false);
  const [fullDay, setFullDay] = useState(false);
  const [error, setError] = useState("");

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [description, setDescription] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [countries, setCountries] = useState([]);
  const { refresh } = useAuth();
  const [phoneError, setPhoneError] = useState("");
  const [strength, setStrength] = useState("");
  const [strengthColor, setStrengthColor] = useState("");

  const navigate = useNavigate();
  const maxDob = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".location-wrapper") &&
        !event.target.closest(".activity-wrapper")
      ) {
        setShowCountryDropdown(false);
        setShowGenderDropdown(false);
        setShowActivityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  useEffect(() => {
    const fetchActivites = async () => {
      try {
        const data = await getActivities();
        setActivites(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Haku epäonnistui:", error);
        setActivites([]);
      }
    };
    fetchActivites();
  }, []);

  const handleActivityChange = (e) => {
    const rawVal = e.target.value;
    if (!rawVal) return;
    const activityId = Number(rawVal);
    if (Number.isNaN(activityId)) return;
    if (!selectedActivities.includes(activityId)) {
      setSelectedActivities([...selectedActivities, activityId]);
    }
    e.target.value = "";
  };

  const handlePasswordChange = (val) => {
    setPassword(val);

    if (!val) {
      setStrength("");
      return;
    }

    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    if (score <= 1) {
      setStrength("Weak");
      setStrengthColor("#ff4d4d");
    } else if (score === 2 || score === 3) {
      setStrength("Moderate");
      setStrengthColor("#ffa500");
    } else {
      setStrength("Strong");
      setStrengthColor("#27ae60");
    }
  };

  const handlePhoneNumberInputChange = (value) => {
    const normalized = value || "";
    setPhoneNumber(normalized);

    if (!normalized) {
      setPhoneError("Phone number is required.");
      return;
    }

    if (!isPossiblePhoneNumber(normalized)) {
      setPhoneError("Please enter a valid phone number");
      return;
    }

    setPhoneError("");
  };

  const removeActivity = (activityId) => {
    setSelectedActivities(selectedActivities.filter((a) => a !== activityId));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (strength === "Weak") {
      setError("Password is too weak. Use at least 8 characters, including numbers or capital letters.");
      toast.error("Password is too weak.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isEmail(email)) {
      setError("Please enter a valid email!");
      return;
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    if (age < 18) {
      setError("You must be at least 18 years old to register as a host.");
      toast.error("Age limit: 18 years.");
      return;
    }

    if (selectedActivities.length === 0) {
      setError("Please select at least one activity.");
      return;
    }

    const experience_length =
      halfDay && fullDay
        ? "Both"
        : halfDay
          ? "Half-day"
          : fullDay
            ? "Full-day"
            : undefined;

    try {
      const res = await toast.promise(
        register({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          confirmPassword,
          role: "host",
          country,
          date_of_birth: dateOfBirth,
          gender: gender,
          phone_number: phoneNumber,
          street_address: streetAddress,
          postal_code: postalCode,
          city,
          description: description || undefined,
          experience_length,
          activity_ids: selectedActivities,
        }),
        {
          loading: "Registration pending...",
          success: "Registration successful!",
          error: (err) => {
            const msg = err.response?.data?.message || err.message || "";
            if (err.response?.status === 409 || msg.toLowerCase().includes("already exists")) {
              return "Email is already in use.";
            }
            return "Registration failed.";
          }
        },
      );

      if (res?.userId) {
        await postLogin(email, password);
        await refresh();
        setTimeout(() => {
          navigate("/profile");
        }, 1000);
      }
    } catch (err) {
      const statusCode = err.status || err.response?.status;

      const errorMessage = (
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        ""
      ).toLowerCase();

      const isEmailTaken =
        statusCode === 409 ||
        errorMessage.includes("already exists") ||
        errorMessage.includes("already in use") ||
        errorMessage.includes("taken") ||
        errorMessage.includes("unique violation");

      if (isEmailTaken) {
        setError("Email already in use. Please use another one or log in.");
        toast.error("This email is already registered.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
        console.log("Debug info - Status:", statusCode, "Message:", errorMessage);
      }
    }
  }

  return (
    <section className="host-page">
      <Link to="/" className="back-link">
        ← Back to homepage
      </Link>

      <h1>Become a Finnamie Host</h1>
      <p className="subtitle">
        Start sharing authentic experiences with travelers by becoming a host.
      </p>

      <form className="host-form" onSubmit={handleSubmit}>
        <h2>
          <span>Basic information</span>
        </h2>

        <label>
          <span className="required">First name</span>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>
        <label>
          <span className="required">Last name</span>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
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

        <label>
          <span className="required">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            required
          />
          {strength && (
            <div style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: strengthColor,
              marginTop: "4px",
              textAlign: "right"
            }}>
              {strength}
            </div>
          )}
        </label>

        <label>
          <span className="required">Confirm password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>

        <label>
          <span className="required">Phone number</span>
          <PhoneInput
            className="host-phone-input"
            placeholder="Enter phone number"
            defaultCountry="FI"
            value={phoneNumber}
            onChange={handlePhoneNumberInputChange}
            required
          />
          {phoneError && <p className="login_register-error">{phoneError}</p>}
        </label>

        <div className="address-grid">
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
            <span className="required">City</span>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="address-grid">
          <label>
            <span className="required">Postal Code</span>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
          </label>
          <label>
            <span className="required">Country</span>
            <div
              className={`location-wrapper-host ${showCountryDropdown ? "open" : ""}`}
            >
              <input
                type="text"
                placeholder={loadingCountries ? "Loading..." : "Select country"}
                className="location-input-host"
                value={country}
                onFocus={() => {
                  setShowGenderDropdown(false);
                  setShowActivityDropdown(false);
                  setFilteredCountries(
                    country
                      ? countries.filter((c) =>
                        c.toLowerCase().includes(country.toLowerCase()),
                      )
                      : countries,
                  );
                  setShowCountryDropdown(true);
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  setCountry(val);
                  setFilteredCountries(
                    countries.filter((c) =>
                      c.toLowerCase().includes(val.toLowerCase()),
                    ),
                  );
                }}
              />
              {country && (
                <button
                  type="button"
                  className="clear-location-btn"
                  onClick={() => {
                    setCountry("");
                    setShowCountryDropdown(false);
                  }}
                >
                  ✕
                </button>
              )}

              {showCountryDropdown && (
                <ul className="custom-dropdown">
                  {filteredCountries.map((c) => (
                    <li
                      key={c}
                      onMouseDown={() => {
                        setCountry(c);
                        setShowCountryDropdown(false);
                      }}
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </label>
        </div>

        <label>
          <span className="required">Date of birth</span>
          <input
            type="date"
            max={maxDob}
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </label>

        <label>
          <span className="required">Gender</span>
          <div
            className={`activity-wrapper-host ${showGenderDropdown ? "open" : ""}`}
          >
            <input
              type="text"
              className="activity-input-host"
              value={
                gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : ""
              }
              placeholder="Select gender"
              readOnly
              onClick={() => {
                setShowCountryDropdown(false);
                setShowActivityDropdown(false);
                setShowGenderDropdown(!showGenderDropdown);
              }}
            />
            {showGenderDropdown && (
              <ul className="custom-dropdown">
                {["female", "male", "other"].map((g) => (
                  <li
                    key={g}
                    onMouseDown={() => {
                      setGender(g);
                      setShowGenderDropdown(false);
                    }}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </label>
        <h2>
          <span className="required">Activities you offer</span>
        </h2>
        <p className="field-description">
          Select the types of activities you can provide to travelers.
        </p>

        <div
          className={`activity-wrapper-host ${showActivityDropdown ? "open" : ""}`}
          style={{ marginBottom: "20px" }}
        >
          <input
            type="text"
            className="activity-input-host"
            placeholder="-- Choose an activity --"
            readOnly
            onClick={() => {
              setShowCountryDropdown(false);
              setShowGenderDropdown(false);
              setShowActivityDropdown(!showActivityDropdown);
            }}
          />
          {showActivityDropdown && (
            <ul className="custom-dropdown">
              {activities
                .filter((act) => !selectedActivities.includes(act.id))
                .map((activity) => (
                  <li
                    key={activity.id}
                    onMouseDown={() => {
                      setSelectedActivities([
                        ...selectedActivities,
                        activity.id,
                      ]);
                      setShowActivityDropdown(false);
                    }}
                  >
                    {activity.name}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {selectedActivities.length > 0 && (
          <div className="selected-tags">
            {selectedActivities.map((activityId) => (
              <span key={activityId} className="tag">
                {activities.find((a) => a.id === activityId)?.name ??
                  activityId}
                <button
                  type="button"
                  onClick={() => removeActivity(activityId)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <h2>
          <span className="required">Experience length</span>
        </h2>
        <p className="field-description">
          Are you primarily able to offer half-day or full-day activities?
        </p>

        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={halfDay}
              onChange={(e) => setHalfDay(e.target.checked)}
            />{" "}
            Half-day
          </label>
          <label>
            <input
              type="checkbox"
              checked={fullDay}
              onChange={(e) => setFullDay(e.target.checked)}
            />{" "}
            Full-day
          </label>
        </div>

        <h2>Tell us about yourself (Optional)</h2>
        <p className="field-description">
          Is there anything else you'd like us to know? Feel free to share your
          hobbies or what else you have to offer.
        </p>
        <textarea
          rows={5}
          placeholder="Tell us about yourself..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {error && <p className="login_register-error">{error}</p>}

        <button type="submit">Send application</button>
      </form>
    </section>
  );
}
