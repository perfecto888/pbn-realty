import { Card } from './Card';
import { Badge } from './Badge';
import { Metric } from './Metric';
import { Button } from './Button';
import styles from './RecommendationCard.module.css';

interface Property {
  id: number;
  address: string;
  city: string;
  state: string;
  price: string | number | null;
  propertyType: string | null;
  compositeScore: string | number | null;
  estimatedIrr: string | number | null;
  squareFeet: number | null;
}

interface RecommendationCardProps {
  rank: number;
  property: Property;
  score: number;
  irrEstimate: number | null;
  reasoning?: string;
  onSave?: () => void;
}

export function RecommendationCard({
  rank,
  property,
  score,
  irrEstimate,
  reasoning,
  onSave
}: RecommendationCardProps) {
  const getTrendIndicator = (value: number) => {
    if (value >= 75) return 'up';
    if (value < 50) return 'down';
    return 'neutral';
  };

  return (
    <Card interactive className={styles.card}>
      <div className={styles.header}>
        <div className={styles.rankBadge}>#{rank}</div>
        <h2 className={styles.address}>{property.address}</h2>
      </div>

      <div className={styles.location}>
        <span>{property.city}, {property.state}</span>
        {property.propertyType && (
          <Badge label={property.propertyType} type="info" />
        )}
      </div>

      <div className={styles.metrics}>
        <Metric
          label="Score"
          value={score.toFixed(1)}
          unit="/100"
          trend={getTrendIndicator(score)}
        />
        {irrEstimate && (
          <Metric
            label="Est. IRR"
            value={irrEstimate.toFixed(1)}
            unit="%"
            trend={irrEstimate >= 15 ? 'up' : 'neutral'}
          />
        )}
        {property.squareFeet && (
          <Metric
            label="Sq Ft"
            value={(property.squareFeet / 1000).toFixed(1)}
            unit="k"
          />
        )}
        {property.price && (
          <Metric
            label="Price"
            value={`$${(Number(property.price) / 1000000).toFixed(1)}M`}
          />
        )}
      </div>

      {reasoning && (
        <div className={styles.reasoning}>
          <p className={styles.reasoningText}>{reasoning}</p>
        </div>
      )}

      <div className={styles.actions}>
        <Button
          variant="primary"
          onClick={onSave}
          className={styles.button}
        >
          Save Deal
        </Button>
        <Button variant="secondary" className={styles.button}>
          View Details
        </Button>
      </div>
    </Card>
  );
}
