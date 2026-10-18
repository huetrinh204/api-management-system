import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from '../api/projectApi';
import { getApiDocs } from '../api/apiDocApi';
import { useAuth } from '../store/authContext';
import type { Project, ApiDoc } from '../types';
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

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectApis, setProjectApis] = useState<ApiDoc[]>([]);
  const [loadingApis, setLoadingApis] = useState(false);

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
      if (selectedProject?.id === deleteTarget.id) {
        setSelectedProject(null);
      }
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

  const handleProjectClick = async (project: Project) => {
    setSelectedProject(project);
    setLoadingApis(true);
    try {
      const res = await getApiDocs({ project_id: project.id });
      setProjectApis(res.data);
    } catch {
      setProjectApis([]);
    } finally {
      setLoadingApis(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden', margin: '-24px -32px' }}>
      {/* Left side - Project list */}
      <div style={{ flex: selectedProject ? '0 0 60%' : '1', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: selectedProject ? '1px solid var(--border-subtle)' : 'none' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
          {/* Page Header */}
          <div className="page-header" style={{ marginBottom: '20px' }}>
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
          <div className="filter-bar" style={{ marginTop: '16px' }}>
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
        </div>

        {/* Project Cards Grid */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {loading ? (
            <LoadingSpinner label="Loading projects..." />
          ) : projects.length === 0 ? (
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
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project)}
                  style={{
                    border: selectedProject?.id === project.id ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    backgroundColor: 'var(--bg-card)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedProject?.id !== project.id) {
                      e.currentTarget.style.borderColor = 'var(--border-hover)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProject?.id !== project.id) {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        className={`badge badge-${project.status === 'Active' ? 'active' : 'draft'}`}
                        style={{ fontSize: '0.65rem', padding: '2px 6px' }}
                      >
                        {project.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: project.color || 'var(--color-primary)',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        marginBottom: '8px',
                      }}
                    >
                      {project.code}
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                      {project.name}
                    </h3>
                  </div>

                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      margin: '8px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '40px',
                    }}
                  >
                    {project.description || 'No description'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                        }}
                      >
                        {getInitials(project.creator?.name || 'U')}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {project.apiDocsCount || 0} APIs
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side - Project detail */}
      {selectedProject && (
        <div style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}>
          {/* Detail Header */}
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span
                  className={`badge badge-${selectedProject.status === 'Active' ? 'active' : 'draft'}`}
                  style={{ fontSize: '0.7rem' }}
                >
                  {selectedProject.status}
                </span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px 0' }}>
                {selectedProject.name}
              </h2>
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  backgroundColor: selectedProject.color || 'var(--color-primary)',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {selectedProject.code}
              </div>
            </div>
            <button
              onClick={() => setSelectedProject(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--text-tertiary)',
              }}
              aria-label="Close detail panel"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Detail Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Description
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                {selectedProject.description || 'No description provided'}
              </p>
            </div>

            {/* Created By */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Created By
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {getInitials(selectedProject.creator?.name || 'U')}
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>
                    {selectedProject.creator?.name || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    {selectedProject.creator?.role || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* API Documentation */}
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '12px', textTransform: 'uppercase' }}>
                API Documentation ({selectedProject.apiDocsCount || 0})
              </h3>
              {loadingApis ? (
                <LoadingSpinner label="Loading APIs..." />
              ) : projectApis.length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  No API documentation in this project yet
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {projectApis.map((api) => (
                    <div
                      key={api.id}
                      onClick={() => navigate(`/api-docs/${api.id}`)}
                      style={{
                        padding: '12px',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: 'var(--bg-surface)',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-hover)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span
                          className="badge"
                          style={{
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            backgroundColor:
                              api.method === 'GET' ? '#10b981' :
                              api.method === 'POST' ? '#3b82f6' :
                              api.method === 'PUT' ? '#f59e0b' :
                              api.method === 'PATCH' ? '#8b5cf6' :
                              '#ef4444',
                            color: 'white',
                          }}
                        >
                          {api.method}
                        </span>
                        <code style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          {api.endpoint}
                        </code>
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{api.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
              {canCreate && (
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => navigate(`/projects/${selectedProject.id}/edit`)}
                >
                  Edit Project
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteTarget(selectedProject)}
                >
                  Delete Project
                </Button>
              )}
            </div>
          </div>
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
