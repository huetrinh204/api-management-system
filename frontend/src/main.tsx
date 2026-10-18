import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { ThemeProvider } from './store/themeContext';
import { AuthProvider } from './store/authContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import ApiDocListPage from './pages/ApiDocListPage';
import ApiDocDetailPage from './pages/ApiDocDetailPage';
import ApiDocFormPage from './pages/ApiDocFormPage';
import IssueListPage from './pages/IssueListPage';
import IssueDetailPage from './pages/IssueDetailPage';
import IssueFormPage from './pages/IssueFormPage';
import ProjectListPage from './pages/ProjectListPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectFormPage from './pages/ProjectFormPage';
import UserManagementPage from './pages/UserManagementPage';
import UserFormPage from './pages/UserFormPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
    <AuthProvider>

      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/api-docs" replace />} />

            {/* Projects */}
            <Route path="projects" element={<ProjectListPage />} />
            <Route path="projects/new" element={<ProjectFormPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="projects/:id/edit" element={<ProjectFormPage />} />

            {/* API Docs */}
            <Route path="api-docs" element={<ApiDocListPage />} />
            <Route path="api-docs/new" element={<ApiDocFormPage />} />
            <Route path="api-docs/:id" element={<ApiDocDetailPage />} />
            <Route path="api-docs/:id/edit" element={<ApiDocFormPage />} />
            <Route path="api-docs/:id/issues/new" element={<IssueFormPage />} />

            {/* Issues */}
            <Route path="issues" element={<IssueListPage />} />
            <Route path="issues/:id" element={<IssueDetailPage />} />

            {/* Users (Admin only) */}
            <Route path="users" element={<UserManagementPage />} />
            <Route path="users/new" element={<UserFormPage />} />
            <Route path="users/:id/edit" element={<UserFormPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
