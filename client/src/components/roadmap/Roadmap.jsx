import { ROADMAP } from '../../lib/constants';

export default function Roadmap() {
  return (
    <section className="section" aria-labelledby="roadmap-title">
      <h2 className="section-title" id="roadmap-title">
        <span>Roadmap</span>
      </h2>
      <p className="section-desc">
        From MVP to full venue intelligence
      </p>
      <div className="roadmap" role="list" aria-label="Development roadmap phases">
        {ROADMAP.map((r, i) => (
          <div key={i} className="rm-item" role="listitem">
            <div className="rm-line" aria-hidden="true">
              <div className="rm-dot" style={{ background: r.color }} />
              {i < ROADMAP.length - 1 && <div className="rm-connector" />}
            </div>
            <div className="rm-content">
              <div className="rm-phase" style={{ color: r.color }}>
                {r.done ? '✓ ' : ''}{r.phase}
              </div>
              <h3 className="rm-title">{r.title}</h3>
              <p className="rm-desc">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
