import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const API_URL = 'http://localhost:5000/users';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Некорректный email';
    }
    if (!password) {
      newErrors.password = 'Пароль обязателен';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.get(`${API_URL}?email=${email}`, {
        validateStatus: function (status) {
          return status < 500; // Разрешаем только статусы меньше 500
        }
      });
      
      if (response.status === 500) {
        throw new Error('Ошибка сервера. Пожалуйста, попробуйте позже.');
      }
      
      if (response.data.length === 0) {
        throw new Error('Пользователь не найден');
      }
      
      const user = response.data[0];
      
      if (user.password !== password) {
        throw new Error('Неверный пароль');
      }
      
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: `mock-token-${user.id}`
      }));
      
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 500) {
        setErrors({ submit: 'Ошибка сервера. Пожалуйста, попробуйте позже.' });
      } else {
        setErrors({ submit: err.message || 'Ошибка входа' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Вход в аккаунт</h2>
      {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            className={errors.email ? 'is-invalid' : ''}
            placeholder="Введите ваш email"
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
        
        <div className="form-group">
          <label>Пароль</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            className={errors.password ? 'is-invalid' : ''}
            placeholder="Введите ваш пароль"
          />
          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
        </div>
        
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? 'Вход...' : 'Войти'}
        </button>
      </form>
      
      <div className="auth-footer">
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </div>
    </div>
  );
};

export default Login;