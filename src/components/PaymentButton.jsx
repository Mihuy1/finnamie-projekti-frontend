import { getCheckoutSession } from "../api/apiClient";

export const PaymentButton = ({ type, user, resId }) => {
  const handlePayment = async () => {
    try {
      const { url } = await getCheckoutSession(type, user, resId);
      console.log(url);
      if (url) window.location.href = url;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button
      style={{ margin: "8px" }}
      className="BookingRateBtnInline"
      onClick={(e) => {
        e.stopPropagation();
        handlePayment();
      }}
    >
      Pay here
    </button>
  );
};
