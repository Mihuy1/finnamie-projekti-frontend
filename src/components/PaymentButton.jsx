import { useState } from "react";
import { getCheckoutSession } from "../api/apiClient";

export const PaymentButton = ({
  type,
  email /* tähän käyttäjän sposti profiilista */,
}) => {
  //
  // stripen testausta varten
  //

  const [stripeEmail, setStripeEmail] = useState(null);
  const handleStripeCcEmail = (e) => {
    setStripeEmail(e.target.value);
  };

  //
  // ---------------------
  //

  const handlePayment = async () => {
    try {
      const { url } = await getCheckoutSession(type, stripeEmail);
      if (url) window.location.href = url;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <button className="BookingRateBtnInline" onClick={handlePayment}>
        Pay now
      </button>
      <p>
        Tätä käytetään Stripen eri valuuttojen testaamiseen.
        <br></br>
        test+location_JP@example.com = maksu tapahtuu Japanin jeneillä.
      </p>
      <input
        name="stripe-email-test"
        onChange={handleStripeCcEmail}
        placeholder="test+location_FI@example.com"
      />
    </div>
  );
};
