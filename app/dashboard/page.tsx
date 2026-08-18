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
    address: '3750 S Las Vegas Blvd',
    city: 'Las Vegas',
    state: 'NV',
    price: 6200000,
    propertyType: 'Office',
    capRate: 6.8,
    status: 'hot_deal'
  },
  {
    id: '2',
    address: '2890 W Sahara Avenue',
    city: 'Las Vegas',
    state: 'NV',
    price: 4100000,
    propertyType: 'Retail',
    capRate: 6.2,
    status: 'maybe'
  },
  {
    id: '3',
    address: '1650 Industrial Road',
    city: 'Las Vegas',
    state: 'NV',
    price: 7500000,
    propertyType: 'Industrial',
    capRate: 7.5,
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
    <DashboardLayout title="Las Vegas Market Deals">
      <div className={styles.container}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Las Vegas Commercial Real Estate Deals</h2>
              <p className={styles.sectionSubtitle}>
                Focus: Las Vegas, NV Market | Click on a deal to view comprehensive financial analysis, property details, and manage your kanban status
              </p>
            </div>
            <Link href="/dashboard/deals/upload">
              <Button variant="primary">Upload Excel →</Button>
            </Link>
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
