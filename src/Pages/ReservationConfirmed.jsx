// @ts-nocheck
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";
import { useEffect, useState } from "react";

function ReservationConfirmed() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [showToast, setShowToast] = useState(false);

    const reservation = state?.reservation || {};
    const slot = state?.slot || {};
    const host = state?.host || {};

    const getStartTime = () => {
        if (slot.rule?.start_date) {
            return `${slot.rule.start_date}T${slot.rule.start_time}`;
        }
        return slot.start_time;
    };

    const getEndTime = () => {
        if (slot.rule?.end_date) {
            return `${slot.rule.end_date}T${slot.rule.end_time}`;
        }
        return slot.end_time;
    };

    const formatDate = (dateInput) => {
        if (!dateInput) return "";
        const date = new Date(dateInput);
        if (isNaN(date)) return "Date not found";
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const formatTime = (dateInput) => {
        if (!dateInput) return "";
        const date = new Date(dateInput);
        if (isNaN(date)) return "";
        return date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const hostDisplayName = host.first_name
        ? `${host.first_name} ${host.last_name}`
        : (slot.host_first_name ? `${slot.host_first_name} ${slot.host_last_name}` : "Local Host");

    useEffect(() => {
        window.scrollTo(0, 0);
        if (state?.fromBooking) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        }
    }, [state]);

    const handleNavigation = (targetPath) => {
        if (targetPath === "/profile") {
            navigate("/profile#reservations");
        } else {
            navigate(targetPath);
        }
    };

    return (
        <div className="app">
            {showToast && (
                <div className="booking-toast">
                    ✅ Booking request sent to {hostDisplayName}! Check your conversations for updates.
                </div>
            )}
            <div className="app confirmation-page-wrapper">
                <section className="confirmation-section">
                    <div className="success-icon" style={{ fontSize: '64px' }}>✅</div>

                    <h1>Booking Requested!</h1>
                    <p>Your request has been sent to the host for approval.</p>

                    <div className="confirmation-card">
                        <h3>Booking Summary</h3>
                        <div className="conf-row">
                            <strong>Activity</strong>
                            <span>{slot.title || slot.name || "Local Activity"}</span>
                        </div>
                        <div className="conf-row">
                            <strong>Date</strong>
                            <span>{formatDate(getStartTime())}</span>
                        </div>
                        <div className="conf-row">
                            <strong>Time</strong>
                            <span>
                                {formatTime(getStartTime())} - {formatTime(getEndTime())}
                            </span>
                        </div>
                        <div className="conf-row">
                            <strong>Location</strong>
                            <span>
                                {slot.address ? `${slot.address}, ${slot.city}` : slot.city}
                            </span>
                        </div>
                        <div className="conf-row">
                            <strong>Host</strong>
                            <span>{hostDisplayName}</span>
                        </div>
                        <div className="conf-row">
                            <strong>Reference ID</strong>
                            <code>{reservation.id}</code>
                        </div>

                        <p className="confirmation-footer-text">
                            A confirmation email has been sent to you. The host will review your request shortly.
                        </p>
                    </div>

                    <div className="confirmation-actions">
                        <button
                            className="btn-confirm btn-confirm-primary"
                            onClick={() => handleNavigation("/")}
                        >
                            Back to Home
                        </button>
                        <button
                            className="btn-confirm btn-confirm-secondary"
                            onClick={() => handleNavigation("/profile")}
                        >
                            View My Bookings
                        </button>
                    </div>
                </section>
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

export default ReservationConfirmed;