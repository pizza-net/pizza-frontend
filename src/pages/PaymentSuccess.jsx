import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setError('Brak ID sesji płatności');
      setIsVerifying(false);
      return;
    }

    verifyPayment(sessionId);
  }, [searchParams]);

  const verifyPayment = async (sessionId) => {
    try {
      console.log('🔍 Weryfikacja sesji płatności:', sessionId);

      // Weryfikuj sesję w backend
      const response = await fetch('/api/payments/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      console.log('📥 Status odpowiedzi:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Błąd weryfikacji:', errorText);
        throw new Error('Nie udało się zweryfikować płatności');
      }

      const data = await response.json();
      console.log('✅ Dane płatności:', data);
      setPaymentInfo(data);
    } catch (err) {
      console.error('❌ Błąd:', err);
      setError(err.message || 'Wystąpił błąd podczas weryfikacji płatności');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/user-dashboard');
  };

  const handleTrackOrder = () => {
    navigate('/order-tracking');
  };

  if (isVerifying) {
    return (
      <div className="payment-result-page">
        <div className="payment-result-container">
          <div className="spinner-large"></div>
          <h2>Weryfikacja płatności...</h2>
          <p>Proszę czekać, trwa potwierdzanie Twojej płatności.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-result-page">
        <div className="payment-result-container error">
          <div className="icon-large">❌</div>
          <h1>Błąd Weryfikacji</h1>
          <p className="error-message">{error}</p>
          <button className="btn-primary" onClick={handleBackToDashboard}>
            Powrót do Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-page">
      <div className="payment-result-container success">
        <div className="icon-large">✅</div>
        <h1>Płatność Zakończona Sukcesem!</h1>

        {paymentInfo && (
          <div className="payment-details">
            <div className="detail-row">
              <span className="label">Numer zamówienia:</span>
              <span className="value">#{paymentInfo.orderId}</span>
            </div>
            <div className="detail-row">
              <span className="label">Kwota:</span>
              <span className="value">{paymentInfo.amount.toFixed(2)} PLN</span>
            </div>
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className="value status-paid">OPŁACONE</span>
            </div>
            {paymentInfo.paymentId && (
              <div className="detail-row">
                <span className="label">ID płatności:</span>
                <span className="value small">{paymentInfo.paymentId}</span>
              </div>
            )}
          </div>
        )}

        <div className="success-message">
          <p>🍕 Dziękujemy za zamówienie!</p>
          <p>Twoja płatność została pomyślnie przetworzona.</p>
          <p>Zamówienie zostało przekazane do realizacji.</p>
        </div>

        <div className="action-buttons">
          <button className="btn-primary btn-track" onClick={handleTrackOrder}>
            📦 Śledź zamówienie
          </button>
          <button className="btn-secondary" onClick={handleBackToDashboard}>
            Powrót do Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

