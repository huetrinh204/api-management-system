import { type FormEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createIssue } from '../api/issueApi';

export default function IssueFormPage() {
  const { id } = useParams(); // api doc id
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium' });
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
      setError(msg || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { display: 'block', width: '100%', padding: '8px', marginTop: 4,
    border: '1px solid #cbd5e1', borderRadius: 4, boxSizing: 'border-box' as const };

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>Tạo Issue mới</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label>Tiêu đề *</label>
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} required />
        </div>
        <div>
          <label>Mô tả *</label>
          <textarea style={{ ...inputStyle, height: 100 }} value={form.description}
            onChange={e => set('description', e.target.value)} required />
        </div>
        <div>
          <label>Mức ưu tiên *</label>
          <select style={inputStyle} value={form.priority} onChange={e => set('priority', e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading}
            style={{ padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            {loading ? 'Đang tạo...' : 'Tạo Issue'}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            style={{ padding: '8px 20px', background: '#e2e8f0', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
