import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getIssues } from '../api/issueApi';
import type { Issue } from '../types';
import { IssueStatusBadge, PriorityBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function IssueIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function IssueListPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const navigate = useNavigate();

  async function fetchIssues() {
    setLoading(true);
    setFetchError('');
    try {
      const res = await getIssues({ status: status || undefined, priority: priority || undefined });
      setIssues(res.data);
    } catch {
      setFetchError('Failed to load issues. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchIssues(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Issues</h1>
          <p className="page-subtitle">Track and manage issues across all API documentation</p>
        </div>
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="alert alert-error mb-4" role="alert">{fetchError}</div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <select
          className="form-select filter-select"
          value={status}
          onChange={e => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {['Open', 'In Progress', 'Resolved', 'Closed', 'Reopened'].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          className="form-select filter-select"
          value={priority}
          onChange={e => setPriority(e.target.value)}
          aria-label="Filter by priority"
        >
          <option value="">All Priorities</option>
          {['Low', 'Medium', 'High'].map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <Button variant="secondary" onClick={fetchIssues} aria-label="Apply filters">
          Filter
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner label="Loading issues..." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table" aria-label="Issues list">
            <thead>
              <tr>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Assignee</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 0, border: 'none' }}>
                    <EmptyState
                      icon={<IssueIcon />}
                      title={status || priority ? 'No matching issues' : 'No issues yet'}
                      description={
                        status || priority
                          ? 'Try adjusting your filter criteria.'
                          : 'Issues will appear here once created from an API documentation page.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                issues.map(issue => (
                  <tr
                    key={issue.id}
                    onClick={() => navigate(`/issues/${issue.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <Link
                        to={`/issues/${issue.id}`}
                        style={{ fontWeight: 500, color: 'var(--text-primary)' }}
                        onClick={e => e.stopPropagation()}
                      >
                        {issue.title}
                      </Link>
                    </td>
                    <td><PriorityBadge priority={issue.priority} /></td>
                    <td><IssueStatusBadge status={issue.status} /></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {issue.creator?.name || '—'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {issue.assignee?.name || '—'}
                    </td>
                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      {formatDate(issue.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
