import { STATS } from '../../lib/constants';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-eyebrow">
        <div className="dot-pulse" aria-hidden="true" />
        Powered by Google AI
      </div>
      <h1 id="hero-title">
        Your <em>Smart</em><br />Stadium Companion
      </h1>
      <p className="hero-sub">
        Navigate crowds, skip queues, order food to your seat, 
        and stay safe — all powered by real-time AI.
      </p>
      <div className="stats-bar" role="list" aria-label="Key metrics">
        {STATS.map((s, i) => (
          <div key={i} className="stat" role="listitem">
            <div className="stat-value" aria-label={`${s.label}: ${s.value}`}>
              {s.value}
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
