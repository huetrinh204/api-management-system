import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getIssue, updateIssueStatus } from '../api/issueApi';
import { getCommentsByIssue, createCommentOnIssue, deleteComment } from '../api/commentApi';
import { useAuth } from '../store/authContext';
import type { Issue, Comment, IssueStatus, UserRole } from '../types';

const STATUS_COLOR: Record<string, string> = {
  'Open': '#3b82f6', 'In Progress': '#f59e0b', 'Resolved': '#22c55e',
  'Closed': '#64748b', 'Reopened': '#8b5cf6',
};

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

export default function IssueDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const issueId = Number(id);
    getIssue(issueId).then(r => setIssue(r.data));
    getCommentsByIssue(issueId).then(r => setComments(r.data));
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
      setError(msg || 'Chuyển trạng thái thất bại');
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await createCommentOnIssue(Number(id), newComment);
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: number) {
    await deleteComment(commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  }

  if (!issue) return <p>Đang tải...</p>;

  const allowedTransitions = user ? getAllowedTransitions(issue.status, user.role) : [];
  const cardStyle = { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 16 };

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Link to="/issues" style={{ color: '#64748b', fontSize: 13 }}>← Danh sách Issues</Link>
        <h2 style={{ margin: '8px 0 4px' }}>{issue.title}</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ background: STATUS_COLOR[issue.status] + '22', color: STATUS_COLOR[issue.status],
            padding: '3px 10px', borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
            {issue.status}
          </span>
          <span style={{ fontSize: 13, color: '#64748b' }}>Priority: <strong>{issue.priority}</strong></span>
          <span style={{ fontSize: 13, color: '#64748b' }}>Tạo bởi: {issue.creator?.name || '-'}</span>
          {issue.assignee && <span style={{ fontSize: 13, color: '#64748b' }}>Phụ trách: {issue.assignee.name}</span>}
        </div>
      </div>

      {/* Mô tả */}
      <div style={cardStyle}>
        <strong>Mô tả:</strong>
        <p style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{issue.description}</p>
      </div>

      {/* Chuyển trạng thái */}
      {allowedTransitions.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <strong style={{ fontSize: 14 }}>Chuyển trạng thái:</strong>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {allowedTransitions.map(s => (
              <button key={s} onClick={() => handleStatusChange(s)} disabled={statusLoading}
                style={{ padding: '6px 14px', background: STATUS_COLOR[s], color: '#fff',
                  border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
                → {s}
              </button>
            ))}
          </div>
          {error && <p style={{ color: 'red', fontSize: 13, marginTop: 8 }}>{error}</p>}
        </div>
      )}

      {/* Comments */}
      <div>
        <h3>Bình luận ({comments.length})</h3>
        <div style={{ marginBottom: 16 }}>
          {comments.map(c => (
            <div key={c.id} style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <strong style={{ fontSize: 13 }}>{c.author?.name || 'Ẩn danh'}</strong>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  {new Date(c.createdAt).toLocaleString('vi-VN')}
                  {c.user_id === user?.id && (
                    <button onClick={() => handleDeleteComment(c.id)}
                      style={{ marginLeft: 8, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>
                      Xóa
                    </button>
                  )}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 14 }}>{c.content}</p>
            </div>
          ))}
          {comments.length === 0 && <p style={{ color: '#94a3b8', fontSize: 14 }}>Chưa có bình luận nào</p>}
        </div>
        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 8 }}>
          <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
            placeholder="Viết bình luận..." rows={2}
            style={{ flex: 1, padding: 8, border: '1px solid #cbd5e1', borderRadius: 4, resize: 'vertical' }} />
          <button type="submit" disabled={submitting}
            style={{ padding: '0 16px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
}
