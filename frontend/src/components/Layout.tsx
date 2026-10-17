import { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ApiHubIcon() {
  return (
    <img 
      src="/logo.png" 
      alt="API Hub logo" 
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Close sidebar when resizing to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setSidebarOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen, closeSidebar]);

  return (
    <div className="app-shell">
      {/* Mobile top header — only visible on small screens */}
      <header className="mobile-header" role="banner">
        <button
          className="mobile-menu-btn"
          onClick={openSidebar}
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar"
        >
          <MenuIcon />
        </button>
        <div className="mobile-brand">
          <div className="mobile-brand-icon" aria-hidden="true">
            <ApiHubIcon />
          </div>
          <span className="mobile-brand-name">API Hub</span>
        </div>
      </header>

      {/* Sidebar overlay — behind sidebar, closes when tapping outside */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="app-content">
        <div className="nebula-accent" aria-hidden="true" />
        <main className="page-wrapper" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
