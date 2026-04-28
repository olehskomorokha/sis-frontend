import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="brand">
        <h1>Smart Influence</h1>
        <p>Платформа для аналізу інфлуенсерів</p>
      </div>
      <button className="header-button" type="button" onClick={() => navigate('/login')}>
        Увійти
      </button>
    </header>
  );
}

export default Header;
