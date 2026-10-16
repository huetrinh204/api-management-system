import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiDocs, deleteApiDoc } from '../api/apiDocApi';
import { useAuth } from '../store/authContext';
import type { ApiDoc } from '../types';

const METHOD_COLORS: Record<string, string> = {
  GET: '#22c55e', POST: '#3b82f6', PUT: '#f59e0b',
  PATCH: '#8b5cf6', DELETE: '#ef4444',
};

export default function ApiDocListPage() {
  const [docs, setDocs] = useState<ApiDoc[]>([]);
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const canCreate = user?.role === 'BA' || user?.role === 'Backend Developer';
  const canDelete = user?.role === 'BA';

  async function fetchDocs() {
    setLoading(true);
    try {
      const res = await getApiDocs({
        search: search || undefined,
        method: method || undefined,
        status: status || undefined,
      });
      setDocs(res.data);
    } catch {
      alert('Không thể tải danh sách API');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDocs(); }, []);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Xóa tài liệu "${name}"?`)) return;
    try {
      await deleteApiDoc(id);
      setDocs(prev => prev.filter(d => d.id !== id));
    } catch {
      alert('Xóa thất bại');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Tài liệu API</h2>
        {canCreate && (
          <button onClick={() => navigate('/api-docs/new')}
            style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            + Tạo mới
          </button>
        )}
      </div>

      {/* Bộ lọc */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input placeholder="Tìm tên hoặc endpoint..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 4, flex: 1, minWidth: 200 }} />
        <select value={method} onChange={e => setMethod(e.target.value)}
          style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 4 }}>
          <option value="">Tất cả Method</option>
          {['GET','POST','PUT','PATCH','DELETE'].map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 4 }}>
          <option value="">Tất cả Status</option>
          {['Draft','Active','Deprecated'].map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={fetchDocs}
          style={{ padding: '6px 16px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Tìm
        </button>
      </div>

      {loading ? <p>Đang tải...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px' }}>Method</th>
              <th style={{ padding: '10px 12px' }}>Endpoint</th>
              <th style={{ padding: '10px 12px' }}>Tên</th>
              <th style={{ padding: '10px 12px' }}>Status</th>
              <th style={{ padding: '10px 12px' }}>Người tạo</th>
              <th style={{ padding: '10px 12px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 16, textAlign: 'center', color: '#94a3b8' }}>Không có dữ liệu</td></tr>
            )}
            {docs.map(doc => (
              <tr key={doc.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ background: METHOD_COLORS[doc.method] || '#64748b', color: '#fff',
                    padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 'bold' }}>
                    {doc.method}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{doc.endpoint}</td>
                <td style={{ padding: '10px 12px' }}>
                  <Link to={`/api-docs/${doc.id}`} style={{ color: '#3b82f6' }}>{doc.name}</Link>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12,
                    background: doc.status === 'Active' ? '#dcfce7' : doc.status === 'Deprecated' ? '#fee2e2' : '#f1f5f9',
                    color: doc.status === 'Active' ? '#166534' : doc.status === 'Deprecated' ? '#991b1b' : '#475569' }}>
                    {doc.status}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: '#64748b' }}>{doc.creator?.name || '-'}</td>
                <td style={{ padding: '10px 12px' }}>
                  <Link to={`/api-docs/${doc.id}`} style={{ marginRight: 8, color: '#3b82f6', fontSize: 13 }}>Xem</Link>
                  {canCreate && (
                    <Link to={`/api-docs/${doc.id}/edit`} style={{ marginRight: 8, color: '#f59e0b', fontSize: 13 }}>Sửa</Link>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(doc.id, doc.name)}
                      style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
