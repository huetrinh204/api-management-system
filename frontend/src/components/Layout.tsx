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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => {
    console.log('openSidebar called, setting sidebarOpen to true');
    setSidebarOpen(true);
  }, []);
  
  const closeSidebar = useCallback(() => {
    console.log('closeSidebar called, setting sidebarOpen to false');
    setSidebarOpen(false);
  }, []);

  console.log('Layout render, sidebarOpen:', sidebarOpen);

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
