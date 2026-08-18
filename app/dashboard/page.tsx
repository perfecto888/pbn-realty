'use client';

import Link from 'next/link';
import { DashboardLayout } from '../../src/components/DashboardLayout';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import styles from './page.module.css';

interface Deal {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  propertyType: string;
  capRate: number;
  status: 'not_interested' | 'maybe' | 'hot_deal';
}

const exampleDeals: Deal[] = [
  {
    id: '1',
    address: '251 E Main St',
    city: 'Phoenix',
    state: 'AZ',
    price: 4500000,
    propertyType: 'Office',
    capRate: 6.5,
    status: 'hot_deal'
  },
  {
    id: '2',
    address: '789 Oak Avenue',
    city: 'Scottsdale',
    state: 'AZ',
    price: 3200000,
    propertyType: 'Retail',
    capRate: 5.8,
    status: 'maybe'
  },
  {
    id: '3',
    address: '456 Industrial Way',
    city: 'Chandler',
    state: 'AZ',
    price: 5800000,
    propertyType: 'Industrial',
    capRate: 7.2,
    status: 'maybe'
  }
];

const getStatusBadgeType = (status: string) => {
  switch (status) {
    case 'hot_deal': return 'success';
    case 'maybe': return 'warning';
    case 'not_interested': return 'danger';
    default: return 'info';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'hot_deal': return '🔥 Hot Deal';
    case 'maybe': return 'Maybe';
    case 'not_interested': return 'Not Interested';
    default: return status;
  }
};

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

          <div className={styles.dealsGrid}>
            {exampleDeals.map((deal) => (
              <Link key={deal.id} href={`/dashboard/deals/${deal.id}`}>
                <Card className={styles.dealCard}>
                  <div className={styles.dealHeader}>
                    <div>
                      <h3 className={styles.dealAddress}>{deal.address}</h3>
                      <p className={styles.dealLocation}>{deal.city}, {deal.state}</p>
                    </div>
                    <Badge label={getStatusLabel(deal.status)} type={getStatusBadgeType(deal.status)} />
                  </div>

                  <div className={styles.dealDetails}>
                    <div className={styles.dealDetail}>
                      <span className={styles.dealLabel}>Property Type</span>
                      <span className={styles.dealValue}>{deal.propertyType}</span>
                    </div>
                    <div className={styles.dealDetail}>
                      <span className={styles.dealLabel}>Price</span>
                      <span className={styles.dealValue}>${(deal.price / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className={styles.dealDetail}>
                      <span className={styles.dealLabel}>Cap Rate</span>
                      <span className={styles.dealValue}>{deal.capRate}%</span>
                    </div>
                  </div>

                  <Button variant="primary" className={styles.viewDealBtn}>
                    View Details →
                  </Button>
                </Card>
              </Link>
            ))}
          </div>

          <div className={styles.emptyState}>
            <h3>Ready for Real Data Integration</h3>
            <p>Currently showing {exampleDeals.length} example deals. To add real deals, integrate with:</p>
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
