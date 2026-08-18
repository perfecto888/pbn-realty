'use client';

import Link from 'next/link';
import { DashboardLayout } from '../../src/components/DashboardLayout';
import { Button } from '../../src/components/Button';
import styles from './page.module.css';

export default function DashboardPage() {
  return (
    <DashboardLayout title="Active Deals">
      <div className={styles.container}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Real Deal Analysis</h2>
            <p className={styles.sectionSubtitle}>
              Click on a deal to view comprehensive financial analysis, property details, and manage your kanban status
            </p>
          </div>

          <div className={styles.dealsCard}>
            <Link href="/dashboard/deals/1">
              <Button variant="primary">
                View Example Deal (Phoenix Office) →
              </Button>
            </Link>
          </div>

          <div className={styles.emptyState}>
            <h3>Ready for Real Data</h3>
            <p>The deal analysis system is ready to connect to real property data sources. Currently showing 1 example deal.</p>
            <p>To add real deals, integrate with:</p>
            <ul>
              <li>Redfin Commercial API</li>
              <li>CoStar / CBRE data</li>
              <li>MLS feeds</li>
              <li>Direct broker data uploads</li>
            </ul>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
