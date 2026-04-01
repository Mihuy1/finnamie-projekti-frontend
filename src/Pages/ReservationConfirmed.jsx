import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";
import { useEffect } from "react";

function ReservationConfirmed() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const reservation = state?.reservation || {};
    const slot = state?.slot || {};
    const host = state?.host || {};

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
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
    }, []);

    return (
        <div className="app">
            <div className="app confirmation-page-wrapper">
                <section className="confirmation-section">
                    <div className="success-icon" style={{ fontSize: '64px' }}>✅</div>
                    <h1>Booking Confirmed!</h1>
                    <p>Thank you for choosing Finnamie.</p>

                    <div className="confirmation-card">
                        <h3>Booking Summary</h3>

                        <div className="conf-row">
                            <strong>Activity</strong>
                            <span>{slot.name || "Local Activity"}</span>
                        </div>

                        <div className="conf-row">
                            <strong>Date</strong>
                            <span>{formatDate(slot.start_time)}</span>
                        </div>

                        <div className="conf-row">
                            <strong>Time</strong>
                            <span>
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </span>
                        </div>

                        <div className="conf-row">
                            <strong>Location</strong>
                            <span>{slot.address ? `${slot.address}, ${slot.city}` : slot.city}</span>
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
                            A confirmation email has been sent to your inbox with all the details and meeting instructions.
                        </p>
                    </div>

                    <div className="confirmation-actions">
                        <button className="btn-confirm btn-confirm-primary" onClick={() => navigate("/")}>
                            Back to Home
                        </button>
                        <button className="btn-confirm btn-confirm-secondary" onClick={() => navigate("/profile")}>
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
                        href="https://www.finnamie.com/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Privacy Policy
                    </a>
                </div>

                <p className="footer-copyright">
                    &copy; {new Date().getFullYear()} Finnamie.
                </p>
            </footer>
        </div>
    );
}

export default ReservationConfirmed;