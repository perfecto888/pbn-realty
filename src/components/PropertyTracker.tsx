'use client';

import { useState } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import styles from './PropertyTracker.module.css';

interface TrackedProperty {
  id: number;
  address: string;
  city: string;
  state: string;
  price: number;
  status: 'watching' | 'interested' | 'offer_pending' | 'passed';
  investmentThesis: string;
  daysWatching: number;
  notes: string;
}

interface PropertyTrackerProps {
  properties?: TrackedProperty[];
  onStatusChange?: (propertyId: number, newStatus: string) => void;
}

const statusBadgeType: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
  watching: 'info',
  interested: 'success',
  offer_pending: 'warning',
  passed: 'danger'
};

const statusLabels: Record<string, string> = {
  watching: 'Watching',
  interested: 'Interested',
  offer_pending: 'Offer Pending',
  passed: 'Passed'
};

export function PropertyTracker({ properties = [], onStatusChange }: PropertyTrackerProps) {
  const [filter, setFilter] = useState<string>('all');

  const filteredProperties = filter === 'all'
    ? properties
    : properties.filter(p => p.status === filter);

  const statusOptions = ['watching', 'interested', 'offer_pending', 'passed'];

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({properties.length})
        </button>
        {statusOptions.map(status => {
          const count = properties.filter(p => p.status === status).length;
          return (
            <button
              key={status}
              className={`${styles.filterBtn} ${filter === status ? styles.active : ''}`}
              onClick={() => setFilter(status)}
            >
              {statusLabels[status]} ({count})
            </button>
          );
        })}
      </div>

      <div className={styles.trackingGrid}>
        {filteredProperties.map((property) => (
          <Card key={property.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerTop}>
                <h3 className={styles.address}>{property.address}</h3>
                <Badge
                  label={statusLabels[property.status]}
                  type={statusBadgeType[property.status]}
                />
              </div>
              <p className={styles.location}>
                {property.city}, {property.state}
              </p>
            </div>

            <div className={styles.metrics}>
              <div className={styles.metric}>
                <span className={styles.label}>List Price</span>
                <span className={styles.value}>
                  ${(property.price / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.label}>Days Watching</span>
                <span className={styles.value}>{property.daysWatching}d</span>
              </div>
            </div>

            {property.investmentThesis && (
              <div className={styles.thesis}>
                <p className={styles.thesisLabel}>Investment Thesis</p>
                <p className={styles.thesisText}>{property.investmentThesis}</p>
              </div>
            )}

            {property.notes && (
              <div className={styles.notes}>
                <p className={styles.notesLabel}>Notes</p>
                <p className={styles.notesText}>{property.notes}</p>
              </div>
            )}

            <div className={styles.actions}>
              <select
                className={styles.statusSelect}
                value={property.status}
                onChange={(e) => onStatusChange?.(property.id, e.target.value)}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
              <Button variant="secondary">
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className={styles.empty}>
          <p>No properties in this category yet.</p>
        </div>
      )}
    </div>
  );
}
