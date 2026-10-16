import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getIssues } from '../api/issueApi';
import type { Issue } from '../types';

const PRIORITY_COLOR: Record<string, string> = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444' };
const STATUS_COLOR: Record<string, string> = {
  'Open': '#3b82f6', 'In Progress': '#f59e0b', 'Resolved': '#22c55e',
  'Closed': '#64748b', 'Reopened': '#8b5cf6',
};

export default function IssueListPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function fetchIssues() {
    setLoading(true);
    try {
      const res = await getIssues({ status: status || undefined, priority: priority || undefined });
      setIssues(res.data);
    } catch {
      alert('Không thể tải danh sách issue');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchIssues(); }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Tất cả Issues</h2>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 4 }}>
          <option value="">Tất cả Status</option>
          {['Open','In Progress','Resolved','Closed','Reopened'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={priority} onChange={e => setPriority(e.target.value)}
          style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 4 }}>
          <option value="">Tất cả Priority</option>
          {['Low','Medium','High'].map(p => <option key={p}>{p}</option>)}
        </select>
        <button onClick={fetchIssues}
          style={{ padding: '6px 16px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Lọc
        </button>
      </div>

      {loading ? <p>Đang tải...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px' }}>Tiêu đề</th>
              <th style={{ padding: '10px 12px' }}>Priority</th>
              <th style={{ padding: '10px 12px' }}>Status</th>
              <th style={{ padding: '10px 12px' }}>Người tạo</th>
              <th style={{ padding: '10px 12px' }}>Phụ trách</th>
              <th style={{ padding: '10px 12px' }}>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 16, textAlign: 'center', color: '#94a3b8' }}>Không có issue nào</td></tr>
            )}
            {issues.map(issue => (
              <tr key={issue.id} style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
                onClick={() => navigate(`/issues/${issue.id}`)}>
                <td style={{ padding: '10px 12px' }}>
                  <Link to={`/issues/${issue.id}`} style={{ color: '#1e293b', fontWeight: 500 }}>{issue.title}</Link>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ color: PRIORITY_COLOR[issue.priority], fontWeight: 600, fontSize: 13 }}>
                    {issue.priority}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ background: STATUS_COLOR[issue.status] + '22', color: STATUS_COLOR[issue.status],
                    padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                    {issue.status}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: '#64748b' }}>{issue.creator?.name || '-'}</td>
                <td style={{ padding: '10px 12px', color: '#64748b' }}>{issue.assignee?.name || '-'}</td>
                <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 13 }}>
                  {new Date(issue.createdAt).toLocaleDateString('vi-VN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
