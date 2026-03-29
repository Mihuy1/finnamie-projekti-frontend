// @ts-nocheck
import { useState } from "react";
import { postReview, updateReview } from "../api/apiClient";
import toast from "react-hot-toast";
import "../styles/review-modal-styles.css";

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
    <div className="review-modal-wrapper" onClick={closeModal}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="review-modal-content"
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

        <div className="review-textarea-wrapper">
          <textarea
            className="review-textarea"
            placeholder="Write your review..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
          />
        </div>

        <div className="review-button-wrapper">
          <button
            onClick={handleSubmit}
            className="review-button"
            style={{
              background: "#53c45b",
              color: "#fff",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            Submit
          </button>

          <button
            onClick={() => closeModal(false)}
            className="review-button"
            style={{
              background: "#f3f4f6",
              color: "#111",
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
