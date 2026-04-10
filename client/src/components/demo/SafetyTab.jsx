import { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldAlert, Radio, Activity, Users, Flame, Stethoscope, BotMessageSquare } from 'lucide-react';

const SEV_COLORS = { 5: '#ff1744', 4: '#ff5252', 3: '#ffd740', 2: '#448aff', 1: '#00e676' };
const SEV_LABELS = { 5: 'CRITICAL', 4: 'HIGH', 3: 'MEDIUM', 2: 'LOW', 1: 'INFO' };
const STATUS_COLORS = { active: '#ff1744', responding: '#ffd740', monitoring: '#448aff', resolved: '#00e676' };

export default function SafetyTab() {
  const [data, setData] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const analysisRef = useRef(null);

  useEffect(() => {
    fetch('/api/safety/incidents')
      .then(r => r.json())
      .then(d => setData(d.data))
      .catch(() => setData(null));
  }, []);

  const analyzeIncident = useCallback(async (incident) => {
    setSelectedIncident(incident.id);
    setAnalysis('');
    setAnalyzing(true);

    try {
      const res = await fetch('/api/safety/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId: incident.id }),
      });

      if (res.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const payload = line.slice(6);
              if (payload === '[DONE]') break;
              try {
                const { text } = JSON.parse(payload);
                if (text) setAnalysis(prev => prev + text);
              } catch { /* skip */ }
            }
          }
        }
      } else {
        const json = await res.json();
        setAnalysis(json.error || 'Analysis unavailable.');
      }
    } catch {
      setAnalysis('⚠ AI analysis unavailable. Manual assessment required.');
    }
    setAnalyzing(false);
  }, []);

  if (!data) return <div className="safety-loading">Loading safety data...</div>;

  return (
    <div className="safety-tab">
      {/* Alert level banner */}
      <div className="safety-banner" role="status">
        <Radio size={14} className="safety-pulse" aria-hidden="true" />
        <span>Alert Level: <strong style={{ color: '#ffd740' }}>ELEVATED</strong></span>
        <span className="safety-occ">Occupancy: {data.venue.currentOccupancy.toLocaleString()} / {data.venue.totalCapacity.toLocaleString()}</span>
      </div>

      {/* ADK Agents */}
      <div className="safety-agents" role="list" aria-label="AI agents status">
        {data.agents.map((a, i) => (
          <div key={i} className="safety-agent" role="listitem">
            <span className="agent-dot" style={{ background: a.status === 'alert' ? '#ff1744' : '#00e676' }} />
            <div className="agent-info">
              <span className="agent-name">{a.name}</span>
              <span className="agent-task">{a.task}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Resources */}
      <div className="safety-resources">
        <div className="resource-item">
          <Stethoscope size={14} aria-hidden="true" />
          <span>Medical: <strong>{data.resources.medical.available}</strong>/{data.resources.medical.total}</span>
        </div>
        <div className="resource-item">
          <Users size={14} aria-hidden="true" />
          <span>Security: <strong>{data.resources.security.available}</strong>/{data.resources.security.total}</span>
        </div>
        <div className="resource-item">
          <Flame size={14} aria-hidden="true" />
          <span>Fire: <strong>{data.resources.fire.available}</strong>/{data.resources.fire.total}</span>
        </div>
      </div>

      {/* Incidents */}
      <div className="safety-incidents" role="list" aria-label="Active incidents">
        {data.incidents.map(inc => (
          <div key={inc.id} className="safety-incident" role="listitem" style={{ borderLeftColor: SEV_COLORS[inc.severity] }}>
            <div className="inc-header">
              <span className="inc-sev" style={{ background: SEV_COLORS[inc.severity] }}>{SEV_LABELS[inc.severity]}</span>
              <span className="inc-status" style={{ color: STATUS_COLORS[inc.status] }}>● {inc.status.toUpperCase()}</span>
              <span className="inc-time">{inc.time}</span>
            </div>
            <h4 className="inc-title">{inc.title}</h4>
            <p className="inc-desc">{inc.description}</p>
            <div className="inc-meta">
              <span className="inc-location">📍 {inc.location}</span>
              <span className="inc-detected">🔍 {inc.detectedBy}</span>
            </div>
            {inc.dispatched.length > 0 && (
              <div className="inc-dispatched">
                {inc.dispatched.map((d, i) => <span key={i} className="inc-dispatch-chip">{d}</span>)}
              </div>
            )}
            <button
              className="inc-analyze-btn"
              onClick={() => analyzeIncident(inc)}
              disabled={analyzing && selectedIncident === inc.id}
              aria-label={`Analyze ${inc.title} with AI`}
            >
              <BotMessageSquare size={13} aria-hidden="true" />
              {analyzing && selectedIncident === inc.id ? 'Analyzing...' : 'AI Analysis'}
            </button>

            {selectedIncident === inc.id && analysis && (
              <div className="inc-analysis" ref={analysisRef} role="region" aria-label="AI analysis result">
                <div className="inc-analysis-header">
                  <Activity size={12} aria-hidden="true" /> Gemini Safety Agent Response
                </div>
                <div className="inc-analysis-text">{analysis}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
