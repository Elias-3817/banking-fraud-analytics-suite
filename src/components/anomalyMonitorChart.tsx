import { Anomaly } from '../types';

interface AnomalyMonitorProps {
  data: Anomaly[];
}

export function AnomalyMonitor({ data }: AnomalyMonitorProps) {
  const recentAnomalies = data.slice(0, 5); // Show the 5 most recent

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h4>Recent Alerts ({data.length} Total)</h4>
      {data.length === 0 ? (
        <p>No anomalous transactions detected.</p>
      ) : (
        <ul>
          {recentAnomalies.map((anomaly, index) => (
            <li key={index} style={{ color: anomaly.type === 'high-value' ? 'var(--danger-color)' : 'inherit', marginBottom: '8px' }}>
              {anomaly.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}