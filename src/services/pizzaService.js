import axios from 'axios';

const PIZZA_API_URL = '/api/pizza';

const pizzaApi = axios.create({
  baseURL: PIZZA_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

pizzaApi.interceptors.request.use(
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

pizzaApi.interceptors.response.use(
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

export const getPizzas = async () => {
  try {
    const response = await pizzaApi.get('');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Nie udało się pobrać pizz';
  }
};

export const addPizza = async (pizzaData) => {
  try {
    const response = await pizzaApi.post('', pizzaData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Nie udało się dodać pizzy';
  }
};


export const deletePizza = async (id) => {
  try {
    const response = await pizzaApi.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Nie udało się usunąć pizzy';
  }
};

export const updatePizza = async (id, pizzaData) => {
  try {
    const response = await pizzaApi.put(`/${id}`, pizzaData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Nie udało się zaktualizować pizzy';
  }
};

