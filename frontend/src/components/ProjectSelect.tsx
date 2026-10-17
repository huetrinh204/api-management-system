import { useEffect, useState } from 'react';
import { getProjects } from '../api/projectApi';
import type { Project } from '../types';

interface ProjectSelectProps {
  value: number | null;
  onChange: (id: number | null) => void;
  allowUnassigned?: boolean;
}

export default function ProjectSelect({ value, onChange, allowUnassigned = true }: ProjectSelectProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      setError('');
      try {
        const res = await getProjects();
        setProjects(res.data);
      } catch {
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const activeProjects = projects.filter(p => p.status === 'Active');
  const archivedProjects = projects.filter(p => p.status === 'Archived');

  if (loading) {
    return (
      <select className="form-select" disabled>
        <option>Loading...</option>
      </select>
    );
  }

  if (error) {
    return (
      <select className="form-select" disabled>
        <option>Error loading projects</option>
      </select>
    );
  }

  return (
    <select
      className="form-select"
      value={value === null ? '' : value}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === '' ? null : Number(val));
      }}
      aria-label="Filter by project"
    >
      {allowUnassigned && <option value="">All Projects</option>}
      
      {activeProjects.length > 0 && (
        <optgroup label="Active Projects">
          {activeProjects.map((project) => (
            <option key={project.id} value={project.id}>
              [{project.code}] {project.name}
            </option>
          ))}
        </optgroup>
      )}
      
      {archivedProjects.length > 0 && (
        <optgroup label="Archived Projects">
          {archivedProjects.map((project) => (
            <option key={project.id} value={project.id}>
              [{project.code}] {project.name}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}
