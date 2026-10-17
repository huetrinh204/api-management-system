import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/authApi';
import { useAuth } from '../store/authContext';
import { useTheme } from '../store/themeContext';
import Button from '../components/ui/Button';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi(email.trim().toLowerCase(), password);
      login(res.data.token, res.data.user);
      navigate('/api-docs');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'BA',               email: 'ba@example.com' },
    { role: 'Backend Dev',      email: 'backend@example.com' },
    { role: 'Frontend Dev',     email: 'frontend@example.com' },
    { role: 'Tester',           email: 'tester@example.com' },
  ];

  return (
    <main className="login-page">
      <button
        className="theme-toggle-float"
        onClick={toggleTheme}
        type="button"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>

      <div className="login-layout">
        <aside className="login-brand-panel">
          <div className="login-brand">
            <div className="login-logo-icon">
              <ApiHubIcon />
            </div>
            <span className="login-brand-name">API Hub</span>
          </div>

          <div className="login-brand-copy">
            <p className="login-eyebrow">API DOCUMENTATION WORKSPACE</p>
            <h1>Keep every API clear and current.</h1>
            <p className="login-brand-description">
              A shared workspace for your API contracts, project docs, and team feedback.
            </p>
          </div>

          <div className="login-api-preview" aria-label="Example API documentation">
            <div className="login-api-preview-heading">YOUR API WORKSPACE</div>
            <div className="login-api-row">
              <span className="login-api-method">GET</span>
              <code>/v1/projects</code>
              <span className="login-api-status">Active</span>
            </div>
            <div className="login-api-row">
              <span className="login-api-method login-api-method-post">POST</span>
              <code>/v1/users</code>
              <span className="login-api-status">Active</span>
            </div>
            <div className="login-api-row">
              <span className="login-api-method login-api-method-patch">PATCH</span>
              <code>/v1/issues/:id</code>
              <span className="login-api-status">Draft</span>
            </div>
          </div>

          <p className="login-brand-footer">Built for teams that ship APIs.</p>
        </aside>

        <section className="login-content" aria-labelledby="login-title">
          <div className="login-panel">
            <p className="login-eyebrow login-content-eyebrow">TEAM WORKSPACE</p>
            <h2 className="login-title" id="login-title">Welcome back</h2>
            <p className="login-subtitle">Sign in with your work account to continue.</p>

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              {error && (
                <div className="alert alert-error" id="login-error" role="alert">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="email">Work email</label>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    className="form-input has-icon-left"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    autoComplete="email"
                    aria-describedby={error ? 'login-error' : undefined}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input has-icon-left has-icon-right"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-icon-right login-password-toggle"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-full login-submit"
              >
                Sign In
              </Button>
            </form>

            <div className="login-demo">
              <div className="login-demo-heading">
                <p className="login-demo-title">Demo access</p>
                <span>Password: password123</span>
              </div>
              {demoAccounts.map((acc) => (
                <div key={acc.role} className="login-demo-row">
                  <span className="login-demo-role">{acc.role}</span>
                  <button
                    type="button"
                    onClick={() => setEmail(acc.email)}
                    className="login-demo-email"
                    aria-label={`Use ${acc.role} demo account`}
                  >
                    {acc.email}
                  </button>
                </div>
              ))}
            </div>

            <p className="login-help">Need an account? Contact your workspace administrator.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
