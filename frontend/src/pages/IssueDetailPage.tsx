import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getIssue, updateIssueStatus } from '../api/issueApi';
import { getCommentsByIssue, createCommentOnIssue, deleteComment } from '../api/commentApi';
import { useAuth } from '../store/authContext';
import type { Issue, Comment, IssueStatus, UserRole } from '../types';
import { IssueStatusBadge, PriorityBadge } from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CommentSection from '../components/CommentSection';

// Các chuyển trạng thái hợp lệ theo role
function getAllowedTransitions(current: IssueStatus, role: UserRole): IssueStatus[] {
  const map: Record<IssueStatus, { to: IssueStatus; roles: UserRole[] }[]> = {
    'Open':        [{ to: 'In Progress', roles: ['BA','Backend Developer','Frontend Developer','Tester'] }],
    'In Progress': [{ to: 'Resolved',    roles: ['BA','Backend Developer','Frontend Developer','Tester'] }],
    'Resolved':    [
      { to: 'Closed',   roles: ['BA','Tester'] },
      { to: 'Reopened', roles: ['Tester'] },
    ],
    'Reopened':    [{ to: 'In Progress', roles: ['BA','Backend Developer','Frontend Developer','Tester'] }],
    'Closed':      [],
  };
  return (map[current] || [])
    .filter(t => t.roles.includes(role))
    .map(t => t.to);
}

function getWorkflowBtnClass(status: IssueStatus): string {
  const map: Record<string, string> = {
    'In Progress': 'workflow-btn workflow-btn-inprogress',
    'Resolved':    'workflow-btn workflow-btn-resolved',
    'Closed':      'workflow-btn workflow-btn-closed',
    'Reopened':    'workflow-btn workflow-btn-reopened',
  };
  return map[status] ?? 'workflow-btn';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function IssueDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const issueId = Number(id);
    setLoading(true);
    Promise.all([
      getIssue(issueId),
      getCommentsByIssue(issueId),
    ])
      .then(([issueRes, commentsRes]) => {
        setIssue(issueRes.data);
        setComments(commentsRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStatusChange(newStatus: IssueStatus) {
    if (!issue) return;
    setStatusLoading(true);
    setError('');
    try {
      const res = await updateIssueStatus(issue.id, newStatus);
      setIssue(res.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Failed to update status. Please try again.');
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleAddComment(content: string) {
    const res = await createCommentOnIssue(Number(id), content);
    setComments(prev => [...prev, res.data]);
  }

  async function handleDeleteComment(commentId: number) {
    await deleteComment(commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  }

  if (loading) return <LoadingSpinner label="Loading issue..." />;
  if (!issue) return null;

  const allowedTransitions = user ? getAllowedTransitions(issue.status, user.role) : [];

  return (
    <div className="max-w-3xl">
      {/* Back link */}
      <Link to="/issues" className="page-back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Issues
      </Link>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div className="page-header-left min-w-0">
          <h1 className="page-title">{issue.title}</h1>
        </div>
      </div>

      {/* Status + Meta */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <IssueStatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </div>
          <div className="detail-meta-grid">
            <div className="detail-meta-item">
              <div className="detail-meta-label">Created By</div>
              <div className="detail-meta-value">{issue.creator?.name || '—'}</div>
            </div>
            {issue.assignee && (
              <div className="detail-meta-item">
                <div className="detail-meta-label">Assignee</div>
                <div className="detail-meta-value">{issue.assignee.name}</div>
              </div>
            )}
            <div className="detail-meta-item">
              <div className="detail-meta-label">Created</div>
              <div className="detail-meta-value">{formatDate(issue.createdAt)}</div>
            </div>
            <div className="detail-meta-item">
              <div className="detail-meta-label">Last Updated</div>
              <div className="detail-meta-value">{formatDateTime(issue.updatedAt)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="detail-meta-label mb-2">Description</div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, fontSize: '0.875rem' }}>
            {issue.description}
          </p>
        </div>
      </div>

      {/* Status transitions */}
      {allowedTransitions.length > 0 && (
        <div className="workflow-section">
          <div className="workflow-title">Transition Status</div>
          <div className="workflow-actions">
            {allowedTransitions.map(s => (
              <button
                key={s}
                className={getWorkflowBtnClass(s)}
                onClick={() => handleStatusChange(s)}
                disabled={statusLoading}
                type="button"
              >
                <ArrowIcon />
                {s}
              </button>
            ))}
          </div>
          {error && (
            <div className="alert alert-error mt-4" role="alert">{error}</div>
          )}
        </div>
      )}

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
    </div>
  );
}
