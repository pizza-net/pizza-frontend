import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getPizzas } from '../services/pizzaService';
import './Dashboard.css';
import './PizzaManagement.css';
import './UserDashboard.css';

const UserDashboard = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchPizzas();
  }, []);

  const fetchPizzas = async () => {
    try {
      setLoading(true);
      const data = await getPizzas();
      setPizzas(data.filter(pizza => pizza.available));
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (pizza) => {
    setNotification(`⚠️ Order Service nie jest jeszcze zaimplementowany!

Pizza "${pizza.name}" zostałaby dodana do koszyka.

Aby ta funkcja działała, potrzebny jest:
- Order Service (zarządzanie zamówieniami)
- Cart Service (zarządzanie koszykiem)
- Payment Service (płatności)

Backend musi zostać rozszerzony o te mikrousługi.`);
    
    setTimeout(() => setNotification(''), 5000);
  };

  return (
    <div className="user-dashboard">
      <Navbar />
      
      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>🍕 Pizza Net - Menu</h1>
          <p>Wybierz swoją ulubioną pizzę!</p>
        </div>

        {notification && (
          <div className="notification-modal">
            <div className="notification-content">
              <button 
                className="close-btn"
                onClick={() => setNotification('')}
              >
                ×
              </button>
              <pre>{notification}</pre>
            </div>
          </div>
        )}

        <div className="users-section">
          <h2>Dostępne Pizze</h2>

          {loading && <p className="loading">Ładowanie menu...</p>}
          
          {!loading && error && (
            <div className="error-box">
              <p>Błąd ładowania menu: {error}</p>
            </div>
          )}
          
          {!loading && !error && pizzas.length > 0 && (
            <div className="pizza-grid">
              {pizzas.map((pizza) => (
                <div key={pizza.id} className="pizza-card">
                  {pizza.imageUrl && (
                    <div className="pizza-image">
                      <img src={pizza.imageUrl} alt={pizza.name} />
                    </div>
                  )}
                  <div className="pizza-header">
                    <h3>{pizza.name}</h3>
                    <span className="availability-badge available">
                      ✓ Dostępna
                    </span>
                  </div>
                  <p className="pizza-description">{pizza.description}</p>
                  <div className="pizza-details">
                    <div className="pizza-info-item">
                      <span className="info-label">Rozmiar:</span>
                      <span className="info-value">{pizza.size}</span>
                    </div>
                    <div className="pizza-info-item">
                      <span className="info-label">Cena:</span>
                      <span className="info-value price">{pizza.price.toFixed(2)} PLN</span>
                    </div>
                  </div>
                  <div className="pizza-actions">
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(pizza)}
                    >
                      🛒 Dodaj do koszyka
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && !error && pizzas.length === 0 && (
            <div className="no-data">
              <p>🍕 Brak dostępnych pizz w menu.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
