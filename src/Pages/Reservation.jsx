import { useState } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import { formatDateTimeDisplay } from "../utils/date-utils";
import { useEffect } from "react";
import { getPublicUserInfo, getProfile } from "../api/apiClient";

export default function Reservation() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const slot = state?.slot;

    const [paymentMethod, setPaymentMethod] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hostData, setHostData] = useState(null);

    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const data = await getProfile();
            setProfile(data);
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        const fetchHost = async () => {
            if (slot?.host_id) {
                try {
                    const data = await getPublicUserInfo(slot.host_id);
                    setHostData(data);
                } catch (err) {
                    console.error("Failed to fetch host info", err);
                }
            }
        };
        fetchHost();
    }, [slot?.host_id]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!slot) {
        return <Navigate to="/book-activity" replace />;
    }

    const basePrice = slot.price || 45;
    const tax = basePrice * 0.24;
    const totalPrice = basePrice + tax;

    const handleConfirm = async () => {
        if (!paymentMethod) {
            toast.error("Please select a payment method");
            return;
        }

        setIsSubmitting(true);
        try {
            toast.success("Reservation confirmed!");

            setTimeout(() => {
                navigate("/reservation-confirmed", {
                    state: {
                        reservation: { id: "RES-" + Math.floor(Math.random() * 10000) },
                        slot: slot,
                        host: hostData
                    }
                });
            }, 2000);
        }
        catch (error) {
            toast.error("Booking failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="reservation-container">
            <header className="reservation-header">
                <h1>Confirm Your Reservation</h1>
                <p>Please review the details below before completing your booking.</p>
            </header>

            <div className="reservation-grid">
                <div className="reservation-details">
                    <section className="res-section">
                        <h3>1. Your Information</h3>
                        <div className="user-summary-card">
                            <p><strong>Name:</strong> {user?.first_name} {user?.last_name}</p>
                            <p><strong>Email:</strong> {profile?.email || user?.email}</p>
                            <p className="helper-text">Booking confirmation will be sent to this email.</p>
                        </div>
                    </section>

                    <section className="res-section">
                        <h3>2. Activity Details</h3>
                        <div className="activity-summary-card">
                            <h2>{slot.name}</h2>
                            <div className="detail-row">
                                <span>📍 Location:</span>
                                <span>{slot.address}, {slot.city}</span>
                            </div>
                            <div className="detail-row">
                                <span>📅 Starts:</span>
                                <span>{formatDateTimeDisplay(slot.start_time)}</span>
                            </div>
                            <div className="detail-row">
                                <span>🏁 Ends:</span>
                                <span>{formatDateTimeDisplay(slot.end_time)}</span>
                            </div>
                            <div className="detail-row">
                                <span>⌛ Duration:</span>
                                <span>{slot.type || "Flexible"}</span>
                            </div>
                        </div>
                    </section>

                    <section className="res-section">
                        <h3>3. Meet Your Host</h3>
                        <div className="host-summary-card">
                            <div className="host-info-display">
                                <div className="host-avatar-large">
                                    {hostData?.image_url ? (
                                        <img
                                            src={`http://localhost:3000${hostData.image_url}`}
                                            alt="Host Avatar"
                                        />
                                    ) : (
                                        <div className="host-avatar-fallback">
                                            {(hostData?.first_name?.[0] || "U").toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="host-text-details">
                                    <h4>{hostData ? `${hostData.first_name} ${hostData.last_name}` : "Loading..."}</h4>
                                    <p className="host-role">{hostData?.role === 'host' ? "Verified Host" : "Member"}</p>
                                    {hostData?.description && (
                                        <p className="host-bio">"{hostData.description}"</p>
                                    )}
                                    <div className="host-stats">
                                        <span>📍 {hostData?.city || "Finland"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="res-section">
                        <h3>3. Payment Method</h3>
                        <div className="payment-options">
                            <label className={`payment-card ${paymentMethod === 'card' ? 'selected' : ''}`}>
                                <input type="radio" name="payment" value="card" onChange={(e) => setPaymentMethod(e.target.value)} />
                                <span>💳 Credit / Debit Card</span>
                            </label>
                            <label className={`payment-card ${paymentMethod === 'mobilepay' ? 'selected' : ''}`}>
                                <input type="radio" name="payment" value="mobilepay" onChange={(e) => setPaymentMethod(e.target.value)} />
                                <span>📱 MobilePay</span>
                            </label>
                            <label className={`payment-card ${paymentMethod === 'online' ? 'selected' : ''}`}>
                                <input type="radio" name="payment" value="online" onChange={(e) => setPaymentMethod(e.target.value)} />
                                <span>🏦 Online Bank Transfer</span>
                            </label>
                        </div>
                    </section>
                </div>

                <div className="reservation-sidebar">
                    <div className="price-summary-card">
                        <h3>Price Summary</h3>
                        <div className="price-row">
                            <span>Activity Fee</span>
                            <span>{basePrice.toFixed(2)} €</span>
                        </div>
                        <div className="price-row">
                            <span>Service Fee / VAT (24%)</span>
                            <span>{tax.toFixed(2)} €</span>
                        </div>
                        <hr />
                        <div className="price-row total">
                            <span>Total Price</span>
                            <span>{totalPrice.toFixed(2)} €</span>
                        </div>

                        <button
                            className="confirm-booking-btn"
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Processing..." : "Confirm & Pay"}
                        </button>

                        <p className="secure-text">🔒 Secure payment via Stripe & Paytrail</p>
                    </div>

                    <button className="cancel-link" onClick={() => navigate(-1)}>
                        &larr; Go back and change details
                    </button>
                </div>
            </div>
        </div>
    );
}