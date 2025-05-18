import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './Detail.css';

const API_URL = 'http://localhost:5000/incidents';

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
        
        setIncident(response.data);
      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 500) {
          setError('Ошибка сервера. Пожалуйста, попробуйте позже.');
        } else {
          setError(err.message || 'Ошибка загрузки данных инцидента');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [id]);

  if (loading) return (
    <div className="spinner-container">
      <div className="loading-spinner"></div>
      <p>Загружаем данные инцидента...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <div className="error-icon">!</div>
      <h2>Ошибка: {error}</h2>
      <button onClick={() => window.location.reload()} className="retry-button">
        Попробовать снова
      </button>
    </div>
  );

  if (!incident) return (
    <div className="not-found-container">
      <h2>Инцидент не найден</h2>
      <button onClick={() => navigate('/')} className="back-button">
        Вернуться к списку
      </button>
    </div>
  );

  return (
    <div className="detail-container">
      <h1>{incident.title}</h1>
      <h2>Тип: {incident.type}</h2>
      
      <div className="detail-info">
        <div className="detail-row">
          <span className="detail-label">Дата:</span>
          <span>{incident.date}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Уровень серьезности:</span>
          <span>{incident.severity}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Статус:</span>
          <span>{incident.status}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Описание:</span>
          <p>{incident.description}</p>
        </div>
        {incident.actionsTaken && (
          <div className="detail-row">
            <span className="detail-label">Принятые меры:</span>
            <p>{incident.actionsTaken}</p>
          </div>
        )}
      </div>
      
      <div className="detail-actions">
        <button 
          onClick={() => navigate(`/edit/${id}`)} 
          className="edit-button"
        >
          Редактировать
        </button>
        <button onClick={() => navigate('/')} className="back-button">
          Назад к списку
        </button>
      </div>
    </div>
  );
};

export default Detail;