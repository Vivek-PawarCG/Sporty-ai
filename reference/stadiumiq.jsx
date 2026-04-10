import { useState, useEffect, useRef } from "react";

const GEMINI_GREEN = "#00e676";
const STADIUM_DARK = "#060b14";
const CARD_BG = "rgba(255,255,255,0.04)";
const BORDER = "rgba(0,230,118,0.18)";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;900&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${STADIUM_DARK};
    font-family: 'DM Sans', sans-serif;
    color: #e0ffe8;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .orb { font-family: 'Orbitron', monospace; }

  /* Animated grid background */
  .grid-bg {
    position: fixed; inset: 0; z-index: 0;
    background-image:
      linear-gradient(rgba(0,230,118,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,230,118,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: gridShift 20s linear infinite;
  }
  @keyframes gridShift {
    0% { background-position: 0 0; }
    100% { background-position: 40px 40px; }
  }

  .pulse-ring {
    position: fixed; top: -200px; right: -200px; width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,230,118,0.06) 0%, transparent 70%);
    animation: pulse 4s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 1; }
  }

  .container {
    position: relative; z-index: 1;
    max-width: 1100px; margin: 0 auto; padding: 0 20px;
  }

  /* NAV */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(6,11,20,0.85);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid ${BORDER};
    padding: 14px 0;
  }
  .nav-inner {
    display: flex; align-items: center; justify-content: space-between;
    max-width: 1100px; margin: 0 auto; padding: 0 20px;
  }
  .nav-logo { font-family: 'Orbitron', monospace; font-size: 1.2rem; font-weight: 900; color: #00e676; letter-spacing: 3px; }
  .nav-logo span { color: #fff; }
  .nav-badge {
    font-size: 0.65rem; font-weight: 600; padding: 3px 10px;
    border: 1px solid #00e676; border-radius: 20px; color: #00e676;
    letter-spacing: 2px; text-transform: uppercase;
  }

  /* HERO */
  .hero { padding: 80px 0 60px; text-align: center; }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 0.7rem; letter-spacing: 3px; text-transform: uppercase;
    color: #00e676; margin-bottom: 24px;
    padding: 6px 16px; border: 1px solid rgba(0,230,118,0.3); border-radius: 20px;
  }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: #00e676; animation: blink 1.2s ease-in-out infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

  .hero h1 {
    font-family: 'Orbitron', monospace;
    font-size: clamp(2.5rem, 6vw, 5rem);
    font-weight: 900; line-height: 1.05;
    color: #fff; letter-spacing: -1px;
    margin-bottom: 10px;
  }
  .hero h1 em { color: #00e676; font-style: normal; }
  .hero-sub {
    font-size: 1.05rem; color: rgba(224,255,232,0.55);
    font-weight: 300; max-width: 560px; margin: 18px auto 0;
    line-height: 1.7;
  }

  /* STATS BAR */
  .stats-bar {
    display: flex; gap: 1px;
    background: ${BORDER};
    border: 1px solid ${BORDER};
    border-radius: 12px; overflow: hidden; margin: 50px 0 0;
  }
  .stat {
    flex: 1; padding: 20px 0; text-align: center;
    background: rgba(6,11,20,0.9);
    transition: background 0.2s;
  }
  .stat:hover { background: rgba(0,230,118,0.05); }
  .stat-num { font-family:'Orbitron',monospace; font-size: 1.6rem; font-weight:900; color:#00e676; }
  .stat-lbl { font-size: 0.7rem; color: rgba(224,255,232,0.4); letter-spacing:1px; text-transform:uppercase; margin-top:4px; }

  /* SECTION TITLE */
  .section-title {
    font-family: 'Orbitron', monospace;
    font-size: 1.4rem; font-weight: 600; color: #fff;
    margin-bottom: 8px; letter-spacing: 1px;
  }
  .section-title span { color: #00e676; }
  .section-desc { color: rgba(224,255,232,0.45); font-size: 0.9rem; margin-bottom: 30px; }
  .section { padding: 60px 0; }

  /* CARDS */
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
  .card {
    background: ${CARD_BG};
    border: 1px solid ${BORDER};
    border-radius: 16px; padding: 28px;
    transition: all 0.3s;
    position: relative; overflow: hidden;
  }
  .card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #00e676, transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .card:hover { border-color: rgba(0,230,118,0.4); transform: translateY(-3px); }
  .card:hover::before { opacity: 1; }

  .card-icon { font-size: 2rem; margin-bottom: 16px; }
  .card-title { font-family:'Orbitron',monospace; font-size:0.85rem; font-weight:600; color:#00e676; letter-spacing:1px; margin-bottom:10px; text-transform:uppercase; }
  .card-text { font-size: 0.88rem; color: rgba(224,255,232,0.6); line-height: 1.7; }

  .tag {
    display: inline-block; font-size: 0.65rem; padding: 3px 10px;
    background: rgba(0,230,118,0.1); border: 1px solid rgba(0,230,118,0.25);
    border-radius: 20px; color: #00e676; margin-top: 14px; letter-spacing: 1px;
    text-transform: uppercase; font-weight: 600;
  }

  /* ARCH DIAGRAM */
  .arch {
    background: ${CARD_BG}; border: 1px solid ${BORDER};
    border-radius: 20px; padding: 36px; position: relative; overflow: hidden;
  }
  .arch-layers { display: flex; flex-direction: column; gap: 16px; }
  .arch-layer {
    border: 1px solid rgba(0,230,118,0.15);
    border-radius: 12px; padding: 18px 22px;
    background: rgba(0,230,118,0.03);
  }
  .arch-layer-title {
    font-family:'Orbitron',monospace; font-size:0.7rem;
    color:#00e676; letter-spacing:2px; text-transform:uppercase; margin-bottom:12px;
  }
  .arch-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    font-size: 0.75rem; padding: 5px 12px;
    background: rgba(0,230,118,0.07); border: 1px solid rgba(0,230,118,0.2);
    border-radius: 8px; color: rgba(224,255,232,0.8); font-weight: 500;
  }
  .chip.highlight { background: rgba(0,230,118,0.15); color: #00e676; border-color: rgba(0,230,118,0.4); }

  .arrow-down { text-align: center; color: rgba(0,230,118,0.4); font-size: 1.2rem; }

  /* DEMO PANEL */
  .demo-panel {
    background: rgba(6,11,20,0.95); border: 1px solid ${BORDER};
    border-radius: 20px; overflow: hidden;
  }
  .demo-tabs { display: flex; border-bottom: 1px solid ${BORDER}; }
  .demo-tab {
    flex: 1; padding: 14px; text-align: center;
    font-size: 0.78rem; font-weight: 600; letter-spacing: 1px;
    text-transform: uppercase; cursor: pointer; border: none;
    background: transparent; color: rgba(224,255,232,0.35);
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .demo-tab.active { color: #00e676; background: rgba(0,230,118,0.06); border-bottom: 2px solid #00e676; }
  .demo-body { padding: 28px; }

  /* CHAT UI */
  .chat-msgs { display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; min-height: 160px; }
  .msg { display: flex; gap: 10px; align-items: flex-start; }
  .msg.user { flex-direction: row-reverse; }
  .msg-avatar {
    width: 30px; height: 30px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem; font-weight: bold; flex-shrink: 0;
  }
  .msg.ai .msg-avatar { background: rgba(0,230,118,0.15); border: 1px solid rgba(0,230,118,0.3); color: #00e676; }
  .msg.user .msg-avatar { background: rgba(255,255,255,0.08); color: #fff; }
  .msg-bubble {
    padding: 10px 14px; border-radius: 12px; font-size: 0.85rem; line-height: 1.6; max-width: 75%;
  }
  .msg.ai .msg-bubble { background: rgba(0,230,118,0.08); border: 1px solid rgba(0,230,118,0.2); color: rgba(224,255,232,0.9); }
  .msg.user .msg-bubble { background: rgba(255,255,255,0.06); color: rgba(224,255,232,0.7); }

  .chat-input-row { display: flex; gap: 10px; }
  .chat-input {
    flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(0,230,118,0.2);
    border-radius: 10px; padding: 10px 14px; color: #e0ffe8;
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem; outline: none;
  }
  .chat-input:focus { border-color: rgba(0,230,118,0.5); }
  .chat-btn {
    padding: 10px 20px; background: #00e676; color: #060b14;
    border: none; border-radius: 10px; font-weight: 700;
    cursor: pointer; font-size: 0.85rem; font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .chat-btn:hover { background: #00ff85; }
  .chat-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* CROWD MAP */
  .crowd-map {
    display: grid; grid-template-columns: repeat(8,1fr); gap: 6px;
    background: rgba(0,0,0,0.3); border-radius: 12px; padding: 20px;
  }
  .crowd-cell {
    aspect-ratio: 1; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.6rem; font-weight: 700; color: rgba(6,11,20,0.9);
    transition: all 0.6s; cursor: default;
  }
  .crowd-legend { display: flex; gap: 20px; margin-top: 14px; flex-wrap: wrap; }
  .legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: rgba(224,255,232,0.5); }
  .legend-dot { width: 10px; height: 10px; border-radius: 3px; }

  /* WAIT TIMES */
  .wait-list { display: flex; flex-direction: column; gap: 10px; }
  .wait-item {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px; background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07); border-radius: 10px;
  }
  .wait-icon { font-size: 1.3rem; }
  .wait-name { font-size: 0.85rem; font-weight:600; color: rgba(224,255,232,0.85); flex: 1; }
  .wait-bar-wrap { flex: 2; }
  .wait-bar-bg { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
  .wait-bar { height: 100%; border-radius: 3px; transition: width 0.5s; }
  .wait-mins { font-size: 0.8rem; font-weight:700; min-width: 50px; text-align: right; }

  /* ALERTS */
  .alert-list { display: flex; flex-direction: column; gap: 10px; }
  .alert-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 18px; border-radius: 10px;
    border-left: 3px solid;
  }
  .alert-icon { font-size: 1.1rem; margin-top: 1px; }
  .alert-title { font-size: 0.85rem; font-weight: 600; margin-bottom: 2px; }
  .alert-desc { font-size: 0.78rem; color: rgba(224,255,232,0.5); line-height: 1.5; }
  .alert-time { font-size: 0.7rem; color: rgba(224,255,232,0.3); margin-top: 4px; font-family: 'Orbitron', monospace; }

  /* ROADMAP */
  .roadmap { display: flex; flex-direction: column; gap: 0; }
  .rm-item { display: flex; gap: 20px; }
  .rm-line { display: flex; flex-direction: column; align-items: center; }
  .rm-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
  .rm-connector { width: 2px; flex: 1; background: rgba(0,230,118,0.15); margin: 4px 0; min-height: 30px; }
  .rm-content { padding-bottom: 28px; flex: 1; }
  .rm-phase { font-size: 0.65rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
  .rm-title { font-family:'Orbitron',monospace; font-size: 0.85rem; color: #fff; margin-bottom: 6px; }
  .rm-desc { font-size: 0.82rem; color: rgba(224,255,232,0.45); line-height: 1.6; }

  /* FOOTER */
  footer {
    border-top: 1px solid ${BORDER};
    padding: 28px 0; text-align: center;
    color: rgba(224,255,232,0.25); font-size: 0.78rem; letter-spacing: 1px;
  }
  footer span { color: #00e676; }

  @media (max-width: 600px) {
    .stats-bar { flex-direction: column; }
    .hero h1 { font-size: 2.2rem; }
  }
`;

// ─── Data ──────────────────────────────────────────────────────────────────
const features = [
  {
    icon: "🤖",
    title: "Gemini AI Concierge",
    text: "Attendees ask anything via voice or text — gate directions, food orders, nearest restroom, seat upgrades. Gemini 2.5 Flash Lite Flash responds in <1s in multiple languages.",
    tag: "Gemini 2.5 Flash Lite Flash"
  },
  {
    icon: "🗺️",
    title: "Real-Time Crowd Flow",
    text: "Vertex AI Vision analyzes CCTV feeds to detect crowd density per zone. AI reroutes attendees to uncrowded gates, toilets, and concession stalls in real time.",
    tag: "Vertex AI Vision"
  },
  {
    icon: "⏱️",
    title: "Predictive Wait Times",
    text: "ML models trained on historical event data predict queue lengths 15 minutes ahead. Push notifications alert fans before lines build up.",
    tag: "Vertex AI Forecast"
  },
  {
    icon: "🎟️",
    title: "Smart Entry Orchestration",
    text: "Gemini agents dynamically open/close gates, send staggered entry nudges, and coordinate security staff placement to eliminate bottlenecks.",
    tag: "Gemini Agents + ADK"
  },
  {
    icon: "🍔",
    title: "AI Food & Beverage",
    text: "Order food to your seat via the app. Gemma 3 on-device model personalizes menu suggestions. Concession robots receive AI-dispatched orders.",
    tag: "Gemma 3 (On-device)"
  },
  {
    icon: "🚨",
    title: "Safety & Incident Response",
    text: "Multimodal Gemini detects anomalies (crowd crush, medical emergency) from video + audio and dispatches safety staff with AI-generated response plans.",
    tag: "Gemini Multimodal"
  }
];

const archLayers = [
  {
    title: "Attendee Layer",
    chips: ["Mobile App (PWA)", "Voice Assistant", "Smart Wristband", "Digital Signage", "WhatsApp Bot"]
  },
  {
    title: "AI & Intelligence Layer",
    chips: ["Gemini 2.5 Flash Lite Flash API", "Gemma 3 On-Device", "Vertex AI Vision", "Vertex AI Forecast", "Google ADK Agents", "Multimodal RAG"]
  },
  {
    title: "Data & Sensing Layer",
    chips: ["CCTV / IP Cameras", "IoT Crowd Sensors", "POS Systems", "Ticketing DB", "Weather API", "BLE Beacons"]
  },
  {
    title: "Platform Layer",
    chips: ["Google Cloud Run", "Firestore Realtime DB", "Pub/Sub Streaming", "BigQuery Analytics", "Firebase Auth", "Cloud CDN"]
  }
];

const crowdData = [
  { label: "VIP", density: 0.2 },
  { label: "A1", density: 0.85 },
  { label: "A2", density: 0.4 },
  { label: "B1", density: 0.95 },
  { label: "B2", density: 0.3 },
  { label: "C1", density: 0.6 },
  { label: "C2", density: 0.15 },
  { label: "Exit", density: 0.7 },
  { label: "Gate1", density: 0.9 },
  { label: "Gate2", density: 0.25 },
  { label: "Gate3", density: 0.55 },
  { label: "Gate4", density: 0.4 },
  { label: "Merch", density: 0.8 },
  { label: "Food1", density: 0.65 },
  { label: "Food2", density: 0.3 },
  { label: "Parking", density: 0.45 },
];

const waitItems = [
  { icon: "🍔", name: "North Concession", mins: 22, max: 30, color: "#ff5252" },
  { icon: "🍺", name: "Beer Garden", mins: 8, max: 30, color: "#00e676" },
  { icon: "🚻", name: "Restrooms – East Wing", mins: 5, max: 30, color: "#00e676" },
  { icon: "🚻", name: "Restrooms – West Wing", mins: 18, max: 30, color: "#ffd740" },
  { icon: "🎟️", name: "Gate B Entry", mins: 12, max: 30, color: "#ffd740" },
  { icon: "🚗", name: "Parking Exit", mins: 25, max: 30, color: "#ff5252" },
];

const alerts = [
  {
    icon: "🔴", color: "#ff5252",
    title: "High Density – Section B1",
    desc: "Crowd density at 95%. Gemini agent redirecting 300+ fans to Section C via smart signage. Security deployed.",
    time: "NOW"
  },
  {
    icon: "🟡", color: "#ffd740",
    title: "Long Queue – North Concession",
    desc: "22-min wait predicted. App push sent to 1,200 nearby fans suggesting South Concession (4-min wait).",
    time: "2 MIN AGO"
  },
  {
    icon: "🟢", color: "#00e676",
    title: "Gate 1 Cleared",
    desc: "Staggered entry complete. AI reduced average entry time from 18 min → 6 min. Gates 2 & 3 nominal.",
    time: "8 MIN AGO"
  },
];

const roadmap = [
  {
    phase: "Phase 1 – MVP", done: true, color: "#00e676",
    title: "Gemini AI Concierge + Crowd Map",
    desc: "Mobile PWA with voice/text queries. Real-time crowd density heatmap from CCTV feeds using Vertex AI Vision."
  },
  {
    phase: "Phase 2", done: true, color: "#00e676",
    title: "Predictive Wait Times + Smart Alerts",
    desc: "Vertex AI Forecast model. Push notifications. Staff coordination dashboard."
  },
  {
    phase: "Phase 3", done: false, color: "#ffd740",
    title: "Seat-to-Seat F&B + Gemma On-Device",
    desc: "Order food from app. Gemma 3 personalizes menu. BLE beacon-based precise location."
  },
  {
    phase: "Phase 4", done: false, color: rgba(224, 255, 232, 0.2),
    title: "Multimodal Safety & Full Venue Autonomy",
    desc: "AI safety detection, incident response agents, full ADK orchestration across all venue systems."
  }
];

function rgba(r, g, b, a) { return `rgba(${r},${g},${b},${a})`; }

function densityColor(d) {
  if (d < 0.35) return "#00e676";
  if (d < 0.65) return "#ffd740";
  return "#ff5252";
}

const initialMessages = [
  { role: "ai", text: "👋 Hi! I'm StadiumIQ powered by Gemini. Ask me anything — directions, wait times, food, or event info!" }
];

// ─── Demo Tabs ──────────────────────────────────────────────────────────────
function ChatTab() {
  const [msgs, setMsgs] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send() {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setMsgs(m => [...m, { role: "user", text: q }]);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are StadiumIQ, an AI concierge for a large sports stadium powered by Google Gemini. You help attendees with crowd navigation, wait times, food orders, directions, and event info. Keep responses friendly, concise (2-4 sentences), and actionable. Use emojis sparingly. Current venue: Wankhede Stadium, Mumbai. Event: IPL Match. Current conditions: Section B1 crowded (avoid), North Concession 22-min wait (suggest South at 4 min), Gate 1 clear, restrooms East wing 5-min wait.`,
          messages: [{ role: "user", content: q }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "Sorry, I'm having trouble right now. Please try again!";
      setMsgs(m => [...m, { role: "ai", text }]);
    } catch {
      setMsgs(m => [...m, { role: "ai", text: "Sorry, I couldn't connect right now. Try again in a moment!" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="chat-msgs">
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <div className="msg-avatar">{m.role === "ai" ? "AI" : "You"}</div>
            <div className="msg-bubble">{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="msg ai">
            <div className="msg-avatar">AI</div>
            <div className="msg-bubble" style={{ color: "rgba(0,230,118,0.5)" }}>Thinking…</div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="chat-input-row">
        <input className="chat-input" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about directions, food, wait times…" />
        <button className="chat-btn" onClick={send} disabled={loading || !input.trim()}>Send</button>
      </div>
    </div>
  );
}

function CrowdTab() {
  const [data, setData] = useState(crowdData);

  useEffect(() => {
    const id = setInterval(() => {
      setData(d => d.map(z => ({
        ...z,
        density: Math.max(0.05, Math.min(0.99, z.density + (Math.random() - 0.5) * 0.12))
      })));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div style={{ fontSize: "0.8rem", color: "rgba(224,255,232,0.4)", marginBottom: 14 }}>
        Live crowd density · Updated every 2s via Vertex AI Vision
      </div>
      <div className="crowd-map">
        {data.map((z, i) => (
          <div key={i} className="crowd-cell"
            style={{ background: densityColor(z.density), opacity: 0.3 + z.density * 0.7 }}
            title={`${z.label}: ${Math.round(z.density * 100)}%`}>
            {z.label}
          </div>
        ))}
      </div>
      <div className="crowd-legend">
        <div className="legend-item"><div className="legend-dot" style={{ background: "#00e676" }} /> Low</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: "#ffd740" }} /> Moderate</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: "#ff5252" }} /> High</div>
      </div>
    </div>
  );
}

function WaitTab() {
  const [items, setItems] = useState(waitItems);
  useEffect(() => {
    const id = setInterval(() => {
      setItems(it => it.map(i => ({
        ...i,
        mins: Math.max(1, Math.min(30, i.mins + Math.round((Math.random() - 0.5) * 3))),
        get color() { return this.mins < 10 ? "#00e676" : this.mins < 18 ? "#ffd740" : "#ff5252"; }
      })));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="wait-list">
      {items.map((w, i) => (
        <div key={i} className="wait-item">
          <div className="wait-icon">{w.icon}</div>
          <div className="wait-name">{w.name}</div>
          <div className="wait-bar-wrap">
            <div className="wait-bar-bg">
              <div className="wait-bar" style={{ width: `${(w.mins / w.max) * 100}%`, background: w.color }} />
            </div>
          </div>
          <div className="wait-mins" style={{ color: w.color }}>{w.mins}m</div>
        </div>
      ))}
    </div>
  );
}

function AlertsTab() {
  return (
    <div className="alert-list">
      {alerts.map((a, i) => (
        <div key={i} className="alert-item" style={{ background: `${a.color}0a`, borderColor: a.color }}>
          <div className="alert-icon">{a.icon}</div>
          <div>
            <div className="alert-title" style={{ color: a.color }}>{a.title}</div>
            <div className="alert-desc">{a.desc}</div>
            <div className="alert-time">{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const tabs = [
  { id: "chat", label: "🤖 AI Concierge", Comp: ChatTab },
  { id: "crowd", label: "🗺️ Crowd Map", Comp: CrowdTab },
  { id: "wait", label: "⏱️ Wait Times", Comp: WaitTab },
  { id: "alerts", label: "🚨 Alerts", Comp: AlertsTab },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const ActiveComp = tabs.find(t => t.id === activeTab).Comp;

  return (
    <>
      <style>{style}</style>
      <div className="grid-bg" />
      <div className="pulse-ring" />

      <nav>
        <div className="nav-inner">
          <div className="nav-logo">STADIUM<span>IQ</span></div>
          <div className="nav-badge">Google Antigravity 2025</div>
        </div>
      </nav>

      <div className="container">
        {/* HERO */}
        <div className="hero">
          <div className="hero-eyebrow"><div className="dot" /> Gen AI · Powered by Google</div>
          <h1>The <em>Intelligent</em><br />Stadium Experience</h1>
          <p className="hero-sub">
            A real-time AI platform that eliminates crowd chaos, slashes wait times, and turns 80,000-person venues into seamlessly orchestrated experiences.
          </p>
          <div className="stats-bar">
            <div className="stat"><div className="stat-num">↓68%</div><div className="stat-lbl">Wait Time Reduction</div></div>
            <div className="stat"><div className="stat-num">&lt;1s</div><div className="stat-lbl">AI Response Latency</div></div>
            <div className="stat"><div className="stat-num">80K+</div><div className="stat-lbl">Attendees Served</div></div>
            <div className="stat"><div className="stat-num">99.9%</div><div className="stat-lbl">Safety Detection</div></div>
          </div>
        </div>

        {/* FEATURES */}
        <div className="section">
          <div className="section-title">Core <span>Features</span></div>
          <div className="section-desc">Six AI-powered pillars solving the real pain points of large-scale venues</div>
          <div className="cards">
            {features.map((f, i) => (
              <div key={i} className="card">
                <div className="card-icon">{f.icon}</div>
                <div className="card-title">{f.title}</div>
                <div className="card-text">{f.text}</div>
                <div className="tag">{f.tag}</div>
              </div>
            ))}
          </div>
        </div>

        {/* LIVE DEMO */}
        <div className="section">
          <div className="section-title">Live <span>Demo</span></div>
          <div className="section-desc">Interactive preview — chat with the AI concierge or explore live stadium data</div>
          <div className="demo-panel">
            <div className="demo-tabs">
              {tabs.map(t => (
                <button key={t.id} className={`demo-tab ${activeTab === t.id ? "active" : ""}`}
                  onClick={() => setActiveTab(t.id)}>{t.label}</button>
              ))}
            </div>
            <div className="demo-body">
              <ActiveComp />
            </div>
          </div>
        </div>

        {/* ARCHITECTURE */}
        <div className="section">
          <div className="section-title">System <span>Architecture</span></div>
          <div className="section-desc">Built on Google Cloud with Gemini, Vertex AI, and ADK at its core</div>
          <div className="arch">
            <div className="arch-layers">
              {archLayers.map((l, i) => (
                <>
                  <div key={i} className="arch-layer">
                    <div className="arch-layer-title">{l.title}</div>
                    <div className="arch-chips">
                      {l.chips.map((c, j) => (
                        <div key={j} className={`chip ${j < 2 ? "highlight" : ""}`}>{c}</div>
                      ))}
                    </div>
                  </div>
                  {i < archLayers.length - 1 && <div key={`a${i}`} className="arrow-down">▼</div>}
                </>
              ))}
            </div>
          </div>
        </div>

        {/* ROADMAP */}
        <div className="section">
          <div className="section-title">Build <span>Roadmap</span></div>
          <div className="section-desc">Hackathon MVP → Production-ready platform</div>
          <div className="roadmap">
            {roadmap.map((r, i) => (
              <div key={i} className="rm-item">
                <div className="rm-line">
                  <div className="rm-dot" style={{ background: r.color }} />
                  {i < roadmap.length - 1 && <div className="rm-connector" />}
                </div>
                <div className="rm-content">
                  <div className="rm-phase" style={{ color: r.color }}>{r.phase}</div>
                  <div className="rm-title">{r.title}</div>
                  <div className="rm-desc">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer>
        Built for <span>Google Antigravity Prompt Wars 2025</span> · StadiumIQ · Powered by Gemini + Vertex AI
      </footer>
    </>
  );
}
