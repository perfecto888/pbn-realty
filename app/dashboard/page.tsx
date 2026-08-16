'use client';

import { DashboardLayout } from '../../src/components/DashboardLayout';
import { RecommendationCard } from '../../src/components/RecommendationCard';
import { Metric } from '../../src/components/Metric';
import styles from './page.module.css';

// Mock data for demonstration
const mockRecommendations = [
  {
    rank: 1,
    property: {
      id: 1,
      address: '251 E Main St',
      city: 'Phoenix',
      state: 'AZ',
      price: '4500000',
      propertyType: 'Office',
      compositeScore: 92,
      estimatedIrr: 18.5,
      squareFeet: 45000
    },
    score: 92,
    irrEstimate: 18.5,
    reasoning: 'Strong market fundamentals with high tenant demand and excellent location. Class A office space in high-growth corridor.'
  },
  {
    rank: 2,
    property: {
      id: 2,
      address: '500 N Scottsdale Rd',
      city: 'Scottsdale',
      state: 'AZ',
      price: '3200000',
      propertyType: 'Retail',
      compositeScore: 88,
      estimatedIrr: 17.2,
      squareFeet: 32000
    },
    score: 88,
    irrEstimate: 17.2,
    reasoning: 'Excellent retail location with strong foot traffic. Established merchant mix and positive economic indicators.'
  },
  {
    rank: 3,
    property: {
      id: 3,
      address: '1200 S Arizona Ave',
      city: 'Chandler',
      state: 'AZ',
      price: '5800000',
      propertyType: 'Industrial',
      compositeScore: 85,
      estimatedIrr: 16.8,
      squareFeet: 120000
    },
    score: 85,
    irrEstimate: 16.8,
    reasoning: 'High-quality industrial property in prime logistics hub. Strong tenant creditworthiness and long-term lease.'
  },
  {
    rank: 4,
    property: {
      id: 4,
      address: '750 W Camelback Rd',
      city: 'Phoenix',
      state: 'AZ',
      price: '2900000',
      propertyType: 'Apartment',
      compositeScore: 82,
      estimatedIrr: 16.1,
      squareFeet: 250
    },
    score: 82,
    irrEstimate: 16.1,
    reasoning: 'Multifamily asset in growing submarket. Strong rental growth potential and low vacancy rates.'
  },
  {
    rank: 5,
    property: {
      id: 5,
      address: '2000 E Baseline Rd',
      city: 'Tempe',
      state: 'AZ',
      price: '3700000',
      propertyType: 'Mixed-Use',
      compositeScore: 79,
      estimatedIrr: 15.4,
      squareFeet: 68000
    },
    score: 79,
    irrEstimate: 15.4,
    reasoning: 'Mixed-use development with retail and office components. Near major employment centers and transit.'
  }
];

const portfolioStats = {
  activeDeals: 12,
  underReview: 5,
  closed: 3,
  totalIrr: 16.8
};

export default function DashboardPage() {
  return (
    <DashboardLayout title="Deal Recommendations">
      <div className={styles.container}>
        {/* Portfolio Stats */}
        <div className={styles.statsGrid}>
          <Metric
            label="Active Deals"
            value={portfolioStats.activeDeals}
            trend="up"
          />
          <Metric
            label="Under Review"
            value={portfolioStats.underReview}
            trend="neutral"
          />
          <Metric
            label="Closed Deals"
            value={portfolioStats.closed}
            trend="up"
          />
          <Metric
            label="Portfolio IRR"
            value={portfolioStats.totalIrr.toFixed(1)}
            unit="%"
            trend="up"
          />
        </div>

        {/* Recommendations Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Top 5 Recommendations Today</h2>
            <p className={styles.sectionSubtitle}>
              Based on comprehensive market analysis and investment criteria
            </p>
          </div>

          <div className={styles.recommendationsGrid}>
            {mockRecommendations.map((rec) => (
              <RecommendationCard
                key={rec.property.id}
                rank={rec.rank}
                property={rec.property}
                score={rec.score}
                irrEstimate={rec.irrEstimate}
                reasoning={rec.reasoning}
                onSave={() => console.log(`Saved property ${rec.property.id}`)}
              />
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
