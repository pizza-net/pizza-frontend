import axios from 'axios';

// API Base URL - przez Gateway (relatywny URL)
const API_URL = '/api/deliveries';

// Instancja axios z konfiguracją
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor dodający token do każdego requestu
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor obsługujący błędy 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Utworzenie nowej dostawy
 * @param {Object} deliveryData - { orderId, customerId, deliveryAddress, customerPhone, notes, latitude, longitude }
 * @returns {Promise<Object>} - DeliveryResponse
 */
export const createDelivery = async (deliveryData) => {
  try {
    const response = await api.post('', deliveryData);
    return response.data;
  } catch (error) {
    console.error('Błąd tworzenia dostawy:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Nie udało się utworzyć dostawy';
    throw new Error(errorMsg);
  }
};

/**
 * Pobranie dostawy po ID
 * @param {number} id
 * @returns {Promise<Object>} - DeliveryResponse
 */
export const getDeliveryById = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error('Błąd pobierania dostawy:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Nie znaleziono dostawy';
    throw new Error(errorMsg);
  }
};

/**
 * Pobranie dostawy po orderId
 * @param {number} orderId
 * @returns {Promise<Object>} - DeliveryResponse
 */
export const getDeliveryByOrderId = async (orderId) => {
  try {
    const response = await api.get(`/by-order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Błąd pobierania dostawy po orderId:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Nie znaleziono dostawy dla zamówienia';
    throw new Error(errorMsg);
  }
};

/**
 * Pobranie wszystkich dostaw z opcjonalnym filtrowaniem
 * @param {Object} filters - { status, courierId, customerId }
 * @returns {Promise<Array>} - Lista DeliveryResponse
 */
export const getAllDeliveries = async (filters = {}) => {
  try {
    const response = await api.get('', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Błąd pobierania dostaw:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Nie udało się pobrać dostaw';
    throw new Error(errorMsg);
  }
};

/**
 * Zmiana statusu dostawy
 * @param {number} id
 * @param {string} status - PENDING, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED
 * @returns {Promise<Object>} - DeliveryResponse
 */
export const updateDeliveryStatus = async (id, status) => {
  try {
    const response = await api.patch(`/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Błąd zmiany statusu:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Nie udało się zaktualizować statusu';
    throw new Error(errorMsg);
  }
};

/**
 * Przypisanie kuriera do dostawy
 * @param {number} id
 * @param {number} courierId
 * @returns {Promise<Object>} - DeliveryResponse
 */
export const assignCourier = async (id, courierId) => {
  try {
    const response = await api.patch(`/${id}/assign`, { courierId });
    return response.data;
  } catch (error) {
    console.error('Błąd przypisania kuriera:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Nie udało się przypisać kuriera';
    throw new Error(errorMsg);
  }
};

/**
 * Usunięcie dostawy
 * @param {number} id
 * @returns {Promise<void>}
 */
export const deleteDelivery = async (id) => {
  try {
    await api.delete(`/${id}`);
  } catch (error) {
    console.error('Błąd usuwania dostawy:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Nie udało się usunąć dostawy';
    throw new Error(errorMsg);
  }
};

/**
 * Pobranie dostaw kuriera
 * @param {number} courierId
 * @returns {Promise<Array>}
 */
export const getCourierDeliveries = async (courierId) => {
  return getAllDeliveries({ courierId });
};

/**
 * Pobranie dostaw klienta
 * @param {number} customerId
 * @returns {Promise<Array>}
 */
export const getCustomerDeliveries = async (customerId) => {
  return getAllDeliveries({ customerId });
};

/**
 * Pobranie dostaw po statusie
 * @param {string} status
 * @returns {Promise<Array>}
 */
export const getDeliveriesByStatus = async (status) => {
  return getAllDeliveries({ status });
};

export default {
  createDelivery,
  getDeliveryById,
  getDeliveryByOrderId,
  getAllDeliveries,
  updateDeliveryStatus,
  assignCourier,
  deleteDelivery,
  getCourierDeliveries,
  getCustomerDeliveries,
  getDeliveriesByStatus,
};

