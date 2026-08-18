'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';

export function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <h1 className={styles.logo}>PBN Realty</h1>
        </div>

        <ul className={styles.menu}>
          <li>
            <Link
              href="/dashboard"
              className={`${styles.link} ${isActive('/dashboard') && !pathname.includes('properties') ? styles.active : ''}`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/properties"
              className={`${styles.link} ${isActive('/dashboard/properties') ? styles.active : ''}`}
            >
              Property Tracker
            </Link>
          </li>
          <li>
            <Link
              href="/api/health"
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              API Health
            </Link>
          </li>
        </ul>

        <div className={styles.userMenu}>
          <span className={styles.email}>sam@goldenlotuslabs.com</span>
        </div>
      </div>
    </nav>
  );
}
