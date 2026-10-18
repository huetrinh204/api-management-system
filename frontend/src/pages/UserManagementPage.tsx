import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listUsers, toggleUserStatus } from '../api/userApi';
import { useAuth } from '../store/authContext';
import type { User } from '../types';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [toggleTarget, setToggleTarget] = useState<User | null>(null);
  const [toggling, setToggling] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not Admin
  useEffect(() => {
    if (user && user.role !== 'Admin') {
      navigate('/api-docs');
    }
  }, [user, navigate]);

  async function fetchUsers() {
    setLoading(true);
    setFetchError('');
    try {
      const params: any = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.is_active = statusFilter === 'active';
      
      const res = await listUsers(params);
      setUsers(res);
    } catch {
      setFetchError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleToggleStatusConfirm() {
    if (!toggleTarget) return;
    setToggling(true);
    try {
      const updatedUser = await toggleUserStatus(toggleTarget.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
      setToggleTarget(null);
    } catch {
      setFetchError(
        `Failed to ${toggleTarget.is_active ? 'lock' : 'unlock'} "${toggleTarget.name}". Please try again.`
      );
      setToggleTarget(null);
    } finally {
      setToggling(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchUsers();
  };

  function getRoleBadgeClass(role: string) {
    const map: Record<string, string> = {
      'Admin': 'badge-danger',
      'BA': 'badge-primary',
      'Backend Developer': 'badge-info',
      'Frontend Developer': 'badge-success',
      'Tester': 'badge-warning',
    };
    return `badge ${map[role] || 'badge-neutral'}`;
  }

  if (user?.role !== 'Admin') {
    return null; // or redirect
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage user accounts and roles</p>
        </div>
        <Button variant="primary" leftIcon={<PlusIcon />} onClick={() => navigate('/users/new')}>
          New User
        </Button>
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="alert alert-error mb-4" role="alert">{fetchError}</div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="input-wrapper filter-search">
          <span className="input-icon-left"><SearchIcon /></span>
          <input
            type="search"
            className="form-input has-icon-left"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search users"
          />
        </div>
        <select
          className="form-select filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          aria-label="Filter by role"
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="BA">BA</option>
          <option value="Backend Developer">Backend Developer</option>
          <option value="Frontend Developer">Frontend Developer</option>
          <option value="Tester">Tester</option>
        </select>
        <select
          className="form-select filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="locked">Locked</option>
        </select>
        <Button variant="secondary" onClick={fetchUsers} aria-label="Apply filters">
          Search
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner label="Loading users..." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table" aria-label="User list">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 0, border: 'none' }}>
                    <EmptyState
                      icon={<UsersIcon />}
                      title={search || roleFilter || statusFilter ? 'No results found' : 'No users yet'}
                      description={
                        search || roleFilter || statusFilter
                          ? 'Try adjusting your search or filter criteria.'
                          : 'Create your first user to get started.'
                      }
                      action={
                        !search && !roleFilter && !statusFilter ? (
                          <Button variant="primary" leftIcon={<PlusIcon />} onClick={() => navigate('/users/new')}>
                            New User
                          </Button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{u.email}</td>
                    <td>
                      <span className={getRoleBadgeClass(u.role)}>{u.role}</span>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-success' : 'badge-neutral'}`}>
                        {u.is_active ? 'Active' : 'Locked'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      {new Date(u.createdAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="actions-cell">
                      <div className="flex gap-2">
                        {u.role !== 'Admin' && (
                          <>
                            <Link to={`/users/${u.id}/edit`} className="btn btn-warning btn-sm">
                              Edit
                            </Link>
                            <Button
                              variant={u.is_active ? 'danger' : 'warning'}
                              size="sm"
                              onClick={() => setToggleTarget(u)}
                              aria-label={u.is_active ? `Lock ${u.name}` : `Unlock ${u.name}`}
                            >
                              {u.is_active ? 'Lock' : 'Unlock'}
                            </Button>
                          </>
                        )}
                        {u.role === 'Admin' && (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Toggle Dialog */}
      <ConfirmDialog
        isOpen={Boolean(toggleTarget)}
        title={toggleTarget?.is_active ? 'Lock User Account' : 'Unlock User Account'}
        message={
          <>
            Are you sure you want to {toggleTarget?.is_active ? 'lock' : 'unlock'}{' '}
            <strong style={{ color: 'var(--text-primary)' }}>"{toggleTarget?.name}"</strong>?
            {toggleTarget?.is_active && (
              <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                This user will no longer be able to log in or access the system.
              </div>
            )}
          </>
        }
        confirmLabel={toggleTarget?.is_active ? 'Lock' : 'Unlock'}
        variant={toggleTarget?.is_active ? 'danger' : 'warning'}
        isLoading={toggling}
        onConfirm={handleToggleStatusConfirm}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  );
}
