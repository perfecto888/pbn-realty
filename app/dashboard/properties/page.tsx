'use client';

import { useState } from 'react';
import { DashboardLayout } from '../../../src/components/DashboardLayout';
import { PropertyTracker } from '../../../src/components/PropertyTracker';
import styles from './page.module.css';

// Mock data for property tracker
const mockSavedProperties = [
  {
    id: 1,
    address: '251 E Main St',
    city: 'Phoenix',
    state: 'AZ',
    price: 4500000,
    status: 'interested' as const,
    investmentThesis: 'Strong market fundamentals with excellent class A office space in high-growth corridor. Management team has strong track record.',
    daysWatching: 14,
    notes: 'Need to schedule property tour. Contact broker for additional financials.'
  },
  {
    id: 2,
    address: '500 N Scottsdale Rd',
    city: 'Scottsdale',
    state: 'AZ',
    price: 3200000,
    status: 'watching' as const,
    investmentThesis: 'Retail property with strong tenant mix and foot traffic patterns. Prime location near shopping district.',
    daysWatching: 7,
    notes: ''
  },
  {
    id: 3,
    address: '1200 S Arizona Ave',
    city: 'Chandler',
    state: 'AZ',
    price: 5800000,
    status: 'offer_pending' as const,
    investmentThesis: 'Industrial asset in prime logistics hub with long-term tenant commitment and strong net lease.',
    daysWatching: 21,
    notes: 'Offer made at $5.75M. Waiting for seller response. Underwriting in progress.'
  },
  {
    id: 4,
    address: '750 W Camelback Rd',
    city: 'Phoenix',
    state: 'AZ',
    price: 2900000,
    status: 'watching' as const,
    investmentThesis: 'Multifamily asset in growing submarket with strong rental growth potential and low vacancy rates.',
    daysWatching: 5,
    notes: 'Monitor monthly rent reports. Consider bid if property drops below $2.8M.'
  },
  {
    id: 5,
    address: '2000 E Baseline Rd',
    city: 'Tempe',
    state: 'AZ',
    price: 3700000,
    status: 'passed' as const,
    investmentThesis: 'Mixed-use development near employment centers, but cap rate too low for target returns.',
    daysWatching: 30,
    notes: 'Cap rate came in at 4.2%. Below our 5.5% minimum. Passed on deal.'
  }
];

export default function PropertiesTrackerPage() {
  const [properties, setProperties] = useState(mockSavedProperties);

  const handleStatusChange = (propertyId: number, newStatus: string) => {
    setProperties(props =>
      props.map(p =>
        p.id === propertyId
          ? { ...p, status: newStatus as any }
          : p
      )
    );
  };

  return (
    <DashboardLayout title="Property Tracker">
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.subtitle}>
            Track and manage your deal pipeline with real-time status updates
          </p>
        </div>

        <PropertyTracker
          properties={properties}
          onStatusChange={handleStatusChange}
        />
      </div>
    </DashboardLayout>
  );
}
