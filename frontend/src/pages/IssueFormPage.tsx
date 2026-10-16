import { type FormEvent, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createIssue } from '../api/issueApi';
import type { IssuePriority } from '../types';
import Button from '../components/ui/Button';

export default function IssueFormPage() {
  const { id } = useParams(); // api doc id
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium' as IssuePriority });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createIssue(Number(id), form);
      navigate(`/api-docs/${id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Back link */}
      <Link to={`/api-docs/${id}`} className="page-back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to API Doc
      </Link>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">New Issue</h1>
          <p className="page-subtitle">Create a new issue linked to this API documentation.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Title */}
            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="issue-title">Title</label>
              <input
                id="issue-title"
                className="form-input"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Briefly describe the issue..."
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="issue-desc">Description</label>
              <textarea
                id="issue-desc"
                className="form-textarea"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Provide detailed information about the issue..."
                required
                rows={5}
              />
            </div>

            {/* Priority */}
            <div className="form-group" style={{ maxWidth: '280px' }}>
              <label className="form-label form-label-required" htmlFor="issue-priority">Priority</label>
              <select
                id="issue-priority"
                className="form-select"
                value={form.priority}
                onChange={e => set('priority', e.target.value)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-error" role="alert">{error}</div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end" style={{ marginTop: '8px' }}>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Create Issue
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
