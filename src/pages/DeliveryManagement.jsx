import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import {
  getAllDeliveries,
  createDelivery,
  updateDeliveryStatus,
  assignCourier,
  deleteDelivery,
} from '../services/deliveryService';
import { getCouriers } from '../services/authService';
import { getOrderById } from '../services/orderService';
import './Dashboard.css';
import './DeliveryManagement.css';

const DeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [orders, setOrders] = useState({}); // Przechowuje szczegóły zamówień { orderId: orderData }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [assigningDeliveryId, setAssigningDeliveryId] = useState(null);
  const [selectedCourierId, setSelectedCourierId] = useState('');

  // Formularz nowej dostawy
  const [newDelivery, setNewDelivery] = useState({
    orderId: '',
    customerId: '',
    deliveryAddress: '',
    customerPhone: '',
    notes: '',
    latitude: '',
    longitude: '',
  });

  const statusOptions = [
    'PENDING',
    'ASSIGNED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED',
  ];

  const statusColors = {
    PENDING: '#ffc107',
    ASSIGNED: '#17a2b8',
    PICKED_UP: '#007bff',
    IN_TRANSIT: '#6f42c1',
    DELIVERED: '#28a745',
    CANCELLED: '#dc3545',
  };

  const statusLabels = {
    PENDING: 'Oczekująca',
    ASSIGNED: 'Przypisana',
    PICKED_UP: 'Odebrana',
    IN_TRANSIT: 'W drodze',
    DELIVERED: 'Dostarczona',
    CANCELLED: 'Anulowana',
  };

  // Pobierz dostawy i kurierów
  useEffect(() => {
    fetchDeliveries();
    fetchCouriers();
  }, [filterStatus]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const filters = filterStatus ? { status: filterStatus } : {};
      const data = await getAllDeliveries(filters);
      setDeliveries(data);

      // Pobierz szczegóły zamówień dla każdej dostawy
      const ordersMap = {};
      for (const delivery of data) {
        try {
          const orderData = await getOrderById(delivery.orderId);
          ordersMap[delivery.orderId] = orderData;
        } catch (err) {
          console.log(`Nie udało się pobrać zamówienia ${delivery.orderId}:`, err);
        }
      }
      setOrders(ordersMap);

      setError('');
    } catch (err) {
      setError(err.message || 'Błąd podczas pobierania dostaw');
    } finally {
      setLoading(false);
    }
  };

  const fetchCouriers = async () => {
    try {
      const data = await getCouriers();
      setCouriers(data);
    } catch (err) {
      console.error('Błąd podczas pobierania kurierów:', err);
    }
  };

  // Utwórz dostawę
  const handleCreateDelivery = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await createDelivery({
        ...newDelivery,
        orderId: Number(newDelivery.orderId),
        customerId: Number(newDelivery.customerId),
        latitude: newDelivery.latitude ? Number(newDelivery.latitude) : null,
        longitude: newDelivery.longitude ? Number(newDelivery.longitude) : null,
      });
      setShowCreateForm(false);
      setNewDelivery({
        orderId: '',
        customerId: '',
        deliveryAddress: '',
        customerPhone: '',
        notes: '',
        latitude: '',
        longitude: '',
      });
      setSuccess('Dostawa utworzona pomyślnie!');
      fetchDeliveries();
    } catch (err) {
      setError(err.message || 'Błąd podczas tworzenia dostawy');
      console.error('Błąd:', err);
    }
  };

  // Zmień status
  const handleStatusChange = async (id, newStatus) => {
    setError('');
    setSuccess('');

    try {
      await updateDeliveryStatus(id, newStatus);
      setSuccess('Status zaktualizowany pomyślnie!');
      fetchDeliveries();
    } catch (err) {
      setError(err.message || 'Błąd podczas zmiany statusu');
      console.error('Błąd:', err);
    }
  };

  // Przypisz kuriera - otwórz modal wyboru
  const handleAssignCourierClick = (deliveryId) => {
    setAssigningDeliveryId(deliveryId);
    setSelectedCourierId('');
  };

  // Przypisz kuriera - potwierdź wybór
  const handleAssignCourier = async () => {
    if (!selectedCourierId) {
      alert('Wybierz kuriera');
      return;
    }

    setError('');
    setSuccess('');

    try {
      await assignCourier(assigningDeliveryId, Number(selectedCourierId));
      setSuccess('Kurier przypisany pomyślnie!');
      setAssigningDeliveryId(null);
      setSelectedCourierId('');
      fetchDeliveries();
    } catch (err) {
      setError(err.message || 'Błąd podczas przypisywania kuriera');
      console.error('Błąd:', err);
    }
  };

  // Usuń dostawę
  const handleDeleteDelivery = async (id) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę dostawę?')) return;

    setError('');
    setSuccess('');

    try {
      await deleteDelivery(id);
      setSuccess('Dostawa usunięta pomyślnie!');
      fetchDeliveries();
    } catch (err) {
      setError(err.message || 'Błąd podczas usuwania dostawy');
      console.error('Błąd:', err);
    }
  };

  if (loading) return (
    <div className="delivery-management">
      <Navbar />
      <div className="loading">Ładowanie dostaw...</div>
    </div>
  );

  return (
    <div className="delivery-management">
      <Navbar />

      <div className="delivery-content">
        <div className="header">
          <h1>🚚 Zarządzanie Dostawami</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Anuluj' : '+ Nowa Dostawa'}
          </button>
        </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Modal przypisywania kuriera */}
      {assigningDeliveryId && (
        <div className="modal-overlay" onClick={() => setAssigningDeliveryId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Przypisz kuriera do dostawy #{assigningDeliveryId}</h2>
            <div style={{ marginTop: '1rem' }}>
              <label>
                <strong>Wybierz kuriera:</strong>
                <select
                  value={selectedCourierId}
                  onChange={(e) => setSelectedCourierId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginTop: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                >
                  <option value="">-- Wybierz kuriera --</option>
                  {couriers.map((courier) => (
                    <option key={courier.id} value={courier.id}>
                      {courier.username} (ID: {courier.id})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                className="btn btn-success"
                onClick={handleAssignCourier}
                disabled={!selectedCourierId}
              >
                Potwierdź
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setAssigningDeliveryId(null)}
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formularz tworzenia dostawy */}
      {showCreateForm && (
        <form className="create-form" onSubmit={handleCreateDelivery}>
          <h2>Nowa Dostawa</h2>
          <div className="form-grid">
            <input
              type="number"
              placeholder="ID Zamówienia *"
              value={newDelivery.orderId}
              onChange={(e) =>
                setNewDelivery({ ...newDelivery, orderId: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="ID Klienta *"
              value={newDelivery.customerId}
              onChange={(e) =>
                setNewDelivery({ ...newDelivery, customerId: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Adres dostawy *"
              value={newDelivery.deliveryAddress}
              onChange={(e) =>
                setNewDelivery({
                  ...newDelivery,
                  deliveryAddress: e.target.value,
                })
              }
              required
            />
            <input
              type="tel"
              placeholder="Telefon klienta *"
              value={newDelivery.customerPhone}
              onChange={(e) =>
                setNewDelivery({
                  ...newDelivery,
                  customerPhone: e.target.value,
                })
              }
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Szerokość geograficzna"
              value={newDelivery.latitude}
              onChange={(e) =>
                setNewDelivery({ ...newDelivery, latitude: e.target.value })
              }
            />
            <input
              type="number"
              step="any"
              placeholder="Długość geograficzna"
              value={newDelivery.longitude}
              onChange={(e) =>
                setNewDelivery({ ...newDelivery, longitude: e.target.value })
              }
            />
            <textarea
              placeholder="Uwagi"
              value={newDelivery.notes}
              onChange={(e) =>
                setNewDelivery({ ...newDelivery, notes: e.target.value })
              }
              className="full-width"
            />
          </div>
          <button type="submit" className="btn btn-success">
            Utwórz Dostawę
          </button>
        </form>
      )}

      {/* Filtr */}
      <div className="filter-bar">
        <label>
          Filtruj po statusie:
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Wszystkie</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Lista dostaw */}
      <div className="deliveries-grid">
        {deliveries.length === 0 ? (
          <p className="no-data">Brak dostaw do wyświetlenia</p>
        ) : (
          deliveries.map((delivery) => {
            const order = orders[delivery.orderId]; // Pobierz szczegóły zamówienia

            return (
            <div key={delivery.id} className="delivery-card">
              <div className="card-header">
                <h3>Dostawa #{delivery.id}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: statusColors[delivery.status] }}
                >
                  {statusLabels[delivery.status]}
                </span>
              </div>

              <div className="card-body">
                <p>
                  <strong>Zamówienie:</strong> #{delivery.orderId}
                </p>

                {/* Lista zamówionych pizz */}
                {order && order.items && order.items.length > 0 && (
                  <div className="order-items-section">
                    <p><strong>🍕 Zamówione pizze:</strong></p>
                    <div className="order-items-list">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item-inline">
                          <span className="item-quantity">{item.quantity}x</span>
                          <span className="item-name">{item.pizzaName || `Pizza #${item.pizzaId}`}</span>
                          {item.subtotal && (
                            <span className="item-price">{item.subtotal.toFixed(2)} PLN</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="order-total"><strong>Łącznie:</strong> {order.totalPrice.toFixed(2)} PLN</p>
                  </div>
                )}

                <p>
                  <strong>Klient:</strong> ID {delivery.customerId}
                </p>
                <p>
                  <strong>Adres:</strong> {delivery.deliveryAddress}
                </p>
                <p>
                  <strong>Telefon:</strong> {delivery.customerPhone}
                </p>
                {delivery.courierId && (
                  <p>
                    <strong>Kurier:</strong> ID {delivery.courierId}
                  </p>
                )}
                {delivery.notes && (
                  <p>
                    <strong>Uwagi:</strong> {delivery.notes}
                  </p>
                )}
                <p className="timestamp">
                  <small>Utworzono: {new Date(delivery.createdAt).toLocaleString('pl-PL')}</small>
                </p>
                {delivery.deliveredAt && (
                  <p className="timestamp">
                    <small>Dostarczono: {new Date(delivery.deliveredAt).toLocaleString('pl-PL')}</small>
                  </p>
                )}
              </div>

              <div className="card-actions">
                <select
                  className="status-select"
                  value={delivery.status}
                  onChange={(e) =>
                    handleStatusChange(delivery.id, e.target.value)
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>

                {delivery.status === 'PENDING' && (
                  <button
                    className="btn btn-info"
                    onClick={() => handleAssignCourierClick(delivery.id)}
                  >
                    Przypisz kuriera
                  </button>
                )}

                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteDelivery(delivery.id)}
                >
                  Usuń
                </button>
              </div>
            </div>
            );
          })
        )}
      </div>
      </div>
    </div>
  );
};

export default DeliveryManagement;

