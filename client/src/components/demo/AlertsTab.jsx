import * as Icons from 'lucide-react';
import { ALERTS } from '../../lib/constants';

export default function AlertsTab() {
  return (
    <div className="alert-list" role="log" aria-label="Safety alerts feed" aria-live="polite">
      {ALERTS.map((a, i) => {
        const Icon = Icons[a.icon] || Icons.AlertTriangle;
        return (
          <div
            key={i}
            className="alert-item"
            role={a.severity === 'critical' ? 'alert' : 'article'}
            style={{
              background: `${a.color}0a`,
              borderColor: a.color,
            }}
          >
            <div className="alert-icon" aria-hidden="true" style={{ color: a.color }}>
              <Icon size={18} />
            </div>
            <div>
              <div className="alert-title" style={{ color: a.color }}>{a.title}</div>
              <div className="alert-desc">{a.desc}</div>
              <div className="alert-time">{a.time}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
