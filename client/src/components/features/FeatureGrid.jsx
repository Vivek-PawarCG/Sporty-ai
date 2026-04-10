import * as Icons from 'lucide-react';
import { FEATURES } from '../../lib/constants';

export default function FeatureGrid() {
  return (
    <section className="section" aria-labelledby="features-title">
      <h2 className="section-title" id="features-title">
        Core <span>Features</span>
      </h2>
      <p className="section-desc">
        Six AI-powered pillars solving the real pain points of large-scale venues
      </p>
      <div className="cards-grid" role="list">
        {FEATURES.map((f, i) => {
          const Icon = Icons[f.icon] || Icons.Zap;
          return (
            <article key={i} className="feature-card" role="listitem">
              <div className="card-icon" aria-hidden="true">
                <Icon size={22} />
              </div>
              <h3 className="card-title">{f.title}</h3>
              <p className="card-text">{f.text}</p>
              <span className="tag">{f.tag}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
