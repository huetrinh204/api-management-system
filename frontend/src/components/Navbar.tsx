import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ padding: '12px 24px', background: '#1e293b', color: '#fff', display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Link to="/api-docs" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
        API Docs
      </Link>
      <Link to="/issues" style={{ color: '#fff', textDecoration: 'none' }}>
        Issues
      </Link>
      <span style={{ marginLeft: 'auto', fontSize: '14px' }}>
        {user?.name} ({user?.role})
      </span>
      <button onClick={handleLogout} style={{ cursor: 'pointer' }}>
        Đăng xuất
      </button>
    </nav>
  );
}
