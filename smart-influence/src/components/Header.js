import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  return (
    <header className="header">
      <button className="brand" type="button" onClick={() => navigate('/')}>
        <h1>Smart Influence</h1>
      </button>
      <button className="header-button" type="button" onClick={() => navigate(token ? '/profile' : '/login')}>
        {token ? 'Профіль' : 'Увійти'}
      </button>
    </header>
  );
}

export default Header;
