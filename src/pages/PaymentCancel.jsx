import { useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentCancel = () => {
  const navigate = useNavigate();

  const handleBackToCart = () => {
    navigate('/user-dashboard');
  };

  const handleTryAgain = () => {
    navigate('/user-dashboard');
  };

  return (
    <div className="payment-result-page">
      <div className="payment-result-container">
        <div className="icon-large">⚠️</div>
        <h1>Płatność Anulowana</h1>

        <div className="cancel-message">
          <p>Twoja płatność nie została przetworzona.</p>
          <p>Możesz spróbować ponownie lub wrócić do zamówień.</p>
        </div>

        <div className="info-box">
          <p><strong>ℹ️ Co się stało?</strong></p>
          <p>Anulowałeś proces płatności lub wystąpił problem z przetworzeniem.</p>
          <p>Twoje zamówienie zostało zapisane i czeka na płatność.</p>
        </div>

        <div className="action-buttons">
          <button className="btn-secondary" onClick={handleBackToCart}>
            Wróć do Dashboard
          </button>
          <button className="btn-primary" onClick={handleTryAgain}>
            Spróbuj Ponownie
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;

