import { useEffect, useState } from "react";
import { getActivities } from "../api/apiClient";
import { Link } from "react-router-dom";

export default function Discover() {
    const [activities, setActivities] = useState([]);
    const [filteredActivities, setFilteredActivities] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);

    const [openActivity, setOpenActivity] = useState(null);

    const categories = ["All", "Nature & outdoors", "City tours", "Culture", "Wellness", "Food & Drink", "Sports"];

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
            description: "Experience the silence of Finnish nature in Nuuksio. Camp under the stars and enjoy a traditional Finnish campfire meal."
        },
        {
            id: 102,
            name: "Traditional Smoke Sauna",
            host: "Host 2",
            category: "Wellness",
            city: "Helsinki",
            image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format",
            experience_length: "Half-day",
            description: "Relax in an authentic Finnish smoke sauna."
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getActivities();
                const finalData = data && data.length > 0 ? data : placeholders;
                setActivities(finalData);
                setFilteredActivities(finalData);
            } catch (error) {
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
        setFilteredActivities(category === "All" ? activities : activities.filter(act => act.category === category));
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <section className="discover-page">
            <div className="navigation-header">
                <Link to="/" className="back-link">← Back to Booking</Link>
            </div>

            <header className="discover-header">
                <h1>Discover Finland</h1>
                <p>Explore authentic experiences hosted by locals.</p>
            </header>

            <div className="filter-container">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => handleFilter(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="activity-grid">
                {filteredActivities.map((activity) => (
                    <div key={activity.id} className="activity-card" onClick={() => setOpenActivity(activity)}>
                        <div className="card-image">
                            <img src={activity.image_url || "https://images.unsplash.com/photo-1516132217015-773f487235eb"} alt={activity.name} />
                            <span className="duration-badge">{activity.experience_length}</span>
                        </div>
                        <div className="card-content">
                            <span className="location-tag">📍 {activity.city}</span>
                            <h3>{activity.name}</h3>
                            <p className="category-text">{activity.category}</p>
                        </div>
                    </div>
                ))}
            </div>

            {openActivity && (
                <div className="modal-overlay" onClick={() => setOpenActivity(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setOpenActivity(null)}>×</button>

                        <div className="modal-image">
                            {/* TÄMÄ UUSI KOHTA: Kesto kuvan päällä */}
                            <span className="modal-duration-badge">{openActivity.experience_length}</span>

                            <img src={openActivity.image_url} alt={openActivity.name} />
                        </div>

                        <div className="modal-body">
                            <div className="modal-meta">
                                <span className="category-badge">{openActivity.category}</span>
                            </div>

                            <h2>{openActivity.name}</h2>
                            <p className="modal-host">Experience hosted by <strong>{openActivity.host}</strong></p>
                            <p className="modal-location">📍 {openActivity.city}</p>

                            <hr />

                            <h3>About the experience</h3>
                            <p className="modal-description">{openActivity.description || "No description available yet."}</p>

                            <div className="modal-actions">
                                <Link to="/" className="book-now-btn">Book this activity</Link>
                                <button className="close-btn" onClick={() => setOpenActivity(null)}>Go back</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}