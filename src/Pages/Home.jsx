import { Link, useNavigate } from "react-router-dom";
import Map from "../components/Map";
import "../App.css";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useAuth } from "../auth/AuthContext";

function Home() {
  const [date, setDate] = useState([]);
  const [activeDate, setActiveDate] = useState(new Date());
  const [activityType, setActivityType] = useState("");
  const { user, loading, isAuthed } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    console.log("Auth state:", { loading, isAuthed, user });
    if (user) console.log("Logged in as:", user.first_name, user.last_name);
  }, [loading, isAuthed, user]);

  const handleSearch = () => {
    navigate("/discover");
  };

  const nextMonth = () => {
    setActiveDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setActiveDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const handleDates = (value) => {
    if (!value) {
      setDate([]);
      return;
    }
    const values = Array.isArray(value) ? value : [value];
    setDate(values);
  };

  const handleActivityType = (e) => {
    setActivityType(e.target.value);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">Finnamie</div>
        <nav className="nav">
          {!user ? (
            <ul>
              <Link to="/discover">Discover activities</Link>
              <Link to="/host/register">Become a Host</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </ul>
          ) : (
            <p>
              {user.first_name} {user.last_name}
            </p>
          )}
        </nav>
      </header>

      <section className="booking-section">
        <h1>Book your local experience</h1>
        <p>Find trusted local hosts for authentic experiences.</p>

        <div className="search-box">
          <input type="text" placeholder="Location" />
          <input type="date" />
          <select>
            <option>Activity type</option>
          </select>
          <button onClick={handleSearch}>Search</button>
        </div>
      </section>

      <section className="map-and-calendar">
        <div className="map-container">
          <Map activityType={activityType} />
        </div>

        <div className="calendar-container">
          <h2>Choose your date</h2>
          <h2>
            <button onClick={prevMonth}>◀</button>
            {activeDate.toLocaleString("en-GB", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button onClick={nextMonth}>▶</button>
          <Calendar
            onChange={handleDates}
            value={date}
            activeStartDate={activeDate}
            selectRange
            onActiveStartDateChange={({ activeStartDate }) =>
              setActiveDate(activeStartDate)
            }
          />
          <select
            style={{
              marginTop: "16px",
              width: "100%",
              padding: "12px",
              borderRadius: "6px",
            }}
            onChange={handleActivityType}
          >
            <option value="">Activity type</option>
            <option value="halfday">Half-Day Experience</option>
            <option value="fullday">Full-Day Experience</option>
          </select>
          <button style={{ marginTop: "16px" }}>Book Now</button>
        </div>
      </section>

      <section className="info-section">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step">
            <h3>1. Search</h3>
            <p>Find a local host, place or activity that fits you.</p>
          </div>
          <div className="step">
            <h3>2. Book</h3>
            <p>Choose a time and book securely online.</p>
          </div>
          <div className="step">
            <h3>3. Experience</h3>
            <p>Enjoy Finland like a local.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>Finnamie</p>
      </footer>
    </div>
  );
}

export default Home;
