import { useSearchParams, useNavigate } from "react-router-dom";

export const VerifyError = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reason = searchParams.get("reason");

  const getErrorMessage = () => {
    switch (reason) {
      case "missing":
        return "Verification token is missing. Please check your email link.";
      case "invalid":
        return "Invalid verification token. Please request a new verification email.";
      case "expired":
        return "Verification token has expired. Please request a new verification email.";
      default:
        return "An error occurred during verification.";
    }
  };

  return (
    <div className="login_register-page">
      <div className="login_register-card">
        <h1 style={{ color: "#dc2626", marginBottom: "1rem" }}>
          Verification Failed
        </h1>
        <p style={{ textAlign: "center", color: "#666" }}>
          {getErrorMessage()}
        </p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button
            className="profile-btn profile-btn-primary"
            onClick={() => navigate("/login")}
            style={{
              marginTop: "20px",
            }}
          >
            Back to Login
          </button>
          <button
            className="profile-btn profile-btn-secondary"
            onClick={() => navigate("/register")}
            style={{
              marginTop: "10px",
            }}
          >
            Request New Verification Email
          </button>
        </div>
      </div>
    </div>
  );
};
