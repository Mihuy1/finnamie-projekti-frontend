import { useNavigate } from "react-router-dom";
import Map from "../components/Map";
import "../App.css";
import { useState, useRef, useEffect } from "react";
import { getActivities } from "../api/apiClient";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { municipalities } from "../data/municipalities";

function Home() {
  const [date, setDate] = useState([]);
  const [activeDate, setActiveDate] = useState(new Date());
  const [activityType] = useState("");
  const [activities, setActivites] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);

  const [location, setLocation] = useState("");
  const [searchError, setSearchError] = useState(false);
  const [dateError, setDateError] = useState(false);

  const mapSectionRef = useRef(null);
  const searchSectionRef = useRef(null);
  const navigate = useNavigate();

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
    setSearchError(false);
  };

  const scrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = () => {
    if (!location || selectedActivities.length === 0) {
      setSearchError(true);
      return;
    }

    setSearchError(false);
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
    setDateError(false);
  };

  const handleFinalAction = () => {
    if (!location || selectedActivities.length === 0) {
      setSearchError(true);
      searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (!date || (Array.isArray(date) && date.length === 0)) {
      setDateError(true);
      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const selectedActivityObject = activities.find(a => a.id === selectedActivities[0]);
    const initialCategory = selectedActivityObject ? selectedActivityObject.name : "All";

    navigate("/book-activity", {
      state: {
        initialLocation: location,
        initialDate: date,
        initialCategory: initialCategory
      }
    });
  };

  return (
    <div className="app">
      <section className="booking-section" ref={searchSectionRef}>
        <h1>Book your local experience</h1>
        <p>Find the perfect activity in your favorite location</p>

        <div className={`search-box ${searchError ? "search-box-error" : ""}`}>
          <div className="location-wrapper">
            <input
              type="text"
              list="municipalities-list"
              placeholder="Location"
              className={`location-input ${searchError && !location ? "input-error" : ""}`}
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setSearchError(false);
              }}
              onFocus={() => {
                if (location) setLocation("");
              }}
            />
            <datalist id="municipalities-list">
              {municipalities.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>

            {location && (
              <button
                type="button"
                className="clear-location-btn"
                onClick={() => setLocation("")}
              >
                ✕
              </button>
            )}
          </div>

          <select
            onChange={handleActivityChange}
            className={`activity-select ${searchError && selectedActivities.length === 0 ? "input-error" : ""}`}
          >
            <option value="">Choose an activity</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))}
          </select>

          <button onClick={handleSearch}>Search</button>
        </div>
        {
          searchError && (
            <p className="error-text-small" style={{ textAlign: 'center', marginTop: '15px' }}>
              Please select location and activity to continue
            </p>
          )
        }
      </section >

      <section className="info-section">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Search</h3>
            <p>Find a place or activity that fits you. Our discover page helps you find the best options.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Book</h3>
            <p>Choose your visiting dates on the calendar to view availability and complete your booking online.</p>
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

        <div className={`calendar-container ${dateError ? "calendar-error-style" : ""}`}>
          <h2>Choose your date</h2>
          <p className="calendar-subtitle">
            Check availability for your selected dates
          </p>

          <div className="calendar-nav">
            <button onClick={prevMonth}>&lsaquo;</button>
            <span style={{ fontWeight: 700, color: "#002f6c", fontSize: "16px" }}>
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
            selectRange={true}
            allowPartialRange={true}
            onActiveStartDateChange={({ activeStartDate }) =>
              setActiveDate(activeStartDate)
            }
            showNavigation={false}
          />
          {dateError && <p className="error-text-small">Please select dates to continue</p>}
        </div>
      </section>

      <div className="final-booking-action">
        <button className="book-now-large" onClick={handleFinalAction}>
          Find Activities
        </button>
      </div>

      <footer className="footer">
        <p>Finnamie</p>
      </footer>
    </div >
  );
}

export default Home;