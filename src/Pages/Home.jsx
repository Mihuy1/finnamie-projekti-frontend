import { Link } from "react-router-dom";
import Map from "../components/Map";
import "../App.css";
import { useState, useRef, useEffect } from "react";
import { getActivities } from "../api/apiClient";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useAuth } from "../auth/AuthContext";
import { municipalities } from "../data/municipalities";

function Home() {
  const [date, setDate] = useState([]);
  const [activeDate, setActiveDate] = useState(new Date());
  const [activityType, setActivityType] = useState("");
  const { user } = useAuth();
  const [activities, setActivites] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);

  const mapSectionRef = useRef(null);

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
      <section className="booking-section">
        <h1>Book your local experience</h1>
        <p>Find trusted local hosts for authentic experiences.</p>

        <div className="search-box">
          <input
            type="text"
            list="municipalities-list"
            placeholder="Location"
            className="location-input"
          />
          <datalist id="municipalities-list">
            {municipalities.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>

          <select onChange={handleActivityChange}>
            <option value="">Choose an activity</option>

            {Array.isArray(activities) &&
              activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
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
          <p className="calendar-subtitle">
            Check availability for your selected dates
          </p>

          <div className="calendar-nav">
            <button onClick={prevMonth}>&lsaquo;</button>
            <span
              style={{ fontWeight: 700, color: "#002f6c", fontSize: "16px" }}
            >
              {activeDate.toLocaleString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button onClick={nextMonth}>&rsaquo;</button>
          </div>

          <Calendar
            onChange={handleDates}
            value={date}
            activeStartDate={activeDate}
            selectRange
            onActiveStartDateChange={({ activeStartDate }) =>
              setActiveDate(activeStartDate)
            }
            showNavigation={false}
          />
        </div>
      </section>

      <div className="final-booking-action">
        <Link to="/book-activity">
          <button className="book-now-large">Find Activities</button>
        </Link>
      </div>

      <footer className="footer">
        <p>Finnamie</p>
      </footer>
    </div>
  );
}

export default Home;
