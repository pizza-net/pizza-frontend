import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
import './Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Walidacja po stronie klienta
    if (!username || !email || !password || !confirmPassword) {
      setError('Wszystkie pola są wymagane');
      setLoading(false);
      return;
    }

    if (username.length < 3 || username.length > 20) {
      setError('Nazwa użytkownika musi mieć od 3 do 20 znaków');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Hasła nie są zgodne');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Nieprawidłowy format email');
      setLoading(false);
      return;
    }

    try {
      const result = await register(username, email, password);
      setSuccess(result.message || 'Rejestracja przebiegła pomyślnie! Możesz się teraz zalogować.');

      // Przekierowanie do logowania po 2 sekundach
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err || 'Błąd rejestracji. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h1>🍕 Pizza Net</h1>
        <h2>Rejestracja</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nazwa użytkownika</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Wprowadź nazwę użytkownika (3-20 znaków)"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Wprowadź adres email"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Hasło</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wprowadź hasło (min. 6 znaków)"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Potwierdź hasło</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Powtórz hasło"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Rejestracja...' : 'Zarejestruj się'}
          </button>
        </form>

        <div className="register-footer">
          <p>Masz już konto? <Link to="/login">Zaloguj się</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;

