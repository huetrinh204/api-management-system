import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiDocs, deleteApiDoc } from '../api/apiDocApi';
import { useAuth } from '../store/authContext';
import type { ApiDoc } from '../types';
import { MethodBadge, DocStatusBadge } from '../components/ui/Badge';
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

function BookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ApiDocListPage() {
  const [docs, setDocs] = useState<ApiDoc[]>([]);
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ApiDoc | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const canCreate = user?.role === 'BA' || user?.role === 'Backend Developer';
  const canDelete = user?.role === 'BA';

  async function fetchDocs() {
    setLoading(true);
    setFetchError('');
    try {
      const res = await getApiDocs({
        search: search || undefined,
        method: method || undefined,
        status: status || undefined,
      });
      setDocs(res.data);
    } catch {
      setFetchError('Failed to load API documentation. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDocs(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteApiDoc(deleteTarget.id);
      setDocs((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setFetchError(`Failed to delete "${deleteTarget.name}". Please try again.`);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchDocs();
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">API Documentation</h1>
          <p className="page-subtitle">Browse and manage your team's API contracts</p>
        </div>
        {canCreate && (
          <Button variant="primary" leftIcon={<PlusIcon />} onClick={() => navigate('/api-docs/new')}>
            New API Doc
          </Button>
        )}
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
            placeholder="Search name or endpoint..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search API docs"
          />
        </div>
        <select
          className="form-select filter-select"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          aria-label="Filter by HTTP method"
        >
          <option value="">All Methods</option>
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select
          className="form-select filter-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {['Draft', 'Active', 'Deprecated'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <Button variant="secondary" onClick={fetchDocs} aria-label="Apply filters">
          Search
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner label="Loading API docs..." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table" aria-label="API documentation list">
            <thead>
              <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Name</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 0, border: 'none' }}>
                    <EmptyState
                      icon={<BookIcon />}
                      title={search || method || status ? 'No results found' : 'No API docs yet'}
                      description={
                        search || method || status
                          ? 'Try adjusting your search or filter criteria.'
                          : canCreate
                          ? 'Create your first API documentation to get started.'
                          : 'No API documentation has been created yet.'
                      }
                      action={
                        canCreate && !search && !method && !status ? (
                          <Button variant="primary" leftIcon={<PlusIcon />} onClick={() => navigate('/api-docs/new')}>
                            New API Doc
                          </Button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                docs.map((doc) => (
                  <tr key={doc.id}>
                    <td><MethodBadge method={doc.method} /></td>
                    <td className="endpoint-cell" title={doc.endpoint}>
                      <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {doc.endpoint}
                      </code>
                    </td>
                    <td>
                      <Link to={`/api-docs/${doc.id}`} style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {doc.name}
                      </Link>
                    </td>
                    <td><DocStatusBadge status={doc.status} /></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {doc.creator?.name || '—'}
                    </td>
                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      {new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="actions-cell">
                      <div className="flex gap-2">
                        <Link to={`/api-docs/${doc.id}`} className="btn btn-ghost btn-sm">
                          View
                        </Link>
                        {canCreate && (
                          <Link to={`/api-docs/${doc.id}/edit`} className="btn btn-warning btn-sm">
                            Edit
                          </Link>
                        )}
                        {canDelete && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteTarget(doc)}
                            aria-label={`Delete ${doc.name}`}
                          >
                            Delete
                          </Button>
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete API Documentation"
        message={
          <>
            Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>"{deleteTarget?.name}"</strong>?
            This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
