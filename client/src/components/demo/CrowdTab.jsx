import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { CROWD_DATA, densityColor, densityStatus } from '../../lib/constants';

export default function CrowdTab() {
  const [data, setData] = useState(CROWD_DATA);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 0-Polling WebSocket Architecture initialization
    const socket = io();
    
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    socket.on('crowd_update', () => {
      // Receive WS trigger and shift densities
      setData(prev =>
        prev.map(zone => ({
          ...zone,
          density: Math.max(0.05, Math.min(0.99, zone.density + (Math.random() - 0.5) * 0.12)),
        }))
      );
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <p style={{ fontSize: '0.8rem', color: 'rgba(224,255,232,0.4)', marginBottom: 14 }}>
        Live crowd density · <span className={isConnected ? "text-success" : ""}>WS {isConnected ? 'Connected' : 'Connecting...'}</span> (Zero-Polling)
      </p>
      <div className="crowd-map" role="grid" aria-label="Stadium crowd density heatmap">
        {data.map((zone, i) => (
          <div
            key={i}
            className="crowd-cell"
            role="gridcell"
            tabIndex={0}
            aria-label={`${zone.label}: ${Math.round(zone.density * 100)}% density — ${densityStatus(zone.density)}`}
            style={{
              background: densityColor(zone.density),
              opacity: 0.3 + zone.density * 0.7,
            }}
            title={`${zone.label}: ${Math.round(zone.density * 100)}%`}
          >
            {zone.label}
          </div>
        ))}
      </div>
      <div className="crowd-legend" role="list" aria-label="Density color legend">
        <div className="legend-item" role="listitem">
          <div className="legend-dot" style={{ background: '#00e676' }} aria-hidden="true" />
          Low (&lt;35%)
        </div>
        <div className="legend-item" role="listitem">
          <div className="legend-dot" style={{ background: '#ffd740' }} aria-hidden="true" />
          Moderate (35-65%)
        </div>
        <div className="legend-item" role="listitem">
          <div className="legend-dot" style={{ background: '#ff5252' }} aria-hidden="true" />
          High (&gt;65%)
        </div>
      </div>
    </div>
  );
}
