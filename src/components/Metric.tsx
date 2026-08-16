import './Metric.css';

interface MetricProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function Metric({ label, value, unit, trend = 'neutral' }: MetricProps) {
  const trendClass = trend ? `metric--trend-${trend}` : '';

  return (
    <div className={`metric ${trendClass}`}>
      <div className="metric__label">{label.toUpperCase()}</div>
      <div className="metric__value">
        {value}
        {unit && <span className="metric__unit">{unit}</span>}
      </div>
      {trend && trend !== 'neutral' && (
        <div className="metric__indicator">
          {trend === 'up' ? '↑' : '↓'}
        </div>
      )}
    </div>
  );
}
