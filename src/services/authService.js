import axios from 'axios';

const API_URL = '/api/auth';

// Konfiguracja axios
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
 * Rejestracja użytkownika
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} { message }
 */
export const register = async (username, email, password) => {
  try {
    const response = await api.post('/register', { username, email, password });
    return { success: true, message: response.data };
  } catch (error) {
    throw error.response?.data || 'Registration failed';
  }
};

/**
 * Logowanie użytkownika
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<Object>} { token, username, message }
 */
export const login = async (username, password) => {
  try {
    const response = await api.post('/login', { username, password });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

/**
 * Wylogowanie użytkownika
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
};

/**
 * Weryfikacja tokenu
 * @returns {Promise<boolean>}
 */
export const verifyToken = async () => {
  try {
    const response = await api.get('/verify');
    return response.status === 200;
  } catch {
    return false;
  }
};

/**
 * Pobieranie listy użytkowników (wymaga autentykacji)
 * @returns {Promise<Array>}
 */
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (err) {
    throw err.response?.data?.message || 'Failed to fetch users';
  }
};

/**
 * Sprawdzenie czy użytkownik jest zalogowany
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Pobranie aktualnego username
 * @returns {string|null}
 */
export const getCurrentUsername = () => {
  return localStorage.getItem('username');
};

export default {
  register,
  login,
  logout,
  verifyToken,
  getUsers,
  isAuthenticated,
  getCurrentUsername,
};
