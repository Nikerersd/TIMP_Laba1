import { Link } from 'react-router-dom';
import './NotFound.css'; // Создадим этот файл

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1 className="error-title">Страница не найдена</h1>
        <p className="error-message">
          Запрашиваемая вами страница не существует, была удалена<br />
          или временно недоступна.
        </p>
        <Link to="/" className="home-link">
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
};

export default NotFound;