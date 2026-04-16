import { useState } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import { useEffect } from "react";
import {
  getPublicUserInfo,
  getProfile,
  getTimeslotsByRuleId,
  createReservation,
} from "../api/apiClient";
import TimeslotSelector from "../components/TimeslotSelector";
import { sendMessage, startConversation } from "../api/apiClient";

export default function Reservation() {
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  const { user, refresh } = useAuth();

  const slot = state?.slot;
  const basePrice = slot.price || 45;
  const tax = basePrice * 0.24;
  const totalPrice = basePrice + tax;

  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hostData, setHostData] = useState(null);
  const [timeslots, setTimeslots] = useState();

  const [profile, setProfile] = useState(null);

  const [selectedTimeslotId, setSelectedTimeslotId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await getProfile();
      setProfile(data);
    };

    const fetchTimeslots = async () => {
      const data = await getTimeslotsByRuleId(slot?.rule.rule_id);
      setTimeslots(data);
    };

    fetchProfile();
    fetchTimeslots();
  }, [slot]);

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
    document.body.style.overflow = "unset";
    window.scrollTo(0, 0);

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!slot) {
    return <Navigate to="/book-activity" replace />;
  }

  const handleConfirm = async () => {
    if (!paymentMethod || !selectedTimeslotId) {
      toast.error("Please fill all details");
      return;
    }

    let currentUser = user;
    try {
      currentUser = (await refresh()) ?? user;
    } catch (refreshError) {
      console.error(
        "Failed to refresh auth before confirming reservation:",
        refreshError,
      );
    }

    if (!currentUser) {
      navigate("/login", {
        state: {
          redirectTo: "/reserve-activity",
          bookingData: slot,
          from: location.pathname,
        },
      });
      return;
    }

    if (!currentUser.is_verified) {
      toast.error(
        "Please verify your email before booking. You can resend the confirmation email from your Profile page.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedSlot = timeslots.find((ts) => ts.id === selectedTimeslotId);
      const eventDate =
        selectedSlot?.start_time?.split("T")[0] || selectedSlot?.res_date;

      const resData = await createReservation(selectedTimeslotId);

      const data = Array.isArray(resData) ? resData[0] : resData;
      const realReservationId = data?.id || data?.reservation_id;

      try {
        const convData = await startConversation(slot.host_id);

        const convId =
          convData?.convesation_id ||
          convData?.conversation_id ||
          convData?.conv_id ||
          convData?.id;

        if (convId && realReservationId) {
          const autoMessage = `TYPE:RESERVATION_REQUEST|ID:${realReservationId}|TITLE:${slot.title || slot.name}|DATE:${eventDate}`;

          await sendMessage(convId, slot.host_id, autoMessage);
          console.log("Lähetetty onnistuneesti!");
        } else {
          console.error("PUUTTUVA DATA:", { convId, realReservationId });
        }
      } catch (chatErr) {
        console.error("Chatin aloitus epäonnistui", chatErr);
      }

      toast.success("Booking request sent!");

      setTimeout(() => {
        const selectedSlot = timeslots.find((ts) => ts.id === selectedTimeslotId);

        navigate("/reservation-confirmed", {
          state: {
            reservation: {
              id: realReservationId || "RES-" + Math.floor(Math.random() * 10000),
              start_time: selectedSlot?.start_time,
              end_time: selectedSlot?.end_time,
            },
            slot: slot,
            host: hostData,
            fromBooking: true,
          },
        });
      }, 1500);
    } catch (error) {
      console.error("Reservation error:", error);
      if (error?.status === 403) {
        toast.error(
          "Please verify your email before booking. You can resend the confirmation email from your Profile page.",
        );
        return;
      }
      toast.error(error?.message || "Booking failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeString = (timeStr) => {
    if (!timeStr) return;

    const [hours, minutes] = timeStr.split(":").map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0);

    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!timeslots) return <p>Loading Timeslots...</p>;

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
              <p>
                <strong>Name:</strong> {user?.first_name} {user?.last_name}
              </p>
              <p>
                <strong>Email:</strong> {profile?.email || user?.email}
              </p>
              <p className="helper-text">
                Booking confirmation will be sent to this email.
              </p>
            </div>
          </section>

          <section className="res-section">
            <h3>2. Activity Details</h3>
            <div className="activity-summary-card">
              <h2>{slot.title || slot.name}</h2>

              <div className="detail-row">
                <span>📍 Location:</span>
                <span>
                  {slot.address || "Address not provided"}, {slot.city}
                </span>
              </div>

              <div className="detail-row">
                <span>📅 Starts:</span>
                <span>{formatTimeString(slot.rule?.start_time)}</span>
              </div>

              <div className="detail-row">
                <span>🏁 Ends:</span>
                <span>{formatTimeString(slot.rule?.end_time)}</span>
              </div>

              <div className="detail-row">
                <span>⌛ Duration:</span>
                <span style={{ textTransform: "capitalize" }}>
                  {slot.type || "Flexible"}
                </span>
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
                  <h4>
                    {hostData
                      ? `${hostData.first_name} ${hostData.last_name}`
                      : "Loading..."}
                  </h4>
                  <p className="host-role">
                    {hostData?.role === "host" ? "Verified Host" : "Member"}
                  </p>
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

          <section className="timeslot-section">
            <h3>4. Select Date</h3>
            <div className="timeslot-list">
              {timeslots && timeslots.length > 0 ? (
                <TimeslotSelector
                  timeslots={timeslots}
                  selectedId={selectedTimeslotId}
                  setSelectedId={setSelectedTimeslotId}
                  experience={slot}
                  required
                />
              ) : (
                <p>No available timeslots</p>
              )}
            </div>
          </section>

          <section className="res-section">
            <h3>5. Payment Method</h3>
            <div className="payment-options">
              <label
                className={`payment-card ${paymentMethod === "card" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>💳 Credit / Debit Card</span>
              </label>
              <label
                className={`payment-card ${paymentMethod === "mobilepay" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="mobilepay"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>📱 MobilePay</span>
              </label>
              <label
                className={`payment-card ${paymentMethod === "online" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
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

            <div className="booking-notice-box">
              <p>
                <strong>📌 Note:</strong> Your booking is for the selected date,
                but it is <strong>pending</strong> until the host approves it.
                You will receive a confirmation email once it's officially
                confirmed.
              </p>
            </div>

            <button
              className="confirm-booking-btn"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Confirm & Pay"}
            </button>

            <p className="secure-text">
              🔒 Secure payment via Stripe & Paytrail
            </p>
          </div>

          <button className="cancel-link" onClick={() => navigate(-1)}>
            &larr; Go back and change details
          </button>
        </div>
      </div>
    </div>
  );
}
