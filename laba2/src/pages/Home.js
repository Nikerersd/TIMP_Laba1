import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Home.css';
import axios from 'axios';

const API_URL = 'http://localhost:5000/incidents';

const Home = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    id: null
  });

  useEffect(() => {
      const fetchIncidents = async () => {
        try {
          const response = await axios.get(API_URL, {
            validateStatus: function (status) {
              return status < 500;
            }
          });

          if (response.status === 500) {
            throw new Error('Ошибка сервера. Пожалуйста, попробуйте позже.');
          }

          setIncidents(response.data);
        } catch (err) {
          console.error(err);
          if (err.response && err.response.status === 500) {
            setError('Ошибка сервера. Пожалуйста, попробуйте позже.');
          } else {
            setError(err.message || 'Ошибка загрузки данных');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchIncidents();
    }, []);

    const handleDelete = async (id) => {
      setDeletingId(id); // Устанавливаем ID удаляемого элемента
      try {
        const response = await axios.delete(`${API_URL}/${id}`, {
          validateStatus: function (status) {
            return status < 500;
          }
        });

        if (response.status === 500) {
          throw new Error('Ошибка сервера. Пожалуйста, попробуйте позже.');
        }

        setIncidents(incidents.filter(incident => incident.id !== id));
        setDeleteModal({ show: false, id: null });
      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 500) {
          setError('Ошибка сервера. Пожалуйста, попробуйте позже.');
        } else {
          setError('Ошибка при удалении инцидента');
        }
      } finally {
        setDeletingId(null); // Сбрасываем после завершения
      }
    };

    if (loading) {
      return (
        <div className="spinner-container">
          <div className="loading-spinner"></div>
        </div>
      );
    }

    if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="home-container">
      <h1>Система безопасности аэрокосмического комплекса</h1>
      
      <div className="entity-sections">
        <section className="incident-list">
          <h2>Список инцидентов</h2>
          <ul>
            {incidents.map(incident => (
              <li key={incident.id} className="entity-item">
                <Link to={`/detail/${incident.id}`} className="entity-link">
                  {incident.title}
                </Link>
                <button 
                  onClick={() => setDeleteModal({ show: true, id: incident.id })}
                  className="delete-button"
                  title="Удалить"
                  disabled={deletingId === incident.id}
                >
                  {deletingId === incident.id ? (
                    <span className="mini-spinner"></span>
                  ) : (
                    '×'
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="actions">
        <Link to="/add" className="action-button">
          Добавить инцидент
        </Link>
      </div>

      {deleteModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить этот инцидент?</p>
            <div className="modal-actions">
              <button 
                onClick={() => handleDelete(deleteModal.id)} 
                className="modal-button confirm"
                disabled={deletingId === deleteModal.id}
              >
                {deletingId === deleteModal.id ? (
                  <>
                    <span className="button-spinner"></span> Удаление...
                  </>
                ) : (
                  'Удалить'
                )}
              </button>
              {/* ... */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;