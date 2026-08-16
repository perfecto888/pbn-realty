import './Badge.css';

interface BadgeProps {
  label: string;
  type?: 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ label, type = 'info' }: BadgeProps) {
  const typeClass = `badge--${type}`;

  return <span className={`badge ${typeClass}`}>{label}</span>;
}
