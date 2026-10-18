import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getUser, createUser, updateUser } from '../api/userApi';
import { useAuth } from '../store/authContext';
import Button from '../components/ui/Button';

const BUSINESS_ROLES = ['BA', 'Backend Developer', 'Frontend Developer', 'Tester'] as const;

export default function UserFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'BA' as typeof BUSINESS_ROLES[number],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [tempPassword, setTempPassword] = useState('');

  // Redirect if not Admin
  useEffect(() => {
    if (currentUser && currentUser.role !== 'Admin') {
      navigate('/api-docs');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!isEdit) return;
    setPageLoading(true);
    getUser(Number(id))
      .then((u) => {
        // Cannot edit Admin accounts
        if (u.role === 'Admin') {
          navigate('/users');
          return;
        }
        setForm({
          name: u.name,
          email: u.email,
          role: u.role as typeof BUSINESS_ROLES[number],
        });
      })
      .catch(() => navigate('/users'))
      .finally(() => setPageLoading(false));
  }, [id, isEdit, navigate]);

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setTempPassword('');

    // Validation
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required');
      return;
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updateUser(Number(id), {
          name: form.name.trim(),
          email: form.email.trim(),
        });
        navigate('/users');
      } else {
        const res = await createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
        });
        setTempPassword(res.temporaryPassword);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (currentUser?.role !== 'Admin') {
    return null;
  }

  if (pageLoading) {
    return (
      <div className="loading-state">
        <span className="spinner" />
        <span className="text-muted text-sm">Loading form data...</span>
      </div>
    );
  }

  // Success screen after creating user
  if (tempPassword) {
    return (
      <div className="max-w-2xl">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">User Created Successfully</h1>
            <p className="page-subtitle">Please share the temporary password with the user</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex flex-col gap-4">
              <div className="alert alert-success" role="status">
                User account has been created successfully.
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={form.email} readOnly />
              </div>

              <div className="form-group">
                <label className="form-label">Temporary Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    value={tempPassword}
                    readOnly
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}
                  />
                </div>
                <span className="form-hint" style={{ color: 'var(--text-warning)' }}>
                  ⚠️ Save this password now. It will not be shown again.
                </span>
              </div>

              <div className="flex gap-3 justify-end" style={{ marginTop: '16px' }}>
                <Button variant="primary" onClick={() => navigate('/users')}>
                  Back to User Management
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Back link */}
      <Link to="/users" className="page-back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M19 12H5M12 5l-7 7 7 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Users
      </Link>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{isEdit ? 'Edit' : 'New'} User</h1>
          <p className="page-subtitle">
            {isEdit
              ? 'Update the user details below and save your changes.'
              : 'Fill in the details to create a new user account.'}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name */}
            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="user-name">
                Full Name
              </label>
              <input
                id="user-name"
                className="form-input"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="user-email">
                Email
              </label>
              <input
                id="user-email"
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="e.g. john.doe@company.com"
                required
              />
              <span className="form-hint">Must be a valid and unique email address</span>
            </div>

            {/* Role */}
            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="user-role">
                Role
              </label>
              <select
                id="user-role"
                className="form-select"
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                disabled={isEdit}
              >
                {BUSINESS_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <span className="form-hint">
                {isEdit
                  ? 'User role cannot be changed after creation'
                  : 'Select the business role for this user'}
              </span>
            </div>

            {!isEdit && (
              <div className="alert alert-info" role="status">
                A temporary password will be generated and displayed after creating the account.
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end" style={{ marginTop: '8px' }}>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                {isEdit ? 'Save Changes' : 'Create User'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
