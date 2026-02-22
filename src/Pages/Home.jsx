import { Link, useNavigate } from "react-router-dom";
import Map from "../components/Map";
import "../App.css";
import { useEffect, useState, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useAuth } from "../auth/AuthContext";
import { Chatbox } from "../components/Chatbox";

function Home() {
  const [date, setDate] = useState([]);
  const [activeDate, setActiveDate] = useState(new Date());
  const [activityType, setActivityType] = useState("");
  const { user, loading, isAuthed } = useAuth();
  const [openChat, setOpenChat] = useState(false);
  const navigate = useNavigate();

  const mapSectionRef = useRef(null);

  const scrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = () => {
    scrollToMap();
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
            <>
              <Link to="/discover">Discover activities</Link>
              <Link to="/profile">
                {user.first_name} {user.last_name}{" "}
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="booking-section">
        <button
          className="chat-launcher"
          aria-label="Open chat"
          onClick={() => setOpenChat(true)}
        >
          Chat
        </button>
        {openChat && <Chatbox closeChat={() => setOpenChat(false)} />}

        <h1>Book your local experience</h1>
        <p>Find trusted local hosts for authentic experiences.</p>

        <div className="search-box">
          <input type="text" placeholder="Location" />

          <select>
            <option>Activity type</option>
            <option>Nature</option>
            <option>Culture</option>
            <option>Wellness</option>
          </select>

          <select value={activityType} onChange={handleActivityType}>
            <option value="">Duration</option>
            <option value="halfday">Half-Day</option>
            <option value="fullday">Full-Day</option>
          </select>
          <button onClick={handleSearch}>Search</button>
        </div>
      </section>

      <section className="info-section">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Search</h3>
            <p>Find a local host, place or activity that fits you.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Book</h3>
            <p>Choose a time and book securely online.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Experience</h3>
            <p>Enjoy Finland like a local.</p>
          </div>
        </div>
      </section>

      <section className="map-and-calendar" ref={mapSectionRef}>
        <div className="map-container">
          <Map activityType={activityType} />
        </div>

        <div className="calendar-container">
          <h2>Choose your date</h2>
          <p className="calendar-subtitle">Check availability for your selected dates</p>

          <div className="calendar-nav">
            <button onClick={prevMonth}>&lsaquo;</button>
            <span style={{ fontWeight: 700, color: '#002f6c', fontSize: '16px' }}>
              {activeDate.toLocaleString("en-GB", { month: "long", year: "numeric" })}
            </span>
            <button onClick={nextMonth}>&rsaquo;</button>
          </div>

          <Calendar
            onChange={handleDates}
            value={date}
            activeStartDate={activeDate}
            selectRange
            onActiveStartDateChange={({ activeStartDate }) => setActiveDate(activeStartDate)}
            showNavigation={false}
          />
        </div>
      </section>

      <div className="final-booking-action">
        <button className="book-now-large">
          Book Now
        </button>
      </div>

      <footer className="footer">
        <p>Finnamie</p>
      </footer>
    </div>
  );
}

export default Home;