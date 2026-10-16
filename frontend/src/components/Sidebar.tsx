import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authContext';
import { useTheme } from '../store/themeContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// SVG icon components (inline, no external lib)
function BookIcon() {
  return (
    <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IssueIcon() {
  return (
    <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ApiHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  console.log('Sidebar render, isOpen:', isOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close sidebar after navigation on mobile
  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <aside
      id="app-sidebar"
      className={`app-sidebar${isOpen ? ' open' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Brand + mobile close button */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <ApiHubIcon />
        </div>
        <div>
          <div className="sidebar-brand-name">API Hub</div>
          <div className="sidebar-brand-tagline">Documentation System</div>
        </div>
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          type="button"
          aria-label="Close navigation menu"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="sidebar-nav-label">Workspace</p>
        <NavLink
          to="/api-docs"
          className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
          onClick={handleNavClick}
        >
          <BookIcon />
          API Docs
        </NavLink>
        <NavLink
          to="/issues"
          className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
          onClick={handleNavClick}
        >
          <IssueIcon />
          Issues
        </NavLink>
      </nav>

      {/* User + Theme + Logout */}
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar" aria-hidden="true">
              {getInitials(user.name)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name" title={user.name}>{user.name}</div>
              <div className="sidebar-user-role" title={user.role}>{user.role}</div>
            </div>
          </div>
        )}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          type="button"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          className="sidebar-logout-btn"
          onClick={handleLogout}
          type="button"
          aria-label="Log out"
        >
          <LogoutIcon />
          Log Out
        </button>
      </div>
    </aside>
  );
}
