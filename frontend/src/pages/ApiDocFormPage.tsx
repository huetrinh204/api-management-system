import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { getApiDoc, createApiDoc, updateApiDoc } from '../api/apiDocApi';
import type { HttpMethod, ApiDocStatus } from '../types';
import Button from '../components/ui/Button';
import ProjectSelect from '../components/ProjectSelect';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const STATUSES: ApiDocStatus[] = ['Draft', 'Active', 'Deprecated'];

export default function ApiDocFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: '', method: 'GET' as HttpMethod, endpoint: '',
    description: '', status: 'Draft' as ApiDocStatus,
    request_sample: '', response_sample: '',
    project_id: null as number | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) {
      // Check if project_id was passed from ProjectDetailPage
      const stateProjectId = (location.state as { project_id?: number })?.project_id;
      if (stateProjectId) {
        setForm(prev => ({ ...prev, project_id: stateProjectId }));
      }
      return;
    }
    setPageLoading(true);
    getApiDoc(Number(id)).then(res => {
      const d = res.data;
      setForm({
        name: d.name, method: d.method, endpoint: d.endpoint,
        description: d.description, status: d.status,
        request_sample: d.request_sample || '', response_sample: d.response_sample || '',
        project_id: d.project_id,
      });
    }).finally(() => setPageLoading(false));
  }, [id, isEdit, location.state]);

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
      setError(msg || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="loading-state">
        <span className="spinner" />
        <span className="text-muted text-sm">Loading form data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Back link */}
      <Link to="/api-docs" className="page-back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to API Docs
      </Link>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{isEdit ? 'Edit' : 'New'} API Documentation</h1>
          <p className="page-subtitle">
            {isEdit ? 'Update the fields below and save your changes.' : 'Fill in the details to create a new API documentation entry.'}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* API Name */}
            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="api-name">API Name</label>
              <input
                id="api-name"
                className="form-input"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Get User Profile"
                required
              />
            </div>

            {/* Method + Status row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="api-method">HTTP Method</label>
                <select
                  id="api-method"
                  className="form-select"
                  value={form.method}
                  onChange={e => set('method', e.target.value)}
                >
                  {METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="api-status">Status</label>
                <select
                  id="api-status"
                  className="form-select"
                  value={form.status}
                  onChange={e => set('status', e.target.value)}
                >
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Project */}
            <div className="form-group">
              <label className="form-label" htmlFor="api-project">Project</label>
              <ProjectSelect 
                value={form.project_id} 
                onChange={(id) => setForm(prev => ({ ...prev, project_id: id }))}
                allowUnassigned={true}
              />
              <span className="form-hint">Optional — assign this API doc to a project</span>
            </div>

            {/* Endpoint */}
            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="api-endpoint">Endpoint</label>
              <input
                id="api-endpoint"
                className="form-input"
                value={form.endpoint}
                onChange={e => set('endpoint', e.target.value)}
                placeholder="/api/users/:id"
                required
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="api-desc">Description</label>
              <textarea
                id="api-desc"
                className="form-textarea"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Describe what this API endpoint does..."
                required
                rows={3}
              />
            </div>

            {/* Request Sample */}
            <div className="form-group">
              <label className="form-label" htmlFor="api-req-sample">Request Sample (JSON)</label>
              <textarea
                id="api-req-sample"
                className="form-textarea mono-textarea"
                value={form.request_sample}
                onChange={e => set('request_sample', e.target.value)}
                placeholder='{"key": "value"}'
                rows={4}
              />
              <span className="form-hint">Optional — paste a sample request body in JSON format</span>
            </div>

            {/* Response Sample */}
            <div className="form-group">
              <label className="form-label" htmlFor="api-res-sample">Response Sample (JSON)</label>
              <textarea
                id="api-res-sample"
                className="form-textarea mono-textarea"
                value={form.response_sample}
                onChange={e => set('response_sample', e.target.value)}
                placeholder='{"data": [...]}'
                rows={4}
              />
              <span className="form-hint">Optional — paste a sample response body in JSON format</span>
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
                {isEdit ? 'Save Changes' : 'Create API Doc'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
