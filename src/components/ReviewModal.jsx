import { useState } from "react";
import { postReview, updateReview } from "../api/apiClient";
import toast from "react-hot-toast";

export const ReviewModal = ({ isModalOpen, closeModal, reservation }) => {
  const [rating, setRating] = useState(() => reservation?.score || 0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState(
    () => reservation?.content || "",
  );

  if (!isModalOpen) return null;

  const handleSubmit = async () => {
    const data = {
      score: rating || 1,
      content: reviewText,
    };
    if (!reservation?.conten && !reservation?.score) {
      await toast.promise(
        postReview({
          resId: reservation.reservation_id,
          hostId: reservation.host_id,
          ...data,
        }),
        {
          loading: "Posting review...",
          success: "Review posted.",
        },
      );
    } else {
      await toast.promise(
        updateReview({
          review_id: reservation.review_id,
          guestId: reservation.guest_id,
          ...data,
        }),
        {
          loading: "Updating review...",
          success: "Review updated.",
        },
      );
    }

    closeModal(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
      onClick={closeModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "2rem",
          width: "400px",
          maxWidth: "90%",
          boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2>Leave a review</h2>
        <p>This review will be available publicly on the host's profile.</p>
        <div style={{ fontSize: "2rem", cursor: "pointer" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              style={{
                color: star <= (hover || rating) ? "#ffd700" : "#ccc",
                transition: "color 0.2s",
              }}
            >
              ★
            </span>
          ))}
        </div>

        <div style={{ marginTop: "1rem", width: "100%" }}>
          <textarea
            placeholder="Write your review..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            style={{ width: "100%", resize: "none", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem" }}>
          <button
            onClick={handleSubmit}
            style={{
              background: "#53c45b",
              color: "#fff",
              border: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              fontWeight: "500",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            Submit
          </button>

          <button
            onClick={() => closeModal(false)}
            style={{
              background: "#f3f4f6",
              color: "#111",
              border: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              fontWeight: "500",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#e5e7eb")}
            onMouseLeave={(e) => (e.target.style.background = "#f3f4f6")}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
