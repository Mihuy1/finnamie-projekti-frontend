import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";

function ReservationConfirmed() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const reservation = state?.reservation || {};
    const slot = state?.slot || {};
    const host = state?.host || {};

    const hostDisplayName = host.first_name
        ? `${host.first_name} ${host.last_name}`
        : (slot.host_first_name ? `${slot.host_first_name} ${slot.host_last_name}` : "Local Host");

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
                <p>Finnamie</p>
            </footer>
        </div>
    );
}

export default ReservationConfirmed;