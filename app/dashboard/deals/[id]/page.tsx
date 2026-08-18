'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../../src/components/DashboardLayout';
import { Card } from '../../../../src/components/Card';
import { Badge } from '../../../../src/components/Badge';
import { Metric } from '../../../../src/components/Metric';
import { Button } from '../../../../src/components/Button';
import styles from './page.module.css';

interface DealData {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  propertyType: string;
  squareFeet: number;
  description: string;
  images: string[];

  // Financial Metrics
  capRate: number;
  noi: number;
  cashOnCash: number;
  irr: number;
  holdPeriod: number;
  exitPrice: number;

  // Tenant Info
  mainTenant: string;
  tenantCreditRating: string;
  leaseExpirationYear: number;
  occupancyRate: number;

  // Market Analysis
  marketGrowth: number;
  vacancyRate: number;
  economicOutlook: string;

  // Investment Thesis
  thesis: string;
  riskFactors: string[];
  opportunities: string[];

  // Kanban Status
  status: 'not_interested' | 'maybe' | 'hot_deal';
  sourceUrl: string;
}

// Example deal data - will be replaced with real API data
const dealDatabase: Record<string, DealData> = {
  '1': {
    id: '1',
    address: '251 E Main St',
    city: 'Phoenix',
    state: 'AZ',
    price: 4500000,
    propertyType: 'Office',
    squareFeet: 45000,
    description: 'Class A office building in downtown Phoenix with strong tenant base and excellent location near transit.',
    images: [
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80'
    ],
    capRate: 6.5,
    noi: 292500,
    cashOnCash: 8.2,
    irr: 18.5,
    holdPeriod: 5,
    exitPrice: 5400000,
    mainTenant: 'Phoenix Corporate Services',
    tenantCreditRating: 'A+',
    leaseExpirationYear: 2029,
    occupancyRate: 94,
    marketGrowth: 4.2,
    vacancyRate: 6,
    economicOutlook: 'Strong',
    thesis: 'Premium office space in high-growth market with excellent tenant quality and long-term lease. Downtown revitalization creates upside potential. Strong market fundamentals support cap rate expansion.',
    riskFactors: [
      'Remote work trends could impact office demand',
      'Economic recession could affect tenant health',
      'Interest rate increases could affect exit pricing'
    ],
    opportunities: [
      'Lease renewal at market rates in 2029',
      'Value-add through building improvements',
      'Potential for co-tenancy with adjacent properties'
    ],
    status: 'hot_deal',
    sourceUrl: 'https://www.redfin.com/commercial/phoenix-az/office'
  }
};

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const deal = dealDatabase[id as string];
  const [status, setStatus] = useState<'not_interested' | 'maybe' | 'hot_deal'>(deal?.status || 'maybe');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!deal) {
    return (
      <DashboardLayout>
        <div className={styles.notFound}>
          <h2>Deal not found</h2>
          <p>The deal you're looking for doesn't exist or has been removed.</p>
          <Link href="/dashboard">
            <Button variant="primary">Back to Dashboard</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % deal.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + deal.images.length) % deal.images.length);

  const statusConfig = {
    not_interested: { label: 'Not Interested', type: 'danger' as const },
    maybe: { label: 'Maybe', type: 'warning' as const },
    hot_deal: { label: 'Hot Deal', type: 'success' as const }
  };

  return (
    <DashboardLayout title={`${deal.address}, ${deal.city}`}>
      <div className={styles.container}>
        {/* Header with Navigation */}
        <div className={styles.header}>
          <Link href="/dashboard">
            <Button variant="ghost">← Back</Button>
          </Link>
          <h1 className={styles.title}>{deal.address}</h1>
          <Badge label={deal.propertyType} type="info" />
        </div>

        {/* Image Gallery */}
        <Card className={styles.galleryCard}>
          <div className={styles.gallery}>
            <img src={deal.images[currentImageIndex]} alt={`Property ${currentImageIndex + 1}`} className={styles.mainImage} />
            <div className={styles.galleryControls}>
              <Button variant="secondary" onClick={prevImage}>← Prev</Button>
              <span className={styles.imageCounter}>{currentImageIndex + 1} / {deal.images.length}</span>
              <Button variant="secondary" onClick={nextImage}>Next →</Button>
            </div>
          </div>
        </Card>

        {/* Two-Column Layout */}
        <div className={styles.twoColumn}>
          {/* Left Column - Property & Market Info */}
          <div className={styles.column}>
            {/* Property Details */}
            <Card>
              <h2 className={styles.sectionTitle}>Property Details</h2>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Property Type</span>
                  <span className={styles.value}>{deal.propertyType}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Square Feet</span>
                  <span className={styles.value}>{(deal.squareFeet / 1000).toFixed(1)}k</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Price</span>
                  <span className={styles.value}>${(deal.price / 1000000).toFixed(1)}M</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Location</span>
                  <span className={styles.value}>{deal.city}, {deal.state}</span>
                </div>
              </div>
              <p className={styles.description}>{deal.description}</p>
            </Card>

            {/* Tenant Information */}
            <Card>
              <h2 className={styles.sectionTitle}>Tenant Information</h2>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Primary Tenant</span>
                  <span className={styles.value}>{deal.mainTenant}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Credit Rating</span>
                  <Badge label={deal.tenantCreditRating} type="success" />
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Occupancy Rate</span>
                  <span className={styles.value}>{deal.occupancyRate}%</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Lease Expiration</span>
                  <span className={styles.value}>{deal.leaseExpirationYear}</span>
                </div>
              </div>
            </Card>

            {/* Market Analysis */}
            <Card>
              <h2 className={styles.sectionTitle}>Market Analysis</h2>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Market Growth</span>
                  <span className={styles.value}>{deal.marketGrowth}% YoY</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Vacancy Rate</span>
                  <span className={styles.value}>{deal.vacancyRate}%</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Economic Outlook</span>
                  <Badge label={deal.economicOutlook} type="info" />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Financial & Analysis */}
          <div className={styles.column}>
            {/* Financial Metrics */}
            <Card>
              <h2 className={styles.sectionTitle}>Financial Analysis</h2>
              <div className={styles.metricsGrid}>
                <Metric label="Sales Price" value={`$${(deal.price / 1000000).toFixed(1)}M`} />
                <Metric label="Cap Rate" value={deal.capRate.toFixed(1)} unit="%" trend="up" />
                <Metric label="NOI" value={`$${(deal.noi / 1000).toFixed(0)}k`} trend="up" />
                <Metric label="Cash on Cash" value={deal.cashOnCash.toFixed(1)} unit="%" trend="up" />
                <Metric label="Estimated IRR" value={deal.irr.toFixed(1)} unit="%" trend="up" />
                <Metric label="Hold Period" value={deal.holdPeriod} unit="yrs" />
                <Metric label="Exit Price" value={`$${(deal.exitPrice / 1000000).toFixed(1)}M`} />
              </div>
            </Card>

            {/* Investment Thesis */}
            <Card>
              <h2 className={styles.sectionTitle}>Investment Thesis</h2>
              <p className={styles.thesis}>{deal.thesis}</p>
            </Card>

            {/* Risk Factors */}
            <Card>
              <h2 className={styles.sectionTitle}>Risk Factors</h2>
              <ul className={styles.listItems}>
                {deal.riskFactors.map((risk, idx) => (
                  <li key={idx}>• {risk}</li>
                ))}
              </ul>
            </Card>

            {/* Opportunities */}
            <Card>
              <h2 className={styles.sectionTitle}>Opportunities</h2>
              <ul className={styles.listItems}>
                {deal.opportunities.map((opp, idx) => (
                  <li key={idx}>✓ {opp}</li>
                ))}
              </ul>
            </Card>

            {/* Kanban Status & Actions */}
            <Card>
              <h2 className={styles.sectionTitle}>Deal Status</h2>
              <div className={styles.statusSection}>
                <div className={styles.currentStatus}>
                  <span>Current Status:</span>
                  <Badge label={statusConfig[status].label} type={statusConfig[status].type} />
                </div>
                <div className={styles.statusButtons}>
                  <Button
                    variant={status === 'not_interested' ? 'primary' : 'secondary'}
                    onClick={() => setStatus('not_interested')}
                    className={styles.statusBtn}
                  >
                    Not Interested
                  </Button>
                  <Button
                    variant={status === 'maybe' ? 'primary' : 'secondary'}
                    onClick={() => setStatus('maybe')}
                    className={styles.statusBtn}
                  >
                    Maybe
                  </Button>
                  <Button
                    variant={status === 'hot_deal' ? 'primary' : 'secondary'}
                    onClick={() => setStatus('hot_deal')}
                    className={styles.statusBtn}
                  >
                    Hot Deal 🔥
                  </Button>
                </div>
              </div>
            </Card>

            {/* Source Link */}
            <Card>
              <a href={deal.sourceUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" className={styles.sourceBtn}>
                  View on Redfin →
                </Button>
              </a>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
