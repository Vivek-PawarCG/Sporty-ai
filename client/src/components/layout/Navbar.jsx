import { Zap } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        <a href="/" className="navbar-logo" aria-label="Sporty-AI Home">
          <Zap size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} aria-hidden="true" />
          SPORTY<span>-AI</span>
        </a>
        <div className="navbar-badge">
          Live
        </div>
      </div>
    </nav>
  );
}
