import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const VerifySuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/profile");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="login_register-page">
      <div className="login_register-card">
        <h1 style={{ color: "#22c55e", marginBottom: "1rem" }}>
          Email Verified!
        </h1>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
          Your email has been successfully verified. You can now log in to your
          account.
        </p>
        <p style={{ textAlign: "center", color: "#999", fontSize: "14px" }}>
          Redirecting to login in 5 seconds...
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <button
            className="login_register-btn"
            onClick={() => navigate("/profile")}
            style={{
              marginTop: "20px",
              background: "var(--accent)",
            }}
          >
            Go to Profile Now
          </button>
        </div>
      </div>
    </div>
  );
};
