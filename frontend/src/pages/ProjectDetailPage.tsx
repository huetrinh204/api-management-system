import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProject, deleteProject, getApiDocsByProject } from '../api/projectApi';
import { useAuth } from '../store/authContext';
import type { Project, ApiDoc } from '../types';
import ProjectBadge from '../components/ui/ProjectBadge';
import { MethodBadge, DocStatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [apiDocs, setApiDocs] = useState<ApiDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canEdit = user?.role === 'BA' || user?.role === 'Backend Developer';
  const canDelete = user?.role === 'BA';
  const canCreateDoc = user?.role === 'BA' || user?.role === 'Backend Developer';

  useEffect(() => {
    const projectId = Number(id);
    setLoading(true);
    Promise.all([
      getProject(projectId),
      getApiDocsByProject(projectId),
    ])
      .then(([projectRes, docsRes]) => {
        setProject(projectRes.data);
        setApiDocs(docsRes.data);
      })
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleDeleteProject() {
    if (!project) return;
    setDeleting(true);
    try {
      await deleteProject(project.id);
      navigate('/projects');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading project..." />;
  if (!project) return null;

  return (
    <div className="max-w-3xl">
      {/* Back link */}
      <Link to="/projects" className="page-back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Projects
      </Link>

      {/* Header */}
      <div className="page-header">
        <div className="page-header-left min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <ProjectBadge project={project} size="md" />
            <span className={`badge badge-${project.status === 'Active' ? 'active' : 'draft'}`}>
              {project.status}
            </span>
          </div>
          <h1 className="page-title">{project.name}</h1>
        </div>
        <div className="page-header-actions">
          {canEdit && (
            <Button variant="warning" size="sm" leftIcon={<EditIcon />} onClick={() => navigate(`/projects/${id}/edit`)}>
              Edit
            </Button>
          )}
          {canDelete && (
            <Button variant="danger" size="sm" onClick={() => setDeleteDialog(true)}>
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Metadata Card */}
      <div className="card mb-5">
        <div className="card-body">
          <div className="detail-meta-grid">
            <div className="detail-meta-item">
              <div className="detail-meta-label">Description</div>
              <div className="detail-meta-value" style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontWeight: 400 }}>
                {project.description || '—'}
              </div>
            </div>
            <div className="detail-meta-item">
              <div className="detail-meta-label">Project Code</div>
              <div className="detail-meta-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                {project.code}
              </div>
            </div>
            <div className="detail-meta-item">
              <div className="detail-meta-label">Color</div>
              <div className="detail-meta-value">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      backgroundColor: project.color || '#6366F1',
                      border: '1px solid var(--border)',
                    }}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    {project.color || '#6366F1'}
                  </span>
                </div>
              </div>
            </div>
            <div className="detail-meta-item">
              <div className="detail-meta-label">Created By</div>
              <div className="detail-meta-value">{project.creator?.name || '—'}</div>
            </div>
            <div className="detail-meta-item">
              <div className="detail-meta-label">Created</div>
              <div className="detail-meta-value">{formatDate(project.createdAt)}</div>
            </div>
            <div className="detail-meta-item">
              <div className="detail-meta-label">Last Updated</div>
              <div className="detail-meta-value">{formatDate(project.updatedAt)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* API Documentation Section */}
      <div className="card mb-5">
        <div className="card-header">
          <h2 className="card-title">
            API Documentation
            <span className="badge badge-draft" style={{ fontSize: '0.6875rem', marginLeft: '8px' }}>
              {apiDocs.length}
            </span>
          </h2>
          {canCreateDoc && (
            <Link
              to="/api-docs/new"
              state={{ project_id: project.id }}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusIcon /> New API Doc
            </Link>
          )}
        </div>
        <div className="card-body" style={{ padding: apiDocs.length === 0 ? 0 : undefined }}>
          {apiDocs.length === 0 ? (
            <EmptyState
              icon={<BookIcon />}
              title="No API documentation yet"
              description="This project doesn't have any API documentation. Create one to get started."
              action={
                canCreateDoc ? (
                  <Link to="/api-docs/new" state={{ project_id: project.id }}>
                    <Button variant="primary" leftIcon={<PlusIcon />}>
                      New API Doc
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="table-wrapper" style={{ margin: '-12px -20px' }}>
              <table className="data-table" aria-label="API documentation list">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Endpoint</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {apiDocs.map((doc) => (
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
                      <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                        {new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog}
        title="Delete Project"
        message={
          <>
            Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>"{project.name}"</strong>?
            <div style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              All API documentation ({apiDocs.length}) linked to this project will be set to "Unassigned". This action cannot be undone.
            </div>
          </>
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleting}
        onConfirm={handleDeleteProject}
        onCancel={() => setDeleteDialog(false)}
      />
    </div>
  );
}
