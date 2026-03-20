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
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function HostRegister() {
  const [activities, setActivites] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]); // activity IDs
  const [halfDay, setHalfDay] = useState(false);
  const [fullDay, setFullDay] = useState(false);
  const [error, setError] = useState("");

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

  const removeActivity = (activityId) => {
    setSelectedActivities(selectedActivities.filter((a) => a !== activityId));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isEmail(email)) {
      setError("Please enter a valid email!");
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
            onChange={(e) => setPassword(e.target.value)}
            required
          />
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
          {/* <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          /> */}
          <PhoneInput
            className="host-phone-input"
            placeholder="Enter phone number"
            defaultCountry="FI"
            value={phoneNumber}
            onChange={setPhoneNumber}
            required
          />
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
        </div>

        <label>
          <span className="required">Date of birth</span>
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

        <h2>
          <span className="required">Activities you offer</span>
        </h2>
        <p className="field-description">
          Select the types of activities you can provide to travelers.
        </p>

        <select onChange={handleActivityChange}>
          <option value="">-- Choose an activity --</option>

          {Array.isArray(activities) &&
            activities
              .filter((act) => !selectedActivities.includes(act.id))
              .map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
        </select>

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
