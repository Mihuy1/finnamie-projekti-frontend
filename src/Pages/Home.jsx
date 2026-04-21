// @ts-nocheck
import { useNavigate } from "react-router-dom";
import Map from "../components/Map";
import "../App.css";
import { useState, useRef, useEffect } from "react";
import { getActivities } from "../api/apiClient";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { municipalities } from "../data/municipalities";
import { getCityImage } from "../api/apiClient";

const cities = [
{ query: "Finland nature", name: "Finnish Nature", description: "Breathtaking landscapes and wilderness" },
{ query: "Finland city", name: "Finnish Cities", description: "Vibrant urban culture and architecture" },
{ query: "Finland winter", name: "Finnish Winter", description: "Magical snow and northern lights" },
{ query: "Finland summer", name: "Finnish Summer", description: "Midnight sun and endless lakes" },
{ query: "Finland landscape", name: "Finnish Landscapes", description: "Stunning scenery from north to south" },
{ query: "Finland nightlife", name: "Finnish Nightlife", description: "Vibrant social scene and entertainment options" },
{ query: "Finland art", name: "Finnish Art", description: "Innovative art scene and world-class museums" },
{ query: "Finland design", name: "Finnish Design", description: "Renowned design heritage and contemporary creativity" },
{ query: "Finland culture", name: "Finnish Culture", description: "Rich traditions and unique cultural experiences" },
{ query: "Finland saunas", name: "Finnish Saunas", description: "Traditional Finnish sauna culture and wellness experiences" },
{ query: "Finland festivals", name: "Finnish Festivals", description: "Vibrant festivals celebrating music, culture, and traditions" },
{ query: "Finland food", name: "Finnish Food", description: "Unique flavors and culinary traditions" },
{ query: "Finland wildlife", name: "Finnish Wildlife", description: "Diverse wildlife and nature encounters" },
{ query: "Finland lakes", name: "Finnish Lakes", description: "Serene lakes and water activities" },
];

function Home() {
  const [date, setDate] = useState([]);
  const [activeDate, setActiveDate] = useState(new Date());
  const [activityType] = useState("");
  const [activities, setActivites] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);

  const [location, setLocation] = useState("");
  const [searchError, setSearchError] = useState(false);
  const [dateError, setDateError] = useState(false);

  const calendarSectionRef = useRef(null);
  const searchSectionRef = useRef(null);
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredMunicipalities, setFilteredMunicipalities] = useState([]);

  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [activitySearch, setActivitySearch] = useState("");

  // kuvakaruselli
const [active, setActive] = useState(0);
const [animating, setAnimating] = useState(false);
const [cityImage, setCityImage] = useState(null);

const goTo = (index) => {
  if (animating || index === active) return;
  setAnimating(true);
  setTimeout(() => {
    setActive(index);
    setAnimating(false);
  }, 250);
};

const next = () => goTo((active + 1) % cities.length);
const prev = () => goTo((active - 1 + cities.length) % cities.length);



useEffect(() => {
  setCityImage(null);
  getCityImage(cities[active].query).then((url) => setCityImage(url));
}, [active]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".location-wrapper") &&
        !event.target.closest(".activity-wrapper")
      ) {
        setShowDropdown(false);
        setShowActivityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    setSearchError(false);
  };

  const scrollToCalendar = () => {
    calendarSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = () => {
    if (selectedActivities.length === 0) {
      setSearchError(true);
      return;
    }

    setSearchError(false);
    scrollToCalendar();
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
    if (selectedActivities.length === 0) {
      setSearchError(true);
      searchSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (!date || (Array.isArray(date) && date.length === 0)) {
      setDateError(true);
      calendarSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const selectedActivityObject = activities.find(
      (a) => a.id === selectedActivities[0],
    );
    const initialCategory = selectedActivityObject
      ? selectedActivityObject.name
      : "All";

    navigate("/book-activity", {
      state: {
        initialLocation: location,
        initialDate: date,
        initialCategory: initialCategory,
      },
    });
  };

  return (
    <div className="app">
      <section className="booking-section" ref={searchSectionRef}>
        <h1>Book your local experience</h1>
        <p>Discover unique activities for your stay and start exploring</p>

        <div className={`search-box ${searchError ? "search-box-error" : ""}`}>
          <div
            className={`activity-wrapper ${showActivityDropdown ? "open" : ""}`}
            style={{ flex: 1 }}
          >
            <input
              type="text"
              placeholder="Choose an activity"
              className="activity-input"
              value={activitySearch}
              readOnly
              onClick={(e) => {
                e.stopPropagation();
                setShowActivityDropdown(!showActivityDropdown);
              }}
            />

            {showActivityDropdown && (
              <ul className="custom-dropdown">
                {activities.map((activity) => (
                  <li
                    key={activity.id}
                    onMouseDown={() => {
                      handleActivityChange({ target: { value: activity.id } });
                      setActivitySearch(activity.name);
                      setShowActivityDropdown(false);
                    }}
                  >
                    {activity.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button className="search-main-btn" onClick={handleSearch}>
            Search
          </button>
        </div>

        {searchError && (
          <p className="error-text-small" style={{ margin: "0" }}>
            Please select an activity to continue
          </p>
        )}
      </section>

      <section className="info-section">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Search</h3>
            <p>
              Find an activity that fits you. Our discover page helps you find
              the best options.
            </p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Book</h3>
            <p>
              Choose your visiting dates on the calendar to view availability
              and complete your booking online.
            </p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Experience</h3>
            <p>Enjoy Finland like a local.</p>
          </div>
        </div>
      </section>

      <section className="map-and-calendar" ref={calendarSectionRef}>
        <div className="map-container">
          <Map activityType={activityType} />
        </div>

        <div
          className={`calendar-container ${dateError ? "calendar-error-style" : ""}`}
        >
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
            selectRange={true}
            allowPartialRange={true}
            onActiveStartDateChange={({ activeStartDate }) =>
              setActiveDate(activeStartDate)
            }
            showNavigation={false}
          />
          {dateError && (
            <p className="error-text-small">Please select dates to continue</p>
          )}
        </div>
      </section>
{/* Kuvakaruselli */}
<section className="carousel-section">
  <div className="carousel-heading">
    <h2>Explore Finland</h2>
    <p>Discover unique experiences across Finnish cities</p>
  </div>
  <div className="carousel-wrapper">
    <button className="carousel-btn" onClick={prev} aria-label="Previous">
      ‹
    </button>

    <div
      className={`carousel-card ${animating ? "fading" : ""}`}
      style={{
        background: cityImage
          ? `url(${cityImage}) center/cover no-repeat`
          : "#1a2b5f",
      }}
    >
      <div className="carousel-card-overlay">
        <h3>{cities[active].name}</h3>
        <p>{cities[active].description}</p>
      </div>
    </div>

    <button className="carousel-btn" onClick={next} aria-label="Next">
      ›
    </button>
  </div>
</section>

      <div className="final-booking-action">
        <button className="book-now-large" onClick={handleFinalAction}>
          Find Activities
        </button>
      </div>

      <footer className="footer">
        <div className="footer-links">
          <a
            href="https://www.finnamie.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Finnamie
          </a>
          <a
            href="https://www.instagram.com/finnamie_finnishlife/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            href="https://www.finnamie.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
        </div>

        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} Finnamie
        </p>
      </footer>
    </div>
  );
}

export default Home;