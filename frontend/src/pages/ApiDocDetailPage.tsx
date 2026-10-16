import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getApiDoc, deleteApiDoc } from '../api/apiDocApi';
import { getCommentsByApiDoc, createCommentOnApiDoc, deleteComment } from '../api/commentApi';
import { getIssuesByApiDoc } from '../api/issueApi';
import { useAuth } from '../store/authContext';
import type { ApiDoc, Comment, Issue } from '../types';

const METHOD_COLORS: Record<string, string> = {
  GET: '#22c55e', POST: '#3b82f6', PUT: '#f59e0b', PATCH: '#8b5cf6', DELETE: '#ef4444',
};

export default function ApiDocDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doc, setDoc] = useState<ApiDoc | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canEdit = user?.role === 'BA' || user?.role === 'Backend Developer';
  const canDelete = user?.role === 'BA';

  useEffect(() => {
    const docId = Number(id);
    getApiDoc(docId).then(r => setDoc(r.data)).catch(() => navigate('/api-docs'));
    getCommentsByApiDoc(docId).then(r => setComments(r.data));
    getIssuesByApiDoc(docId).then(r => setIssues(r.data));
  }, [id, navigate]);

  async function handleDeleteDoc() {
    if (!confirm(`Xóa tài liệu "${doc?.name}"?`)) return;
    await deleteApiDoc(Number(id));
    navigate('/api-docs');
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await createCommentOnApiDoc(Number(id), newComment);
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

  if (!doc) return <p>Đang tải...</p>;

  const cardStyle = { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 16 };

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ background: METHOD_COLORS[doc.method], color: '#fff', padding: '3px 10px',
              borderRadius: 4, fontWeight: 'bold', fontSize: 13 }}>{doc.method}</span>
            <code style={{ fontSize: 16, fontWeight: 'bold' }}>{doc.endpoint}</code>
          </div>
          <h2 style={{ margin: 0 }}>{doc.name}</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {canEdit && (
            <button onClick={() => navigate(`/api-docs/${id}/edit`)}
              style={{ padding: '6px 14px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Sửa
            </button>
          )}
          {canDelete && (
            <button onClick={handleDeleteDoc}
              style={{ padding: '6px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Xóa
            </button>
          )}
        </div>
      </div>

      {/* Chi tiết */}
      <div style={cardStyle}>
        <p><strong>Mô tả:</strong> {doc.description}</p>
        <p style={{ margin: 0 }}><strong>Trạng thái:</strong> {doc.status} &nbsp;|&nbsp; <strong>Người tạo:</strong> {doc.creator?.name || '-'}</p>
      </div>

      {(doc.request_sample || doc.response_sample) && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {doc.request_sample && (
            <div style={{ flex: 1, ...cardStyle, margin: 0 }}>
              <strong>Request mẫu:</strong>
              <pre style={{ marginTop: 8, overflow: 'auto', fontSize: 13 }}>{doc.request_sample}</pre>
            </div>
          )}
          {doc.response_sample && (
            <div style={{ flex: 1, ...cardStyle, margin: 0 }}>
              <strong>Response mẫu:</strong>
              <pre style={{ marginTop: 8, overflow: 'auto', fontSize: 13 }}>{doc.response_sample}</pre>
            </div>
          )}
        </div>
      )}

      {/* Issues liên quan */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Issues ({issues.length})</h3>
          <Link to={`/api-docs/${id}/issues/new`}
            style={{ padding: '5px 12px', background: '#3b82f6', color: '#fff', borderRadius: 4, textDecoration: 'none', fontSize: 13 }}>
            + Tạo Issue
          </Link>
        </div>
        {issues.length === 0
          ? <p style={{ color: '#94a3b8', fontSize: 14 }}>Chưa có issue nào</p>
          : issues.slice(0, 5).map(issue => (
            <div key={issue.id} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <Link to={`/issues/${issue.id}`} style={{ color: '#1e293b', textDecoration: 'none', fontWeight: 500 }}>
                {issue.title}
              </Link>
              <span style={{ fontSize: 12, color: '#64748b' }}>{issue.priority} · {issue.status}</span>
            </div>
          ))
        }
        {issues.length > 5 && (
          <Link to={`/issues?apiDocId=${id}`} style={{ fontSize: 13, color: '#3b82f6' }}>Xem tất cả {issues.length} issues →</Link>
        )}
      </div>

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
