import "../styles/timeslot-styles.css";

export const Reservation = ({
  inPast,
  formattedDate,
  reservation,
  handleModalOpen,
}) => {
  return (
    <article className="profile-timeslot-card" key={reservation.reservation_id}>
      <div className="profile-timeslot-summary" style={{ cursor: "default" }}>
        <div className="profile-timeslot-summary-main">
          <h3>{reservation.city}</h3>
          <p>
            {!inPast && "Upcoming: "}
            {formattedDate[0]},{formattedDate[1]}
          </p>
        </div>

        <div className="profile-timeslot-summary-meta">
          {inPast && (
            <button
              onClick={() => handleModalOpen(reservation)}
              onMouseEnter={(e) => (e.target.style.background = "#9c9ea3")}
              onMouseLeave={(e) => (e.target.style.background = "#e5e7eb")}
              className="profile-timeslot-pill"
              style={{ cursor: "pointer", fontWeight: "normal" }}
            >
              {!reservation.content && !reservation?.score
                ? "Review"
                : "Update Review"}
            </button>
          )}
          <span className="profile-timeslot-pill">
            {reservation.type === "halfday" ? "Half Day" : "Full Day"}
          </span>
          <span
            className={`profile-timeslot-pill booking-status-${(reservation.booking_status || "unknown").toLowerCase()}`}
          >
            {reservation.booking_status || "Unknown"}
          </span>
        </div>
      </div>
    </article>
  );
};
