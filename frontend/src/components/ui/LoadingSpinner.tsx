interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  label = 'Loading...',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinnerClass = size === 'sm' ? 'spinner spinner-sm' : size === 'lg' ? 'spinner spinner-lg' : 'spinner';

  if (fullScreen) {
    return (
      <div className="loading-screen" role="status" aria-label={label}>
        <span className={`${spinnerClass} spinner-lg`} />
        <span className="text-muted text-sm">{label}</span>
      </div>
    );
  }

  return (
    <div className="loading-state" role="status" aria-label={label}>
      <span className={spinnerClass} />
      <span className="text-muted text-sm">{label}</span>
    </div>
  );
}
