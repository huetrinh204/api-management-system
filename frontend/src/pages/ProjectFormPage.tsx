import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProject, createProject, updateProject } from '../api/projectApi';
import type { ProjectStatus } from '../types';
import Button from '../components/ui/Button';
import ColorPicker from '../components/ColorPicker';

const STATUSES: ProjectStatus[] = ['Active', 'Archived'];

export default function ProjectFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    color: '#3B82F6',
    status: 'Active' as ProjectStatus,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    setPageLoading(true);
    getProject(Number(id)).then(res => {
      const p = res.data;
      setForm({
        name: p.name,
        code: p.code,
        description: p.description || '',
        color: p.color || '#3B82F6',
        status: p.status,
      });
    }).catch(() => navigate('/projects')).finally(() => setPageLoading(false));
  }, [id, isEdit, navigate]);

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.name.trim()) {
      setError('Project name is required');
      return;
    }
    if (!form.code.trim()) {
      setError('Project code is required');
      return;
    }

    // Validate HEX color format
    if (form.color && !/^#[0-9A-Fa-f]{6}$/.test(form.color)) {
      setError('Invalid color format. Use HEX format like #3B82F6');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || undefined,
        color: form.color || undefined,
        status: form.status,
      };

      if (isEdit) {
        await updateProject(Number(id), payload);
        navigate(`/projects/${id}`);
      } else {
        const res = await createProject(payload);
        navigate(`/projects/${res.data.id}`);
      }
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
      <Link to={isEdit ? `/projects/${id}` : '/projects'} className="page-back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to {isEdit ? 'Project' : 'Projects'}
      </Link>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{isEdit ? 'Edit' : 'New'} Project</h1>
          <p className="page-subtitle">
            {isEdit ? 'Update the fields below and save your changes.' : 'Fill in the details to create a new project.'}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Project Name */}
            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="project-name">
                Project Name
              </label>
              <input
                id="project-name"
                className="form-input"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. API Management System"
                required
              />
            </div>

            {/* Project Code */}
            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="project-code">
                Project Code
              </label>
              <input
                id="project-code"
                className="form-input"
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())}
                placeholder="e.g. AMS"
                required
                disabled={isEdit}
                maxLength={50}
                style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
              />
              <span className="form-hint">
                {isEdit 
                  ? 'Project code cannot be changed after creation'
                  : 'Short unique identifier (will be converted to uppercase)'}
              </span>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="project-desc">
                Description
              </label>
              <textarea
                id="project-desc"
                className="form-textarea"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Describe what this project is about..."
                rows={3}
              />
            </div>

            {/* Color */}
            <div className="form-group">
              <label className="form-label" htmlFor="project-color">
                Project Color
              </label>
              <ColorPicker value={form.color} onChange={(color) => set('color', color)} />
              <span className="form-hint">Choose a color to identify this project</span>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="project-status">
                Status
              </label>
              <select
                id="project-status"
                className="form-select"
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                {STATUSES.map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <span className="form-hint">
                Active projects are shown first, archived projects are hidden from filters
              </span>
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
                {isEdit ? 'Save Changes' : 'Create Project'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
