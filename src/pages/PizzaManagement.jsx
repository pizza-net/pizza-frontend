import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getPizzas, addPizza } from '../services/pizzaService';
import './Dashboard.css';
import './PizzaManagement.css';

const PizzaManagement = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    size: 'MEDIUM',
    available: true
  });

  useEffect(() => {
    fetchPizzas();
  }, []);

  const fetchPizzas = async () => {
    try {
      setLoading(true);
      const data = await getPizzas();
      setPizzas(data);
      setError('');
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setSuccess('');

      if (!formData.name || !formData.description || !formData.price || !formData.size) {
        setError('Wszystkie pola są wymagane!');
        return;
      }

      if (parseFloat(formData.price) <= 0) {
        setError('Cena musi być większa od 0!');
        return;
      }

      const pizzaData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      await addPizza(pizzaData);
      setSuccess('Pizza została pomyślnie dodana! 🍕');

      setFormData({
        name: '',
        description: '',
        price: '',
        size: 'MEDIUM',
        available: true
      });

      await fetchPizzas();

      setTimeout(() => {
        setShowForm(false);
        setSuccess('');
      }, 2000);

    } catch (err) {
      setError(err.toString());
    }
  };

  return (
    <div className="dashboard">
      <Navbar />

      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Zarządzanie Pizzami 🍕</h1>
          <p>Przeglądaj i dodawaj nowe pizze do menu</p>
        </div>

        {/* Przycisk dodawania pizzy */}
        <div className="action-section">
          <button
            className="add-pizza-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '❌ Anuluj' : '➕ Dodaj Nową Pizzę'}
          </button>
        </div>

        {/* Formularz dodawania pizzy */}
        {showForm && (
          <div className="pizza-form-section">
            <h2>Dodaj Nową Pizzę</h2>

            {error && (
              <div className="error-box">
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="success-box">
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="pizza-form">
              <div className="form-group">
                <label htmlFor="name">Nazwa Pizzy *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="np. Margherita"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Opis *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="np. Sos pomidorowy, mozzarella, bazylia"
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Cena (PLN) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="29.99"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="size">Rozmiar *</label>
                  <select
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="SMALL">Mała</option>
                    <option value="MEDIUM">Średnia</option>
                    <option value="LARGE">Duża</option>
                  </select>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleInputChange}
                  />
                  <span>Dostępna w menu</span>
                </label>
              </div>

              <button type="submit" className="submit-btn">
                ✅ Dodaj Pizzę
              </button>
            </form>
          </div>
        )}

        {/* Lista pizz */}
        <div className="users-section">
          <h2>Lista Pizz</h2>

          {loading && <p className="loading">Ładowanie pizz...</p>}

          {!loading && error && !showForm && (
            <div className="error-box">
              <p>Błąd ładowania pizz: {error}</p>
            </div>
          )}

          {!loading && !error && pizzas.length > 0 && (
            <div className="pizza-grid">
              {pizzas.map((pizza) => (
                <div key={pizza.id} className="pizza-card">
                  <div className="pizza-header">
                    <h3>{pizza.name}</h3>
                    <span className={`availability-badge ${pizza.available ? 'available' : 'unavailable'}`}>
                      {pizza.available ? '✓ Dostępna' : '✗ Niedostępna'}
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
                </div>
              ))}
            </div>
          )}

          {!loading && !error && pizzas.length === 0 && (
            <div className="no-data">
              <p>🍕 Brak pizz w menu. Dodaj pierwszą pizzę!</p>
            </div>
          )}
        </div>

        <div className="info-section">
          <h2>Informacje o Systemie</h2>
          <div className="info-cards">
            <div className="info-card">
              <h3>🍕 Pizza API</h3>
              <p>Port: 8082</p>
            </div>
            <div className="info-card">
              <h3>📊 Statystyki</h3>
              <p>Liczba pizz: {pizzas.length}</p>
            </div>
            <div className="info-card">
              <h3>✅ Dostępne</h3>
              <p>{pizzas.filter(p => p.available).length} pizz</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzaManagement;

