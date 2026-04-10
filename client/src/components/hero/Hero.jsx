import { STATS } from '../../lib/constants';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-eyebrow">
        <div className="dot-pulse" aria-hidden="true" />
        Gen AI · Powered by Google
      </div>
      <h1 id="hero-title">
        The <em>Intelligent</em><br />Stadium Experience
      </h1>
      <p className="hero-sub">
        A real-time AI platform that eliminates crowd chaos, slashes wait times,
        and turns 100,000-person venues into seamlessly orchestrated experiences.
      </p>
      <div className="stats-bar" role="list" aria-label="Key performance metrics">
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
