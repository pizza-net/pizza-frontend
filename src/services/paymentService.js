import axios from 'axios';

const PAYMENT_API_URL = '/api/payments';

const paymentApi = axios.create({
  baseURL: PAYMENT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

paymentApi.interceptors.request.use(
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

paymentApi.interceptors.response.use(
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
 * Tworzy nową płatność
 * @param {Object} paymentData - { orderId, customerId, amount, currency, description }
 */
export const createPayment = async (paymentData) => {
  try {
    const response = await paymentApi.post('', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create payment';
  }
};

/**
 * Weryfikuje płatność po otrzymaniu callback z Razorpay
 * @param {Object} verificationData - { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId }
 */
export const verifyPayment = async (verificationData) => {
  try {
    const response = await paymentApi.post('/verify', verificationData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Nie udało się zweryfikować płatności';
  }
};

/**
 * Pobiera płatność po ID
 */
export const getPaymentById = async (id) => {
  try {
    const response = await paymentApi.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch payment';
  }
};

/**
 * Pobiera płatność dla konkretnego zamówienia
 */
export const getPaymentByOrderId = async (orderId) => {
  try {
    const response = await paymentApi.get(`/order/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch payment for order';
  }
};

/**
 * Pobiera wszystkie płatności klienta
 */
export const getPaymentsByCustomerId = async (customerId) => {
  try {
    const response = await paymentApi.get(`?customerId=${customerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch customer payments';
  }
};

/**
 * Pobiera płatności po statusie
 */
export const getPaymentsByStatus = async (status) => {
  try {
    const response = await paymentApi.get(`?status=${status}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch payments by status';
  }
};

/**
 * Anuluje płatność
 */
export const cancelPayment = async (id) => {
  try {
    const response = await paymentApi.patch(`/${id}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to cancel payment';
  }
};

