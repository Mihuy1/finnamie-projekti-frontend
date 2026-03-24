import { useEffect, useState } from "react";
import { getActivities, getAllTimeSlotsWithHost } from "../api/apiClient";
import { Link, useLocation } from "react-router-dom";
import { TimeSlot } from "../components/Timeslot";
import { municipalities } from '../data/municipalities';
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";


export default function BookActivity() {
    const { state } = useLocation();
    const [activities, setActivities] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [filteredActivities, setFilteredActivities] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(state?.initialCategory || "All");
    const [loading, setLoading] = useState(true);
    const [activeDate, setActiveDate] = useState(new Date());
    const [location, setLocation] = useState(state?.initialLocation || "");
    const [date, setDate] = useState(state?.initialDate || null);
    const [showCalendar, setShowCalendar] = useState(false);

    const [selectedSlot, setSelectedSlot] = useState(null);

    const API_BASE_URL = "http://localhost:3000";
    const FALLBACK_IMAGE = "https://placehold.co/600x400";

    const resolveImage = (path) => {
        if (!path) return FALLBACK_IMAGE;
        if (path.startsWith("http://")) return path;
        if (path.startsWith("https://")) return path;
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
                console.log("timeslots with host:", timeslotData);
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


    useEffect(() => {
        if (selectedSlot) {
            document.body.style.overflow = "hidden";
            document.body.style.paddingRight = "0px";
        } else {
            document.body.style.overflow = "unset";
            document.body.style.paddingRight = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
            document.body.style.paddingRight = "unset";
        };
    }, [selectedSlot]);

    useEffect(() => {
        let source = timeSlots.length > 0 ? timeSlots : placeholders;
        let result = [...source];

        if (location) {
            result = result.filter(item =>
                item.city?.toLowerCase().includes(location.toLowerCase())
            );
        }

        if (selectedCategory !== "All") {
            result = result.filter(slot => {
                if (slot.activities && Array.isArray(slot.activities)) {
                    return slot.activities.some(act => act.name === selectedCategory);
                }
                return slot.category === selectedCategory || slot.name === selectedCategory;
            });
        }

        if (date && (Array.isArray(date) ? date.length > 0 : date)) {
            const d = Array.isArray(date) ? date : [date];
            const searchStart = new Date(d[0]);
            searchStart.setHours(0, 0, 0, 0);
            const searchEnd = new Date(d[1] || d[0]);
            searchEnd.setHours(23, 59, 59, 999);

            result = result.filter(slot => {
                const slotStart = new Date(slot.start_time);
                return slotStart >= searchStart && slotStart <= searchEnd;
            });
        }

        setFilteredActivities(result);
    }, [location, selectedCategory, date, timeSlots]);

    const handleSlotClick = (activity) => {
        setSelectedSlot(activity);
    };

    const handleFilter = (category) => {
        setSelectedCategory(category);
    };

    const handleDates = (value) => {
        if (!value) {
            setDate([]);
            return;
        }
        const values = Array.isArray(value) ? value : [value];
        setDate(values);
    };

    const resetFilters = () => {
        setLocation("");
        setDate(null);
        setSelectedCategory("All");
        setShowCalendar(false);
        setFilteredActivities(timeSlots.length > 0 ? timeSlots : placeholders);
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <section className="discover-page">
            <div className="navigation-header">
                <Link to="/" className="back-link">
                    ← Back to Booking
                </Link>
            </div>

            <div className="discover-filter-bar">
                <div className="filter-group">
                    <label className="filter-label">Location</label>
                    <div className="location-wrapper" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="filter-input"
                            placeholder="Change location"
                            list="discover-municipalities-list"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onFocus={(e) => {
                                if (location) setLocation("");
                            }}
                        />
                        <datalist id="discover-municipalities-list">
                            {municipalities.map((m) => (
                                <option key={m} value={m} />
                            ))}
                        </datalist>

                        {location && (
                            <button
                                type="button"
                                className="clear-location-btn"
                                onClick={() => setLocation("")}
                                style={{
                                    position: 'absolute',
                                    right: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#999',
                                    fontSize: '18px'
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>



                <div className="filter-group border-left" style={{ position: 'relative' }}>
                    <label className="filter-label">Change date</label>
                    <button
                        className="filter-input-button"
                        onClick={() => setShowCalendar(!showCalendar)}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '10px 0',
                            textAlign: 'left',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '14px'
                        }}
                    >
                        {date && Array.isArray(date) && date.length > 0
                            ? `${new Date(date[0]).toLocaleDateString()} ${date[1] ? '- ' + new Date(date[1]).toLocaleDateString() : ''}`
                            : "Select dates"}
                    </button>

                    {showCalendar && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            zIndex: 1000,
                            background: 'white',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            borderRadius: '8px',
                            padding: '10px'
                        }}>
                            <Calendar
                                onChange={(val) => {
                                    handleDates(val);
                                    if (Array.isArray(val) && val[1]) setShowCalendar(false);
                                }}
                                value={date}
                                selectRange={true}
                                allowPartialRange={true}
                            />
                            <button
                                onClick={() => setShowCalendar(false)}
                                style={{ width: '100%', marginTop: '10px', padding: '5px', cursor: 'pointer' }}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>

                <div className="filter-actions">
                    <button className="show-all-btn" onClick={resetFilters}>
                        Reset Filters
                    </button>
                </div>
            </div>

            <header className="discover-header">
                <h1>Available Activities</h1>
                <p>Choose an activity for your selected dates and location</p>
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
                {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => (
                        <div
                            key={activity.id}
                            className="activity-card"
                            onClick={() => handleSlotClick(activity)}
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
                            <span className="profile-timeslot-pill discover">
                                {activity.type === "halfday" ? "Half Day" : "Full Day"}
                            </span>
                            <div className="card-content">
                                <span className="host-tag">
                                    {activity.first_name} {activity.last_name}
                                </span>
                                <span className="location-tag">📍 {activity.city}</span>
                                <h3>{activity.name}</h3>
                                <p className="category-text">{activity.category}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results-container">
                        <div className="no-results-content">
                            <span style={{ fontSize: '50px' }}>🔍</span>
                            <h3>No activities found</h3>
                            <p>We couldn't find anything matching your current filters.</p>
                            <p>Try changing your location or dates.</p>
                            <button onClick={resetFilters} className="reset-all-btn">
                                Show all activities
                            </button>
                        </div>
                    </div>
                )}
            </div>


            {
                selectedSlot && (
                    <TimeSlot
                        slot={selectedSlot}
                        activities={activities}
                        canEdit={false}
                        onClose={() => setSelectedSlot(null)}
                    />
                )
            }
        </section >

    );
}
