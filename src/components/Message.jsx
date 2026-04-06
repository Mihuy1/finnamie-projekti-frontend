import { useState } from "react";
import { updateReservationStatus, sendMessage } from "../api/apiClient";
import "../styles/message-styles.css";

export const Message = ({ msg, user }) => {
  const isOwnMessage = msg.sender_id === user.id;

  const isBookingRequest = msg.content.startsWith("TYPE:RESERVATION_REQUEST");
  const isAcceptedInDB = msg.content === "ACCEPTED";
  const isDeclinedInDB = msg.content === "DECLINED";

  const [localStatus, setLocalStatus] = useState(null);
  const isCancelledByHost = msg.content.includes("CANCELLED BY HOST");
  const isCancelledByGuest = msg.content.includes("CANCELLED BY GUEST");

  const handleStatusUpdate = async (resId, newStatus) => {
    if (newStatus === "rejected") {
      const confirmDelete = window.confirm(
        "Are you sure you want to decline and delete this booking?"
      );
      if (!confirmDelete) return;
    }

    try {
      await updateReservationStatus(resId, newStatus);
      setLocalStatus(newStatus);

      const parts = msg.content.split("|");
      const title = parts.find((p) => p.startsWith("TITLE:"))?.split(":")[1] || "Activity";
      const date = parts.find((p) => p.startsWith("DATE:"))?.split(":")[1];

      let confirmationMessage = "";

      if (newStatus === "confirmed") {
        confirmationMessage = `
✅ BOOKING CONFIRMED!

Your host has accepted your booking:
• Activity: ${title}
• Date: ${date}
• Ref ID: ${resId}

Get ready for your experience!
`.trim();
      } else {
        confirmationMessage = `
❌ BOOKING DECLINED

Unfortunately, the host could not accept the booking for:
• ${title}

We hope you find another experience soon!
`.trim();
      }
      await sendMessage(msg.conv_id, msg.sender_id, confirmationMessage);
    } catch (err) {
      console.error("Failed to update status or send message", err);
      alert("Error processing request.");
    }
  };

  const renderContent = () => {
    const parts = msg.content.includes("|") ? msg.content.split("|") : [];
    const title = parts.find((p) => p.startsWith("TITLE:"))?.split(":")[1];
    const date = parts.find((p) => p.startsWith("DATE:"))?.split(":")[1];

    if (isAcceptedInDB || localStatus === "confirmed") {
      return (
        <div className="status-update-confirmed">
          <p>✅ <strong>Booking Accepted!</strong></p>
          {(title || date) && (
            <div className="confirmed-details">
              <p className="small-text">{title}</p>
              <p className="small-text">{date}</p>
            </div>
          )}
        </div>
      );
    }

    if (isDeclinedInDB || localStatus === "rejected") {
      return (
        <div className="status-update-rejected">
          <p>❌ <strong>Booking Declined</strong></p>
          {title && <p className="small-text">{title}</p>}
        </div>
      );
    }

    if (isCancelledByHost || isCancelledByGuest) {
      return (
        <div className="status-update-cancelled">
          <p>🚫 <strong>Booking Cancelled</strong></p>
          <p className="small-text" style={{ whiteSpace: 'pre-wrap' }}>
            {msg.content}
          </p>
        </div>
      );
    }

    if (isBookingRequest) {
      const resId = parts.find((p) => p.startsWith("ID:"))?.split(":")[1];

      return (
        <div className="booking-request-card">
          <h4>📅 New Booking Request</h4>
          <p><strong>{title}</strong></p>
          <p>Date: {date}</p>

          {!isOwnMessage ? (
            <div className="booking-actions">
              <button className="accept-btn" onClick={() => handleStatusUpdate(resId, "confirmed")}>
                Accept
              </button>
              <button className="reject-btn" onClick={() => handleStatusUpdate(resId, "rejected")}>
                Decline
              </button>
            </div>
          ) : (
            <p className="sent-info">Request sent.</p>
          )}
        </div>
      );
    }

    return msg.content;
  };

  return (
    <div className={`message-container ${isOwnMessage ? "own" : "other"}`}>
      <p className="message-time">
        {new Date(msg.sent_at).toLocaleTimeString("fi-FI", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      <div
        className={`message-bubble ${isBookingRequest || isAcceptedInDB || isDeclinedInDB
          ? "booking-bubble"
          : ""
          }`}
      >
        {renderContent()}
      </div>
    </div>
  );
};