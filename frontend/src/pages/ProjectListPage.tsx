import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from '../api/projectApi';
import { useAuth } from '../store/authContext';
import type { Project } from '../types';
import ProjectBadge from '../components/ui/ProjectBadge';
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

function FolderIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-7l-2-2H5a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const canCreate = user?.role === 'BA' || user?.role === 'Backend Developer';
  const canDelete = user?.role === 'BA';

  async function fetchProjects() {
    setLoading(true);
    setFetchError('');
    try {
      const res = await getProjects({
        search: search || undefined,
        status: (statusFilter as 'Active' | 'Archived' | undefined) || undefined,
      });
      setProjects(res.data);
    } catch {
      setFetchError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProjects(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProject(deleteTarget.id);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setFetchError(`Failed to delete "${deleteTarget.name}". Please try again.`);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchProjects();
  };

  const truncate = (text: string | null, maxLength: number) => {
    if (!text) return '—';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Organize API documentation by project</p>
        </div>
        {canCreate && (
          <Button variant="primary" leftIcon={<PlusIcon />} onClick={() => navigate('/projects/new')}>
            New Project
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
            placeholder="Search project name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search projects"
          />
        </div>
        <select
          className="form-select filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Archived">Archived</option>
        </select>
        <Button variant="secondary" onClick={fetchProjects} aria-label="Apply filters">
          Search
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner label="Loading projects..." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table" aria-label="Projects list">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>API Docs</th>
                <th>Created By</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 0, border: 'none' }}>
                    <EmptyState
                      icon={<FolderIcon />}
                      title={search || statusFilter ? 'No results found' : 'No projects yet'}
                      description={
                        search || statusFilter
                          ? 'Try adjusting your search or filter criteria.'
                          : canCreate
                          ? 'Create your first project to organize API documentation.'
                          : 'No projects have been created yet.'
                      }
                      action={
                        canCreate && !search && !statusFilter ? (
                          <Button variant="primary" leftIcon={<PlusIcon />} onClick={() => navigate('/projects/new')}>
                            New Project
                          </Button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id}>
                    <td><ProjectBadge project={project} /></td>
                    <td>
                      <Link to={`/projects/${project.id}`} style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {project.name}
                      </Link>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '300px' }}>
                      {truncate(project.description, 60)}
                    </td>
                    <td>
                      <span className={`badge badge-${project.status === 'Active' ? 'active' : 'draft'}`}>
                        {project.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>
                      {project.apiDocsCount || 0}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {project.creator?.name || '—'}
                    </td>
                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      {new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="actions-cell">
                      <div className="flex gap-2">
                        <Link to={`/projects/${project.id}`} className="btn btn-ghost btn-sm">
                          View
                        </Link>
                        {canCreate && (
                          <Link to={`/projects/${project.id}/edit`} className="btn btn-warning btn-sm">
                            Edit
                          </Link>
                        )}
                        {canDelete && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteTarget(project)}
                            aria-label={`Delete ${project.name}`}
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
        title="Delete Project"
        message={
          <>
            Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>"{deleteTarget?.name}"</strong>?
            <div style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              All API documentation linked to this project will be set to "Unassigned". This action cannot be undone.
            </div>
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
