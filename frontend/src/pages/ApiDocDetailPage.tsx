import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getApiDoc, deleteApiDoc } from '../api/apiDocApi';
import { getCommentsByApiDoc, createCommentOnApiDoc, deleteComment } from '../api/commentApi';
import { getIssuesByApiDoc } from '../api/issueApi';
import { useAuth } from '../store/authContext';
import type { ApiDoc, Comment, Issue } from '../types';
import { MethodBadge, DocStatusBadge, IssueStatusBadge, PriorityBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import CodeBlock from '../components/ui/CodeBlock';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import CommentSection from '../components/CommentSection';

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function ApiDocDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doc, setDoc] = useState<ApiDoc | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canEdit = user?.role === 'BA' || user?.role === 'Backend Developer';
  const canDelete = user?.role === 'BA';

  useEffect(() => {
    const docId = Number(id);
    setLoading(true);
    Promise.all([
      getApiDoc(docId),
      getCommentsByApiDoc(docId),
      getIssuesByApiDoc(docId),
    ])
      .then(([docRes, commentsRes, issuesRes]) => {
        setDoc(docRes.data);
        setComments(commentsRes.data);
        setIssues(issuesRes.data);
      })
      .catch(() => navigate('/api-docs'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleDeleteDoc() {
    setDeleting(true);
    try {
      await deleteApiDoc(Number(id));
      navigate('/api-docs');
    } finally {
      setDeleting(false);
    }
  }

  async function handleAddComment(content: string) {
    const res = await createCommentOnApiDoc(Number(id), content);
    setComments((prev) => [...prev, res.data]);
  }

  async function handleDeleteComment(commentId: number) {
    await deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  if (loading) return <LoadingSpinner label="Loading API documentation..." />;
  if (!doc) return null;

  return (
    <div className="max-w-3xl">
      {/* Back link */}
      <Link to="/api-docs" className="page-back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to API Docs
      </Link>

      {/* Header */}
      <div className="page-header">
        <div className="page-header-left min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <MethodBadge method={doc.method} />
            <DocStatusBadge status={doc.status} />
          </div>
          <h1 className="page-title">{doc.name}</h1>
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block', wordBreak: 'break-all' }}>
            {doc.endpoint}
          </code>
        </div>
        <div className="page-header-actions">
          {canEdit && (
            <Button variant="warning" size="sm" leftIcon={<EditIcon />} onClick={() => navigate(`/api-docs/${id}/edit`)}>
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

      {/* Meta info */}
      <div className="card mb-5">
        <div className="card-body">
          <div className="detail-meta-grid">
            <div className="detail-meta-item">
              <div className="detail-meta-label">Description</div>
              <div className="detail-meta-value" style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontWeight: 400 }}>
                {doc.description || '—'}
              </div>
            </div>
            <div className="detail-meta-item">
              <div className="detail-meta-label">Created By</div>
              <div className="detail-meta-value">{doc.creator?.name || '—'}</div>
            </div>
            <div className="detail-meta-item">
              <div className="detail-meta-label">Created</div>
              <div className="detail-meta-value">{formatDate(doc.createdAt)}</div>
            </div>
            <div className="detail-meta-item">
              <div className="detail-meta-label">Last Updated</div>
              <div className="detail-meta-value">{formatDate(doc.updatedAt)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Request / Response samples */}
      {(doc.request_sample || doc.response_sample) && (
        <div className="flex gap-4 mb-5" style={{ flexWrap: 'wrap' }}>
          {doc.request_sample !== undefined && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Request Sample
              </p>
              <CodeBlock code={doc.request_sample} lang="JSON" emptyText="No request sample provided" />
            </div>
          )}
          {doc.response_sample !== undefined && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Response Sample
              </p>
              <CodeBlock code={doc.response_sample} lang="JSON" emptyText="No response sample provided" />
            </div>
          )}
        </div>
      )}

      {/* Related Issues */}
      <div className="card mb-5">
        <div className="card-header">
          <h2 className="card-title">
            Issues
            <span className="badge badge-draft" style={{ fontSize: '0.6875rem', marginLeft: '8px' }}>{issues.length}</span>
          </h2>
          <Link to={`/api-docs/${id}/issues/new`} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <PlusIcon /> New Issue
          </Link>
        </div>
        <div className="card-body" style={{ padding: issues.length === 0 ? 0 : '12px 20px' }}>
          {issues.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
              No issues linked to this API yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {issues.slice(0, 5).map((issue) => (
                <Link
                  key={issue.id}
                  to={`/issues/${issue.id}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--surface-2)', borderRadius: '6px', border: '1px solid var(--border-subtle)', textDecoration: 'none', transition: 'border-color 0.15s' }}
                >
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{issue.title}</span>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={issue.priority} />
                    <IssueStatusBadge status={issue.status} />
                  </div>
                </Link>
              ))}
              {issues.length > 5 && (
                <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-link)', marginTop: '4px' }}>
                  + {issues.length - 5} more issues
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="card mb-5">
        <div className="card-body">
          <CommentSection
            comments={comments}
            currentUserId={user?.id}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteDialog}
        title="Delete API Documentation"
        message={<>Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>"{doc.name}"</strong>? This cannot be undone.</>}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleting}
        onConfirm={handleDeleteDoc}
        onCancel={() => setDeleteDialog(false)}
      />
    </div>
  );
}
