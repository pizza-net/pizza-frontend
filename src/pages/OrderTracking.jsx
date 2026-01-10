import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getOrders } from '../services/orderService';
import { getDeliveryByOrderId } from '../services/deliveryService';
import './OrderTracking.css';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const statusLabels = {
    PENDING: 'Oczekująca',
    ASSIGNED: 'Przypisana do kuriera',
    PICKED_UP: 'Odebrana z pizzerii',
    IN_TRANSIT: 'W drodze',
    DELIVERED: 'Dostarczona',
    CANCELLED: 'Anulowana',
  };

  const statusColors = {
    PENDING: '#ffc107',
    ASSIGNED: '#17a2b8',
    PICKED_UP: '#007bff',
    IN_TRANSIT: '#6f42c1',
    DELIVERED: '#28a745',
    CANCELLED: '#dc3545',
  };

  const orderStatusLabels = {
    PENDING: 'Oczekujące',
    PREPARING: 'W przygotowaniu',
    READY: 'Gotowe',
    DELIVERED: 'Dostarczone',
    CANCELLED: 'Anulowane',
  };

  useEffect(() => {
    fetchOrdersAndDeliveries();
  }, []);

  const fetchOrdersAndDeliveries = async () => {
    try {
      setLoading(true);
      setError('');

      // Pobierz zamówienia użytkownika
      const ordersData = await getOrders();

      // Sortuj zamówienia po dacie (najnowsze na górze)
      const sortedOrders = ordersData.sort((a, b) =>
        new Date(b.orderDate) - new Date(a.orderDate)
      );

      setOrders(sortedOrders);

      // Dla każdego zamówienia spróbuj pobrać status dostawy
      const deliveriesMap = {};
      for (const order of sortedOrders) {
        try {
          const delivery = await getDeliveryByOrderId(order.id);
          deliveriesMap[order.id] = delivery;
        } catch {
          // Jeśli dostawa nie istnieje dla tego zamówienia, to OK
          console.log(`Brak dostawy dla zamówienia ${order.id}`);
        }
      }

      setDeliveries(deliveriesMap);
    } catch (err) {
      console.error('Błąd pobierania zamówień:', err);
      setError(err.message || 'Nie udało się pobrać zamówień');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: '⏳',
      ASSIGNED: '👤',
      PICKED_UP: '📦',
      IN_TRANSIT: '🚚',
      DELIVERED: '✅',
      CANCELLED: '❌',
    };
    return icons[status] || '📋';
  };

  const getProgressPercentage = (status) => {
    const progress = {
      PENDING: 20,
      ASSIGNED: 40,
      PICKED_UP: 60,
      IN_TRANSIT: 80,
      DELIVERED: 100,
      CANCELLED: 0,
    };
    return progress[status] || 0;
  };

  if (loading) {
    return (
      <div className="order-tracking">
        <Navbar />
        <div className="loading">
          <div className="spinner"></div>
          <p>Ładowanie zamówień...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking">
      <Navbar />

      <div className="tracking-content">
        <div className="tracking-header">
          <h1>📦 Moje Zamówienia</h1>
          <button
            className="btn-back"
            onClick={() => navigate('/user-dashboard')}
          >
            ← Powrót do menu
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="no-orders">
            <div className="no-orders-icon">🍕</div>
            <h2>Brak zamówień</h2>
            <p>Nie masz jeszcze żadnych zamówień.</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/user-dashboard')}
            >
              Zamów pizzę
            </button>
          </div>
        )}

        {!error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => {
              const delivery = deliveries[order.id];
              const deliveryStatus = delivery?.status || null;

              return (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Zamówienie #{order.id}</h3>
                      <p className="order-date">
                        {new Date(order.orderDate).toLocaleString('pl-PL')}
                      </p>
                    </div>
                    <div className="order-status">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: order.status === 'DELIVERED' ? '#28a745' : '#007bff' }}
                      >
                        {orderStatusLabels[order.status] || order.status}
                      </span>
                    </div>
                  </div>

                  <div className="order-details">
                    <div className="detail-item">
                      <span className="label">Adres dostawy:</span>
                      <span className="value">{order.deliveryAddress}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Kwota:</span>
                      <span className="value price">{order.totalPrice.toFixed(2)} PLN</span>
                    </div>
                  </div>

                  {/* Sekcja śledzenia dostawy */}
                  {delivery ? (
                    <div className="delivery-tracking">
                      <h4>🚚 Status Dostawy</h4>

                      <div className="delivery-status-main">
                        <div className="status-icon-large">
                          {getStatusIcon(deliveryStatus)}
                        </div>
                        <div className="status-info">
                          <h3>{statusLabels[deliveryStatus]}</h3>
                          {delivery.estimatedDeliveryTime && (
                            <p className="eta">
                              Szacowany czas dostawy: {new Date(delivery.estimatedDeliveryTime).toLocaleTimeString('pl-PL')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Pasek postępu */}
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${getProgressPercentage(deliveryStatus)}%`,
                            backgroundColor: statusColors[deliveryStatus]
                          }}
                        ></div>
                      </div>

                      {/* Timeline statusów */}
                      <div className="status-timeline">
                        <div className={`timeline-item ${deliveryStatus === 'PENDING' || deliveryStatus === 'ASSIGNED' || deliveryStatus === 'PICKED_UP' || deliveryStatus === 'IN_TRANSIT' || deliveryStatus === 'DELIVERED' ? 'active' : ''}`}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-label">Oczekująca</div>
                        </div>
                        <div className={`timeline-item ${deliveryStatus === 'ASSIGNED' || deliveryStatus === 'PICKED_UP' || deliveryStatus === 'IN_TRANSIT' || deliveryStatus === 'DELIVERED' ? 'active' : ''}`}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-label">Przypisana</div>
                        </div>
                        <div className={`timeline-item ${deliveryStatus === 'PICKED_UP' || deliveryStatus === 'IN_TRANSIT' || deliveryStatus === 'DELIVERED' ? 'active' : ''}`}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-label">Odebrana</div>
                        </div>
                        <div className={`timeline-item ${deliveryStatus === 'IN_TRANSIT' || deliveryStatus === 'DELIVERED' ? 'active' : ''}`}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-label">W drodze</div>
                        </div>
                        <div className={`timeline-item ${deliveryStatus === 'DELIVERED' ? 'active' : ''}`}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-label">Dostarczona</div>
                        </div>
                      </div>

                      {delivery.courierId && (
                        <div className="courier-info">
                          <p>👤 Kurier ID: {delivery.courierId}</p>
                        </div>
                      )}

                      {delivery.notes && (
                        <div className="delivery-notes">
                          <p><strong>Uwagi:</strong> {delivery.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-delivery-info">
                      <p>ℹ️ Informacje o dostawie będą dostępne wkrótce</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;

