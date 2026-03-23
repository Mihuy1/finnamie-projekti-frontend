export const Review = ({ review }) => {
  const isUnderFiveMinutesFromCreation = (created, updated) => {
    const createdAt = new Date(created);
    const updatedAt = new Date(updated);
    const diffMs = Math.abs(updatedAt - createdAt);
    const fiveMinutes = 5 * 60 * 1000;

    return diffMs <= fiveMinutes;
  };

  return (
    <>
      <article className="profile-timeslot-card" style={{ margin: "8px" }}>
        <div className="profile-timeslot-summary" style={{ cursor: "default" }}>
          <div className="profile-timeslot-summary-main">
            <p>Created at: {review.created_at}</p>
            {
              // dont add update field if the review is updated within 5 minutes of creation.
              !isUnderFiveMinutesFromCreation(
                review.created_at,
                review.updated_at,
              ) && <p>Updated at: {review.updated_at}</p>
            }
            <span>
              <span className="profile-role">Rating: </span>
              {Array.from({ length: review.score }, (_, i) => (
                <span
                  key={i}
                  style={{
                    color: "#ffd700",
                  }}
                >
                  ★
                </span>
              ))}
            </span>

            <p>{review.content}</p>
          </div>
        </div>
      </article>
    </>
  );
};
