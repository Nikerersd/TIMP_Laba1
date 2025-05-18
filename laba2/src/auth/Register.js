import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const API_URL = 'http://localhost:5000/users';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, password2 } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = 'Имя обязательно';
    if (!email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Некорректный email';
    }
    if (password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }
    if (password !== password2) {
      newErrors.password2 = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    setErrors({}); // Очищаем предыдущие ошибки
    
    try {
      // Проверяем, нет ли уже пользователя с таким email
      const checkResponse = await axios.get(`${API_URL}?email=${email}`);
      
      if (checkResponse.data.length > 0) {
        throw new Error('Пользователь с таким email уже существует');
      }
      
      // Создаем нового пользователя
      const newUser = {
        name,
        email,
        password,
        role: 'user'
      };
      
      const response = await axios.post(API_URL, newUser);
      
      console.log('Пользователь создан:', response.data);
      navigate('/login');
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      
      let errorMessage = 'Ошибка регистрации';
      
      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = 'Некорректные данные для регистрации';
            break;
          case 500:
            errorMessage = 'Ошибка сервера. Пожалуйста, попробуйте позже';
            break;
          default:
            errorMessage = `Ошибка сервера: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = 'Не удалось соединиться с сервером. Проверьте подключение к интернету';
      } else {
        errorMessage = err.message || 'Ошибка регистрации';
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Создать аккаунт</h2>
      {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label>Полное имя</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={handleChange}
            className={errors.name ? 'is-invalid' : ''}
            placeholder="Введите ваше имя"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        
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
            placeholder="Не менее 6 символов"
          />
          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
        </div>
        
        <div className="form-group">
          <label>Подтвердите пароль</label>
          <input
            type="password"
            name="password2"
            value={password2}
            onChange={handleChange}
            className={errors.password2 ? 'is-invalid' : ''}
            placeholder="Повторите пароль"
          />
          {errors.password2 && <div className="invalid-feedback">{errors.password2}</div>}
        </div>
        
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
      
      <div className="auth-footer">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </div>
    </div>
  );
};

export default Register;