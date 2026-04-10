import { useState, useCallback } from 'react';
import { Bot, Map, Timer, ShieldAlert, UtensilsCrossed, ShieldCheck } from 'lucide-react';
import ChatTab from './ChatTab';
import CrowdTab from './CrowdTab';
import WaitTab from './WaitTab';
import AlertsTab from './AlertsTab';
import FoodTab from './FoodTab';
import SafetyTab from './SafetyTab';

const TABS = [
  { id: 'chat', label: 'AI Concierge', Icon: Bot, Comp: ChatTab },
  { id: 'crowd', label: 'Crowd Map', Icon: Map, Comp: CrowdTab },
  { id: 'wait', label: 'Wait Times', Icon: Timer, Comp: WaitTab },
  { id: 'food', label: 'Food & Bev', Icon: UtensilsCrossed, Comp: FoodTab },
  { id: 'alerts', label: 'Alerts', Icon: ShieldAlert, Comp: AlertsTab },
  { id: 'safety', label: 'Safety AI', Icon: ShieldCheck, Comp: SafetyTab },
];

export default function DemoPanel() {
  const [activeTab, setActiveTab] = useState('chat');
  const ActiveComp = TABS.find(t => t.id === activeTab).Comp;

  const handleKeyDown = useCallback((e) => {
    const currentIdx = TABS.findIndex(t => t.id === activeTab);
    let nextIdx = currentIdx;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIdx = (currentIdx + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIdx = (currentIdx - 1 + TABS.length) % TABS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIdx = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIdx = TABS.length - 1;
    } else {
      return;
    }

    setActiveTab(TABS[nextIdx].id);
    document.getElementById(`tab-${TABS[nextIdx].id}`)?.focus();
  }, [activeTab]);

  return (
    <section className="section" aria-labelledby="demo-title">
      <h2 className="section-title" id="demo-title">
        Try It <span>Now</span>
      </h2>
      <p className="section-desc">
        Explore the AI concierge, live crowd data, food ordering, and safety tools
      </p>
      <div className="demo-panel">
        <div className="demo-tabs" role="tablist" aria-label="Demo features" onKeyDown={handleKeyDown}>
          {TABS.map(t => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              className="demo-tab"
              role="tab"
              aria-selected={activeTab === t.id}
              aria-controls={`panel-${t.id}`}
              tabIndex={activeTab === t.id ? 0 : -1}
              onClick={() => setActiveTab(t.id)}
            >
              <t.Icon size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} aria-hidden="true" />
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </div>
        <div
          className="demo-body"
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
        >
          <ActiveComp />
        </div>
      </div>
    </section>
  );
}
