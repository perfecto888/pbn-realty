import { ReactNode } from 'react';
import './Card.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

export function Card({
  children,
  className = '',
  interactive = false,
}: CardProps) {
  const interactiveClass = interactive ? 'card--interactive' : '';

  return (
    <div className={`card ${interactiveClass} ${className}`}>
      {children}
    </div>
  );
}
