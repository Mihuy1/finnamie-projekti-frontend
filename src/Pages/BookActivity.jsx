// @ts-nocheck
import { useEffect, useState } from "react";
import { getActivities, getAllExperiencesWithHost } from "../api/apiClient";
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
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [filteredMunicipalities, setFilteredMunicipalities] = useState(municipalities);

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
        const handleClickOutside = (event) => {
            if (!event.target.closest('.location-wrapper')) {
                setShowLocationDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [actData, slotData] = await Promise.all([
                    getActivities(),
                    getAllExperiencesWithHost(),
                ]);

                setActivities(actData?.length > 0 ? actData : placeholders);
                setTimeSlots(slotData || []);
            } catch (error) {
                console.error("Haku epäonnistui:", error);
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
                item.city?.toLowerCase().includes(location.toLowerCase())
            );
        }

        if (selectedCategory !== "All") {
            result = result.filter((item) => {
                if (item.activities) {
                    return item.activities.some((act) => act.name === selectedCategory);
                }
                return item.category === selectedCategory || item.name === selectedCategory;
            });
        }

        if (date && (Array.isArray(date) ? date.length > 0 : date)) {
            const d = Array.isArray(date) ? date : [date];
            const start = new Date(d[0]); start.setHours(0, 0, 0, 0);
            const end = new Date(d[1] || d[0]); end.setHours(23, 59, 59, 999);

            result = result.filter((slot) => {
                const slotTime = new Date(slot.start_time);
                return slotTime >= start && slotTime <= end;
            });
        }

        setFilteredActivities(result);
    }, [location, selectedCategory, date, timeSlots]);

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
                    <div className="location-wrapper-booking" style={{ position: 'relative', width: '100%' }}>
                        <input
                            type="text"
                            className="filter-input"
                            placeholder="Change location"
                            value={location}
                            onFocus={() => {
                                setFilteredMunicipalities(location ? municipalities.filter(m => m.toLowerCase().includes(location.toLowerCase())) : municipalities);
                                setShowLocationDropdown(true);
                            }}
                            onChange={(e) => {
                                const val = e.target.value;
                                setLocation(val);
                                setFilteredMunicipalities(municipalities.filter(m => m.toLowerCase().includes(val.toLowerCase())));
                                setShowLocationDropdown(true);
                            }}
                        />

                        {location && (
                            <button
                                type="button"
                                className="clear-location-btn-booking"
                                onClick={() => {
                                    setLocation("");
                                    setShowLocationDropdown(false);
                                }}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#999',
                                    fontSize: '16px',
                                    zIndex: 2,
                                    padding: '2px 5px',
                                    borderRadius: '50%'
                                }}
                            >
                                ✕
                            </button>
                        )}

                        {showLocationDropdown && filteredMunicipalities.length > 0 && (
                            <ul className="custom-dropdown" >
                                {filteredMunicipalities.map((m) => (
                                    <li
                                        key={m}
                                        onMouseDown={() => {
                                            setLocation(m);
                                            setShowLocationDropdown(false);
                                        }}
                                        style={{
                                            padding: '10px 15px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            borderBottom: '1px solid rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        {m}
                                    </li>
                                ))}
                            </ul>
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
                    filteredActivities.map((item) => (
                        <div
                            key={item.id}
                            className="activity-card"
                            onClick={() => handleSlotClick(item)}
                        >
                            <div className="card-image">
                                <img
                                    src={resolveImage(item.images?.[0]?.url || item.image_url)}
                                    alt={item.title || item.name}
                                />
                                <span className="duration-badge">
                                    {item.experience_length}
                                </span>
                            </div>

                            <span className="profile-timeslot-pill discover">
                                {item.type === "halfday" ? "Half Day" : "Full Day"}
                            </span>

                            <div className="card-content">
                                <span className="host-tag">
                                    {item.first_name} {item.last_name}
                                </span>
                                <span className="location-tag">📍 {item.city}</span>
                                <h3>{item.title || item.name}</h3>
                                <p className="category-text">{item.category}</p>
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
