import { Link, useNavigate } from "react-router-dom";
import Map from "../components/Map";
import "../App.css";
import { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

function Home() {
    const [date, setDate] = useState(new Date());

    const navigate = useNavigate();

    const handleSearch = () => {
        navigate("/discover");
    };

    return (
        <div className="app">
            <header className="header">
                <div className="logo">Finnamie</div>
                <nav className="nav">
                    <Link to="/discover">Discover activities</Link>
                    <Link to="/host/register">Become a Host</Link>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </nav>
            </header>

            <section className="booking-section">
                <h1>Book your local experience</h1>
                <p>
                    Find trusted local hosts for authentic experiences.
                </p>

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
                    <Map />
                </div>

                <div className="calendar-container">
                    <h2>Choose your date</h2>
                    <Calendar
                        onChange={setDate}
                        value={date}
                    />
                    <select style={{ marginTop: '16px', width: '100%', padding: '12px', borderRadius: '6px' }}>
                        <option value="">Activity type</option>
                        <option value="half-day">Half-Day Experience</option>
                        <option value="full-day">Full-Day Experience</option>
                    </select>
                    <button style={{ marginTop: '16px' }}>Book Now</button>
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
