
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getActivities, register } from "../api/apiClient";
import isEmail from "validator/lib/isEmail";

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
  const [description, setDescription] = useState("");

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

    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        confirmPassword,
        role: "host",
        country,
        date_of_birth: dateOfBirth,
        phone_number: phoneNumber,
        street_address: streetAddress,
        postal_code: postalCode,
        city,
        description: description || undefined,
        experience_length,
        activity_ids: selectedActivities,
      });

      alert("Registration successful!");
    } catch (error) {
      setError(error?.message || "Registration failed.");
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
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
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
            <span className="required">Postal Code</span>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="address-grid">
          <label>
            <span className="required">City</span>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </label>
          <label>
            <span className="required">Country</span>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
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

        <h2>
          <span className="required">Activities you offer</span>
        </h2>
        <p className="field-description">
          Select the types of activities you can provide to travelers.
        </p>

        <select onChange={handleActivityChange}>
          <option value="">-- Choose an activity --</option>

          {Array.isArray(activities) && activities.map((activity) => (
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
          rows="5"
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