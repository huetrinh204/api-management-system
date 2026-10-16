import { useState } from 'react';
import type { Comment } from '../types';
import Button from './ui/Button';
import EmptyState from './ui/EmptyState';

interface CommentSectionProps {
  comments: Comment[];
  currentUserId?: number;
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CommentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CommentSection({
  comments,
  currentUserId,
  onAddComment,
  onDeleteComment,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch {
      setSubmitError('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section aria-label="Comments">
      <div className="card-header" style={{ padding: '12px 0', marginBottom: '16px', borderTop: '1px solid var(--border-subtle)', borderBottom: 'none' }}>
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CommentIcon />
          Comments
          <span className="badge badge-draft" style={{ fontSize: '0.6875rem' }}>{comments.length}</span>
        </h3>
      </div>

      {comments.length === 0 ? (
        <EmptyState
          title="No comments yet"
          description="Be the first to leave a comment."
        />
      ) : (
        <div className="comment-list">
          {comments.map((c) => (
            <div key={c.id} className="comment-card">
              <div className="comment-header">
                <div className="comment-author">
                  <div className="comment-avatar" aria-hidden="true">
                    {getInitials(c.author?.name ?? 'U')}
                  </div>
                  <span className="comment-author-name">{c.author?.name ?? 'Unknown'}</span>
                </div>
                <div className="comment-meta">
                  <time className="comment-time" dateTime={c.createdAt}>
                    {formatDate(c.createdAt)}
                  </time>
                  {c.user_id === currentUserId && (
                    <button
                      onClick={() => onDeleteComment(c.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '2px 8px', color: 'var(--color-danger)', fontSize: '0.75rem' }}
                      aria-label="Delete this comment"
                      type="button"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="comment-content">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="mt-4" aria-label="Add a comment">
        {submitError && (
          <div className="alert alert-error mb-3" role="alert">{submitError}</div>
        )}
        <div className="comment-input-row">
          <textarea
            className="form-textarea flex-1"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            aria-label="Comment content"
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            disabled={!newComment.trim()}
            style={{ alignSelf: 'flex-end' }}
          >
            Post
          </Button>
        </div>
      </form>
    </section>
  );
}
