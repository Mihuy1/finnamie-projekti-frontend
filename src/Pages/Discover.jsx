import { useEffect, useState } from "react";
import { getActivities, getAllTimeSlotsWithHost } from "../api/apiClient";
import { Link } from "react-router-dom";
import { Carousel } from "../components/Carousel";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { TimeSlot } from "../components/Timeslot";

export default function Discover() {
  const [activities, setActivities] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const [selectedSlot, setSelectedSlot] = useState(null);

  const API_BASE_URL = "http://localhost:3000";
  const FALLBACK_IMAGE = "https://placehold.co/600x400";

  const resolveImage = (path) => {
    if (!path) return FALLBACK_IMAGE;
    if (path.startsWith("http://")) return path;
    if (path.startsWith("/")) return API_BASE_URL + path;
    return API_BASE_URL + "/" + path;
  };

  // koska tietokanta vielä tyhjä
  const placeholders = [
    {
      id: 101,
      name: "Nuuksio Camping",
      host: "Host 1",
      category: "Nature & outdoors",
      city: "Espoo",
      image_url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4",
      experience_length: "Full-day",
      description:
        "Experience the silence of Finnish nature in Nuuksio. Camp under the stars and enjoy a traditional Finnish campfire meal.",
    },
    {
      id: 102,
      name: "Traditional Smoke Sauna",
      host: "Host 2",
      category: "Wellness",
      city: "Helsinki",
      image_url:
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format",
      experience_length: "Half-day",
      description: "Relax in an authentic Finnish smoke sauna.",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getActivities();

        const timeslotData = await getAllTimeSlotsWithHost();

        setTimeSlots(timeslotData);
        const finalData = data && data.length > 0 ? data : placeholders;
        setActivities(finalData);
        setFilteredActivities(timeslotData);
      } catch (error) {
        console.error(error);
        setActivities(placeholders);
        setFilteredActivities(placeholders);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilter = (category) => {
    setSelectedCategory(category);

    if (category === "All") {
      setFilteredActivities(timeSlots.length > 0 ? timeSlots : placeholders);
    } else {
      const source = timeSlots.length > 0 ? timeSlots : placeholders;

      const filtered = source.filter((item) => {
        if (item.activities) {
          return item.activities.some((act) => act.name === category);
        }
        return item.category === category;
      });

      setFilteredActivities(filtered);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <section className="discover-page">
      <div className="navigation-header">
        <Link to="/" className="back-link">
          ← Back to Booking
        </Link>
      </div>

      <header className="discover-header">
        <h1>Discover Finland</h1>
        <p>Explore authentic experiences hosted by locals.</p>
      </header>

      <div className="filter-container">
        <button
          key="all"
          className={`filter-btn ${selectedCategory === "All" ? "active" : ""}`}
          onClick={() => handleFilter("All")}
        >
          All
        </button>
        {[...new Set(activities.map((act) => act.name))]
          .sort()
          .map((categoryName) => (
            <button
              key={categoryName}
              className={`filter-btn ${selectedCategory === categoryName ? "active" : ""}`}
              onClick={() => handleFilter(categoryName)}
            >
              {categoryName}
            </button>
          ))}
      </div>

      <div className="activity-grid">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className="activity-card"
            onClick={() => setSelectedSlot(activity)}
          >
            <div className="card-image">
              <img
                src={resolveImage(activity.images[0]?.url)}
                alt={activity.name}
              />
              <span className="duration-badge">
                {activity.experience_length}
              </span>
            </div>
            <div className="card-content">
              <span className="location-tag">📍 {activity.city}</span>
              <h3>{activity.name}</h3>
              <p className="category-text">{activity.category}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedSlot && (
        <TimeSlot
          slot={selectedSlot}
          activities={activities}
          canEdit={false}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </section>
  );
}
