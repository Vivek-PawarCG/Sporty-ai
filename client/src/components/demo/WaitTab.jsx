import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { WAIT_ITEMS } from '../../lib/constants';

function getWaitColor(mins) {
  if (mins < 10) return '#00e676';
  if (mins < 18) return '#ffd740';
  return '#ff5252';
}

export default function WaitTab() {
  const [items, setItems] = useState(WAIT_ITEMS);

  useEffect(() => {
    const id = setInterval(() => {
      setItems(prev =>
        prev.map(item => {
          const newMins = Math.max(1, Math.min(30, item.mins + Math.round((Math.random() - 0.5) * 3)));
          return { ...item, mins: newMins, color: getWaitColor(newMins) };
        })
      );
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="wait-list" role="list" aria-label="Venue facility wait times">
      {items.map((w, i) => {
        const Icon = Icons[w.icon] || Icons.Clock;
        const pct = (w.mins / w.max) * 100;
        return (
          <div key={i} className="wait-item" role="listitem">
            <div className="wait-icon" aria-hidden="true">
              <Icon size={20} />
            </div>
            <div className="wait-name">{w.name}</div>
            <div className="wait-bar-wrap">
              <div className="wait-bar-bg">
                <div
                  className="wait-bar"
                  role="progressbar"
                  aria-valuenow={w.mins}
                  aria-valuemin={0}
                  aria-valuemax={w.max}
                  aria-label={`${w.name} wait time: ${w.mins} minutes`}
                  style={{ width: `${pct}%`, background: w.color }}
                />
              </div>
            </div>
            <div className="wait-mins" style={{ color: w.color }}>
              {w.mins}m
            </div>
          </div>
        );
      })}
    </div>
  );
}
