import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-content">
        <div className="nebula-accent" aria-hidden="true" />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
