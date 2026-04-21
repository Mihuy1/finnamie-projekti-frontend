import { Link } from "react-router-dom";
export const Success = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: "50%",
          textAlign: "center",
          marginTop: "50px",
          border: "solid",
          borderRadius: "16px",
          padding: "2rem",
          backgroundColor: "#fafafaee",
        }}
      >
        <h1>Payment Successful</h1>
        <p style={{ marginBottom: "16px" }}>
          Thank you! Your transaction has been completed.
        </p>
        <Link to="/" className="back-link" style={{ margin: "0px" }}>
          ← Back to home page{" "}
        </Link>
      </div>
    </div>
  );
};
