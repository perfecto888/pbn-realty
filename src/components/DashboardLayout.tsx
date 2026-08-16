import { ReactNode } from 'react';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      {title && (
        <header className="dashboard-layout__header">
          <h1 className="dashboard-layout__title">{title}</h1>
        </header>
      )}
      <main className="dashboard-layout__main">{children}</main>
    </div>
  );
}
