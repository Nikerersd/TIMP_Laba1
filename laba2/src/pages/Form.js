import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './Form.css';

const API_URL = 'http://localhost:5000/incidents';

const Form = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    type: 'Кибербезопасность',
    date: new Date().toISOString().split('T')[0],
    severity: 'Средний',
    status: 'Открыт',
    description: '',
    actionsTaken: ''
  });
  const [loading, setLoading] = useState({
    form: mode === 'edit', // Для начальной загрузки в режиме редактирования
    submit: false
  });
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && id) {
      const fetchIncident = async () => {
        try {
          const response = await axios.get(`${API_URL}/${id}`, {
            validateStatus: function (status) {
              return status < 500;
            }
          });

          if (response.status === 500) {
            throw new Error('Ошибка сервера. Пожалуйста, попробуйте позже.');
          }

          if (response.status === 404) {
            throw new Error('Инцидент не найден');
          }
        
          setFormData(response.data);
        } catch (err) {
          console.error(err);
          if (err.response && err.response.status === 500) {
            setError('Ошибка сервера. Пожалуйста, попробуйте позже.');
          } else {
            setError(err.message || 'Ошибка загрузки данных инцидента');
          }
        } finally {
          setLoading(prev => ({ ...prev, form: false }));
        }
      };

      fetchIncident();
    }
  }, [id, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Название инцидента обязательно';
    } else if (formData.title.length > 100) {
      errors.title = 'Название не должно превышать 100 символов';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Описание инцидента обязательно';
    } else if (formData.description.length > 1000) {
      errors.description = 'Описание не должно превышать 1000 символов';
    }
    
    if (!formData.date) {
      errors.date = 'Дата инцидента обязательна';
    } else {
      const selectedDate = new Date(formData.date);
      const currentDate = new Date();
      
      if (selectedDate > currentDate) {
        errors.date = 'Дата инцидента не может быть в будущем';
      }
    }
    
    if (formData.actionsTaken && formData.actionsTaken.length > 1000) {
      errors.actionsTaken = 'Принятые меры не должны превышать 1000 символов';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) return;
      
      setLoading(prev => ({ ...prev, submit: true }));
      setError(null);

      try {
        // Имитация задержки для демонстрации (убрать в продакшене)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (mode === 'add') {
          await axios.post(API_URL, formData, {
            validateStatus: function (status) {
              return status < 500;
            }
          });
        } else {
          await axios.put(`${API_URL}/${id}`, formData, {
            validateStatus: function (status) {
              return status < 500;
            }
          });
        }
        navigate('/');
      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 500) {
          setError('Ошибка сервера. Пожалуйста, попробуйте позже.');
        } else {
          setError(err.message || 'Ошибка при сохранении данных');
        }
      } finally {
        setLoading(prev => ({ ...prev, submit: false }));
      }
    };

    if (loading.form) {
      return (
        <div className="form-loading-container">
          <div className="form-spinner"></div>
          <p>Загружаем данные инцидента...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="form-error-container">
          <div className="error-icon">!</div>
          <h2>{error}</h2>
          <button 
            onClick={() => mode === 'edit' ? window.location.reload() : navigate('/')}
            className="error-action-button"
          >
            {mode === 'edit' ? 'Попробовать снова' : 'Вернуться к списку'}
          </button>
        </div>
      );
    }

    return (
      <div className="form-container">
        <h1>{mode === 'add' ? 'Добавление инцидента' : 'Редактирование инцидента'}</h1>
        
        {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Название инцидента:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={validationErrors.title ? 'error' : ''}
          />
          {validationErrors.title && (
            <span className="validation-error">{validationErrors.title}</span>
          )}
        </div>

        <div className="form-group">
          <label>Тип инцидента:</label>
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="Кибербезопасность">Кибербезопасность</option>
            <option value="Технический сбой">Технический сбой</option>
            <option value="Человеческий фактор">Человеческий фактор</option>
          </select>
        </div>

        <div className="form-group">
          <label>Дата инцидента:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={validationErrors.date ? 'error' : ''}
          />
          {validationErrors.date && (
            <span className="validation-error">{validationErrors.date}</span>
          )}
        </div>

        <div className="form-group">
          <label>Уровень серьезности:</label>
          <select name="severity" value={formData.severity} onChange={handleChange}>
            <option value="Критический">Критический</option>
            <option value="Высокий">Высокий</option>
            <option value="Средний">Средний</option>
            <option value="Низкий">Низкий</option>
          </select>
        </div>

        <div className="form-group">
          <label>Статус:</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Открыт">Открыт</option>
            <option value="В работе">В работе</option>
            <option value="Закрыт">Закрыт</option>
          </select>
        </div>

        <div className="form-group">
          <label>Описание:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className={validationErrors.description ? 'error' : ''}
          />
          {validationErrors.description && (
            <span className="validation-error">{validationErrors.description}</span>
          )}
        </div>

        <div className="form-group">
          <label>Принятые меры:</label>
          <textarea
            name="actionsTaken"
            value={formData.actionsTaken}
            onChange={handleChange}
            rows="4"
            className={validationErrors.actionsTaken ? 'error' : ''}
          />
          {validationErrors.actionsTaken && (
            <span className="validation-error">{validationErrors.actionsTaken}</span>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading.submit} 
            className="submit-button"
          >
            {loading.submit ? (
              <>
                <span className="button-spinner"></span>
                Сохранение...
              </>
            ) : 'Сохранить'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="cancel-button"
            disabled={loading.submit}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;