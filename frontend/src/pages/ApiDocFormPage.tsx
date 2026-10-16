import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiDoc, createApiDoc, updateApiDoc } from '../api/apiDocApi';
import type { HttpMethod, ApiDocStatus } from '../types';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const STATUSES: ApiDocStatus[] = ['Draft', 'Active', 'Deprecated'];

export default function ApiDocFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', method: 'GET' as HttpMethod, endpoint: '',
    description: '', status: 'Draft' as ApiDocStatus,
    request_sample: '', response_sample: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getApiDoc(Number(id)).then(res => {
      const d = res.data;
      setForm({
        name: d.name, method: d.method, endpoint: d.endpoint,
        description: d.description, status: d.status,
        request_sample: d.request_sample || '', response_sample: d.response_sample || '',
      });
    });
  }, [id, isEdit]);

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        request_sample: form.request_sample || null,
        response_sample: form.response_sample || null,
      };
      if (isEdit) {
        await updateApiDoc(Number(id), payload);
      } else {
        await createApiDoc(payload);
      }
      navigate('/api-docs');
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
    <div style={{ maxWidth: 700 }}>
      <h2>{isEdit ? 'Chỉnh sửa' : 'Tạo mới'} tài liệu API</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label>Tên API *</label>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Method *</label>
            <select style={inputStyle} value={form.method} onChange={e => set('method', e.target.value)}>
              {METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Status *</label>
            <select style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label>Endpoint *</label>
          <input style={inputStyle} value={form.endpoint} onChange={e => set('endpoint', e.target.value)}
            placeholder="/api/example" required />
        </div>
        <div>
          <label>Mô tả *</label>
          <textarea style={{ ...inputStyle, height: 80 }} value={form.description}
            onChange={e => set('description', e.target.value)} required />
        </div>
        <div>
          <label>Request mẫu (JSON)</label>
          <textarea style={{ ...inputStyle, height: 100, fontFamily: 'monospace' }}
            value={form.request_sample} onChange={e => set('request_sample', e.target.value)}
            placeholder='{"key": "value"}' />
        </div>
        <div>
          <label>Response mẫu (JSON)</label>
          <textarea style={{ ...inputStyle, height: 100, fontFamily: 'monospace' }}
            value={form.response_sample} onChange={e => set('response_sample', e.target.value)}
            placeholder='{"data": [...]}' />
        </div>
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading}
            style={{ padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
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
