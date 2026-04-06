// @ts-nocheck
import { useState } from "react";
import { postReview, updateReview } from "../api/apiClient";
import toast from "react-hot-toast";
import "../styles/review-modal-styles.css";

export const ReviewModal = ({ isModalOpen, closeModal, reservation, isReadOnly }) => {
  const [rating, setRating] = useState(() => reservation?.score || 0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState(
    () => reservation?.content || "",
  );

  if (!isModalOpen) return null;

  const handleSubmit = async () => {
    if (isReadOnly) return;
    const data = {
      score: rating || 1,
      content: reviewText,
    };
    const isNewReview = !reservation?.content && !reservation?.score;

    try {
      if (isNewReview) {
        await toast.promise(
          postReview({
            resId: reservation.reservation_id,
            hostId: reservation.host_id,
            experienceId: reservation.experience_id,
            ...data,
          }),
          {
            loading: "Posting review...",
            success: "Review posted successfully!",
            error: "Failed to post review.",
          }
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
            success: "Review updated successfully!",
            error: "Failed to update review.",
          }
        );
      }
      closeModal(true);
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  return (
    <div className="review-modal-wrapper" onClick={closeModal}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="review-modal-content"
      >
        <h2>{isReadOnly ? "Guest Feedback" : "Leave a review"}</h2>
        <p>
          {isReadOnly
            ? "This is the feedback left by the guest for your experience."
            : "This review will be available publicly on the host's profile."}
        </p>
        <div style={{ fontSize: "2rem", cursor: isReadOnly ? "default" : "pointer" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => !isReadOnly && setRating(star)}
              onMouseEnter={() => !isReadOnly && setHover(star)}
              onMouseLeave={() => !isReadOnly && setHover(0)}
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
            className={`review-textarea ${isReadOnly ? "readonly-style" : ""}`}
            placeholder={isReadOnly ? "No comment provided." : "Write your review..."}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            readOnly={isReadOnly}
            style={isReadOnly ? { background: "#f9f9f9", cursor: "default", fontStyle: "italic" } : {}}
          />
        </div>

        <div className="review-button-wrapper">
          {!isReadOnly && (
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
          )}

          <button
            onClick={() => closeModal(false)}
            className="review-button"
            style={{
              background: "#f3f4f6",
              color: "#111",
              width: isReadOnly ? "100%" : "auto"
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
