import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import './Cart.css';

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    isCartOpen,
    toggleCart,
  } = useCart();

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderData, setOrderData] = useState({
    customerName: '',
    deliveryAddress: '',
    customerPhone: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      setOrderData((prev) => ({ ...prev, customerName: username }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      setOrderError('Koszyk jest pusty!');
      return;
    }

    setIsSubmitting(true);
    setOrderError('');

    try {
      console.log('🔄 Rozpoczynam proces składania zamówienia...');
      
      // 1. Utwórz zamówienie
      const orderPayload = {
        customerId: 1,
        customerName: orderData.customerName,
        deliveryAddress: orderData.deliveryAddress,
        customerPhone: orderData.customerPhone,
        notes: orderData.notes,
        items: cartItems.map((item) => ({
          pizzaId: item.id,
          quantity: item.quantity,
        })),
      };

      console.log('📦 Tworzę zamówienie:', orderPayload);
      const orderResponse = await createOrder(orderPayload);
      console.log('✅ Zamówienie utworzone:', orderResponse);

      // 2. Utwórz Stripe Checkout Session i przekieruj
      const paymentPayload = {
        orderId: orderResponse.id,
        customerId: 1,
        amount: orderResponse.totalPrice,
        currency: 'pln',
        description: `Płatność za zamówienie #${orderResponse.id}`,
        customerEmail: orderData.customerName + '@pizza-net.com'
      };
      
      console.log('💳 Tworzę sesję płatności:', paymentPayload);
      const checkoutResponse = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentPayload)
      });

      console.log('📡 Status odpowiedzi payment-service:', checkoutResponse.status);

      if (!checkoutResponse.ok) {
        const errorText = await checkoutResponse.text();
        console.error('❌ Błąd tworzenia sesji:', errorText);
        throw new Error('Nie udało się utworzyć sesji płatności: ' + errorText);
      }

      const responseData = await checkoutResponse.json();
      console.log('✅ Odpowiedź z payment-service:', responseData);

      // Backend może zwrócić checkoutUrl lub sessionUrl
      const stripeUrl = responseData.checkoutUrl || responseData.sessionUrl || responseData.url;
      console.log('🔗 URL przekierowania:', stripeUrl);

      // Redirect do Stripe Checkout
      if (stripeUrl && stripeUrl.startsWith('http')) {
        console.log('🚀 Przekierowuję do Stripe Checkout...');
        window.location.href = stripeUrl;
      } else {
        console.error('❌ Otrzymano nieprawidłowy URL:', stripeUrl);
        console.error('❌ Cała odpowiedź:', responseData);
        throw new Error('Backend zwrócił nieprawidłowy URL płatności');
      }

    } catch (error) {
      console.error('❌ Błąd w procesie zamówienia:', error);
      setOrderError(error.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={toggleCart}></div>
      <div className="cart-sidebar">
        <div className="cart-header">
          <h2>Koszyk</h2>
          <button className="close-cart-btn" onClick={toggleCart}>
            ×
          </button>
        </div>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>Koszyk jest pusty</p>
              <p className="empty-cart-hint">Dodaj pizzę z menu!</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p className="cart-item-price">{item.price.toFixed(2)} PLN</p>
                    </div>
                    <div className="cart-item-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="cart-item-subtotal">
                      Suma: {(item.price * item.quantity).toFixed(2)} PLN
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-total">
                <h3>Razem: {getTotalPrice().toFixed(2)} PLN</h3>
              </div>

              {!showOrderForm ? (
                <div className="cart-actions">
                  <button className="clear-cart-btn" onClick={clearCart}>
                    Wyczyść koszyk
                  </button>
                  <button
                    className="checkout-btn"
                    onClick={() => setShowOrderForm(true)}
                  >
                    Przejdź do zamówienia
                  </button>
                </div>
              ) : (
                <form className="order-form" onSubmit={handleSubmitOrder}>
                  <h3>Dane do dostawy</h3>
                  
                  <div className="form-group">
                    <label>Imię i nazwisko:</label>
                    <input
                      type="text"
                      name="customerName"
                      value={orderData.customerName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Adres dostawy:</label>
                    <input
                      type="text"
                      name="deliveryAddress"
                      value={orderData.deliveryAddress}
                      onChange={handleInputChange}
                      placeholder="ul. Przykładowa 123, Warszawa"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Telefon:</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={orderData.customerPhone}
                      onChange={handleInputChange}
                      placeholder="+48123456789"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Uwagi (opcjonalne):</label>
                    <textarea
                      name="notes"
                      value={orderData.notes}
                      onChange={handleInputChange}
                      placeholder="Np. dzwonek nie działa"
                      rows="3"
                    />
                  </div>

                  {orderError && (
                    <div className="error-message">{orderError}</div>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowOrderForm(false)}
                      disabled={isSubmitting}
                    >
                      Wstecz
                    </button>
                    <button
                      type="submit"
                      className="submit-order-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Wysyłanie...' : 'Złóż zamówienie'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {orderSuccess && (
          <div className="success-modal">
            <div className="success-content">
              <h2>✅ Zamówienie złożone!</h2>
              <p>Numer zamówienia: #{orderSuccess.id}</p>
              <p>Status: {orderSuccess.status}</p>
              <p>Całkowita kwota: {orderSuccess.totalPrice.toFixed(2)} PLN</p>
              <p>ID dostawy: #{orderSuccess.deliveryId}</p>
              {orderSuccess.payment && (
                <>
                  <hr />
                  <h3>💳 Płatność</h3>
                  <p>Status płatności: <strong>{orderSuccess.payment.status}</strong></p>
                  <p>ID płatności: {orderSuccess.payment.paymentId}</p>
                  {orderSuccess.payment.status === 'COMPLETED' && (
                    <p className="payment-success">✅ Płatność zakończona pomyślnie</p>
                  )}
                </>
              )}
              <button
                className="close-success-btn"
                onClick={() => {
                  setOrderSuccess(null);
                  toggleCart();
                }}
              >
                Zamknij
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
