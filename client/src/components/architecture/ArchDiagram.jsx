import { ChevronDown } from 'lucide-react';
import { ARCH_LAYERS } from '../../lib/constants';

export default function ArchDiagram() {
  return (
    <section className="section" aria-labelledby="arch-title">
      <h2 className="section-title" id="arch-title">
        System <span>Architecture</span>
      </h2>
      <p className="section-desc">
        Built on Google Cloud with Gemini, Vertex AI, and ADK at its core
      </p>
      <div className="arch" role="img" aria-label="System architecture diagram showing four technology layers: Attendee, AI and Intelligence, Data and Sensing, and Platform">
        <div className="arch-layers">
          {ARCH_LAYERS.map((layer, i) => (
            <div key={i}>
              <div className="arch-layer">
                <div className="arch-layer-title">{layer.title}</div>
                <div className="arch-chips" role="list">
                  {layer.chips.map((chip, j) => (
                    <span key={j} className={`chip ${j < 2 ? 'highlight' : ''}`} role="listitem">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
              {i < ARCH_LAYERS.length - 1 && (
                <div className="arch-arrow" aria-hidden="true">
                  <ChevronDown size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
