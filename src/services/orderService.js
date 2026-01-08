import axios from 'axios';

const ORDER_API_URL = '/api/orders';

const orderApi = axios.create({
  baseURL: ORDER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

orderApi.interceptors.request.use(
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

orderApi.interceptors.response.use(
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

export const createOrder = async (orderData) => {
  try {
    const response = await orderApi.post('', orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create order';
  }
};

export const getOrders = async () => {
  try {
    const response = await orderApi.get('');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch orders';
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await orderApi.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch order';
  }
};

export const getOrdersByCustomerId = async (customerId) => {
  try {
    const response = await orderApi.get(`?customerId=${customerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch customer orders';
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const response = await orderApi.patch(`/${id}/status?status=${status}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update order status';
  }
};

export const deleteOrder = async (id) => {
  try {
    const response = await orderApi.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete order';
  }
};
