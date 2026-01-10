import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API_URL = 'http://localhost:8080';

const CourierDashboard = () => {
  const { user, logout } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pobierz ID kuriera (trzeba dodać endpoint w auth-service żeby pobrać ID po username)
  const getCourierId = () => {
    // Tymczasowo używamy ID z localStorage, jeśli jest dostępne
    const userId = localStorage.getItem('userId');
    return userId || 1; // Fallback na 1
  };

  const fetchMyDeliveries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const courierId = getCourierId();
      
      console.log('Fetching deliveries for courierId:', courierId);
      console.log('Token:', token ? 'Token exists' : 'No token');
      console.log('Request URL:', `${API_URL}/api/deliveries?courierId=${courierId}`);
      
      const response = await axios.get(`${API_URL}/api/deliveries?courierId=${courierId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Response received:', response.data);
      console.log('Number of deliveries:', response.data.length);
      
      setDeliveries(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      setError('Nie udało się pobrać dostaw');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDeliveries();
  }, []);

  const handleNextStatus = async (deliveryId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${API_URL}/api/deliveries/${deliveryId}/next-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Odśwież listę dostaw
      fetchMyDeliveries();
    } catch (err) {
      console.error('Error updating delivery status:', err);
      alert('Nie udało się zaktualizować statusu: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      PENDING: 'Oczekuje',
      ASSIGNED: 'Przypisane',
      PICKED_UP: 'Odebrane',
      IN_TRANSIT: 'W drodze',
      DELIVERED: 'Dostarczone',
      CANCELLED: 'Anulowane'
    };
    return statusMap[status] || status;
  };

  const getNextStatusLabel = (status) => {
    const nextStatusMap = {
      ASSIGNED: 'Odbierz z restauracji',
      PICKED_UP: 'Rozpocznij dostawę',
      IN_TRANSIT: 'Oznacz jako dostarczone'
    };
    return nextStatusMap[status] || 'Następny status';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      PENDING: '#fbbf24',
      ASSIGNED: '#3b82f6',
      PICKED_UP: '#8b5cf6',
      IN_TRANSIT: '#f97316',
      DELIVERED: '#10b981',
      CANCELLED: '#ef4444'
    };
    return colorMap[status] || '#6b7280';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ 
          marginBottom: '2rem' 
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
            Panel Kuriera
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Zarządzaj swoimi dostawami
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            Ładowanie dostaw...
          </div>
        ) : deliveries.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
              Nie masz jeszcze przypisanych dostaw
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  borderLeft: `4px solid ${getStatusColor(delivery.status)}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>
                        Dostawa #{delivery.id}
                      </h3>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: getStatusColor(delivery.status) + '20',
                          color: getStatusColor(delivery.status),
                          borderRadius: '999px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}
                      >
                        {getStatusLabel(delivery.status)}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gap: '0.75rem', color: '#4b5563' }}>
                      <div>
                        <strong>Zamówienie:</strong> #{delivery.orderId}
                      </div>
                      <div>
                        <strong>Adres:</strong> {delivery.deliveryAddress}
                      </div>
                      <div>
                        <strong>Telefon:</strong> {delivery.customerPhone || 'Brak'}
                      </div>
                      {delivery.notes && (
                        <div>
                          <strong>Notatki:</strong> {delivery.notes}
                        </div>
                      )}
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        <strong>Data utworzenia:</strong> {new Date(delivery.createdAt).toLocaleString('pl-PL')}
                      </div>
                      {delivery.deliveredAt && (
                        <div style={{ fontSize: '0.875rem', color: '#10b981' }}>
                          <strong>Dostarczone:</strong> {new Date(delivery.deliveredAt).toLocaleString('pl-PL')}
                        </div>
                      )}
                    </div>
                  </div>

                  {delivery.status !== 'DELIVERED' && delivery.status !== 'CANCELLED' && delivery.status !== 'PENDING' && (
                    <button
                      onClick={() => handleNextStatus(delivery.id)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'background-color 0.2s',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                    >
                      {getNextStatusLabel(delivery.status)}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourierDashboard;
