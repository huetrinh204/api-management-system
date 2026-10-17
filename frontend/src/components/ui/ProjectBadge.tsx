import type { Project } from '../../types';

interface ProjectBadgeProps {
  project?: Project | null;
  size?: 'sm' | 'md';
}

export default function ProjectBadge({ project, size = 'sm' }: ProjectBadgeProps) {
  if (!project) {
    return (
      <span
        className={`project-badge project-badge-unassigned project-badge-${size}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: size === 'sm' ? '2px 8px' : '4px 10px',
          borderRadius: '4px',
          fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          background: 'var(--surface-3)',
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
        }}
      >
        Unassigned
      </span>
    );
  }

  return (
    <span
      className={`project-badge project-badge-${size}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        borderRadius: '4px',
        fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
        backgroundColor: project.color || '#6366F1',
        color: 'white',
        textTransform: 'uppercase',
      }}
      title={project.name}
    >
      {project.code}
    </span>
  );
}
