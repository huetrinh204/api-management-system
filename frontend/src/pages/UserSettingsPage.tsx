import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, changePassword } from '../api/profileApi';
import { useAuth } from '../store/authContext';
import { useTheme } from '../store/themeContext';
import type { User } from '../types';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function UserSettingsPage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
      setName(data.name);
      setAvatarUrl(data.avatar_url || '');
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setUpdating(true);
    try {
      const updated = await updateProfile({
        name: name.trim(),
        avatar_url: avatarUrl.trim() || null,
      });
      setProfile(updated);
      
      // Update auth context
      if (user) {
        login(localStorage.getItem('token')!, { ...user, name: updated.name, avatar_url: updated.avatar_url });
      }

      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({ oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password changed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-state">
        <LoadingSpinner label="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-header-left">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account settings and preferences</p>
        </div>
      </div>

      {/* Global messages */}
      {error && (
        <div className="alert alert-error mb-4" role="alert">{error}</div>
      )}
      {success && (
        <div className="alert alert-success mb-4" role="status">{success}</div>
      )}

      {/* Profile Section */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">Profile Information</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
            {/* Avatar Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--border-subtle)',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.setAttribute('style', 'display: flex');
                  }}
                />
              ) : null}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  display: avatarUrl ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: 600,
                }}
              >
                {getInitials(name || profile?.name || 'U')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, marginBottom: '4px' }}>{profile?.name}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{profile?.email}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>{profile?.role}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="settings-name">
                Full Name
              </label>
              <input
                id="settings-name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="settings-avatar">
                Avatar URL
              </label>
              <input
                id="settings-avatar"
                type="url"
                className="form-input"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
              <span className="form-hint">Provide a URL to your profile image (optional)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="primary" isLoading={updating}>
                Update Profile
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Theme Section */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">Appearance</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: '4px' }}>Theme</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Choose between light and dark mode
              </div>
            </div>
            <Button variant="secondary" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ marginRight: '8px' }}>
                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Switch to Light Mode
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ marginRight: '8px' }}>
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Switch to Dark Mode
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Change Password</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="settings-old-password">
                Current Password
              </label>
              <input
                id="settings-old-password"
                type="password"
                className="form-input"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter your current password"
              />
            </div>

            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="settings-new-password">
                New Password
              </label>
              <input
                id="settings-new-password"
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
              />
              <span className="form-hint">Must be at least 8 characters</span>
            </div>

            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="settings-confirm-password">
                Confirm New Password
              </label>
              <input
                id="settings-confirm-password"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={changingPassword}>
                Change Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
