import { useEffect, useState } from "react";
import { getActivities, getAllExperiencesWithHost } from "../api/apiClient";
import { Link, useLocation } from "react-router-dom";
import { TimeSlot } from "../components/Timeslot";

export default function Discover() {
  const { state } = useLocation();

  const [activities, setActivities] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState(state?.initialLocation || "");
  const [date, setDate] = useState(state?.initialDate || null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const API_BASE_URL = "http://localhost:3000";
  const FALLBACK_IMAGE = "https://placehold.co/600x400";

  const resolveImage = (path) => {
    if (!path) return FALLBACK_IMAGE;
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const placeholders = [
    {
      id: 101,
      name: "Nuuksio Camping",
      category: "Nature & outdoors",
      city: "Espoo",
      image_url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4",
      experience_length: "Full-day",
    },
    {
      id: 102,
      name: "Traditional Smoke Sauna",
      category: "Wellness",
      city: "Helsinki",
      image_url:
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format",
      experience_length: "Half-day",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [actData, slotData] = await Promise.all([
          getActivities(),
          getAllExperiencesWithHost(),
        ]);

        const finalActivities = actData?.length > 0 ? actData : placeholders;
        setActivities(finalActivities);
        setTimeSlots(slotData || []);
      } catch (error) {
        console.error("Virhe haettaessa dataa:", error);
        setActivities(placeholders);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let source = timeSlots.length > 0 ? timeSlots : placeholders;
    let result = [...source];

    if (location) {
      result = result.filter((item) =>
        item.city?.toLowerCase().includes(location.toLowerCase()),
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((item) => {
        if (item.activities) {
          return item.activities.some((act) => act.name === selectedCategory);
        }
        return (
          item.category === selectedCategory || item.name === selectedCategory
        );
      });
    }

    if (date && (Array.isArray(date) ? date.length > 0 : date)) {
      const d = Array.isArray(date) ? date : [date];
      const start = new Date(d[0]);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d[1] || d[0]);
      end.setHours(23, 59, 59, 999);

      result = result.filter((slot) => {
        const slotTime = new Date(slot.start_time);
        return slotTime >= start && slotTime <= end;
      });
    }

    setFilteredActivities(result);
  }, [location, selectedCategory, date, timeSlots]);

  useEffect(() => {
    document.body.style.overflow = selectedSlot ? "hidden" : "unset";
  }, [selectedSlot]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <section className="discover-page">
      <div className="navigation-header">
        <Link to="/" className="back-link">
          ← Back to Booking
        </Link>
      </div>

      <header className="discover-header">
        <h1>Available Activities</h1>
        <p>
          Explore experiences in {location || "Finland"} for your selected
          dates.
        </p>
      </header>

      <div className="filter-container">
        <button
          className={`filter-btn ${selectedCategory === "All" ? "active" : ""}`}
          onClick={() => setSelectedCategory("All")}
        >
          All
        </button>
        {[...new Set(activities.map((act) => act.name))].sort().map((name) => (
          <button
            key={name}
            className={`filter-btn ${selectedCategory === name ? "active" : ""}`}
            onClick={() => setSelectedCategory(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="activity-grid">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((item) => (
            <div
              key={item.id}
              className="activity-card"
              onClick={() => setSelectedSlot(item)}
            >
              <div className="card-image">
                <img
                  src={resolveImage(item.images?.[0]?.url || item.image_url)}
                  alt={item.name}
                />
                <span className="duration-badge">{item.experience_length}</span>
              </div>
              <div className="card-content">
                <span className="host-tag">
                  {item.first_name} {item.last_name}
                </span>
                <span className="location-tag">📍 {item.city}</span>
                <h3>{item.name}</h3>
                <p className="category-text">{item.category}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No activities found for these filters.
          </div>
        )}
      </div>

      {selectedSlot && (
        <TimeSlot
          slot={selectedSlot}
          activities={activities}
          canEdit={false}
          onClose={() => setSelectedSlot(null)}
          onDelete={() => {}}
          onUpdate={() => {}}
        />
      )}
    </section>
  );
}
