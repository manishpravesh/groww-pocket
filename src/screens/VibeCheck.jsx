import { useState } from 'react';
import { SAMPLE_TIPS, vibeCheck } from '../lib/vibeCheck.js';

const LEVEL = {
  red: { label: 'Red flag', color: '#eb5b3c', emoji: '🚩' },
  amber: { label: 'Kinda sus', color: '#f5a623', emoji: '🤨' },
  green: { label: 'Seems okay', color: '#00b386', emoji: '👌' },
};

export default function VibeCheck() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);

  const run = (t = text) => setResult(vibeCheck(t));

  return (
    <div className="pad">
      <h2>Vibe check a tip</h2>
      <p className="muted">Saw a "sure-shot" stock on a reel, in a Telegram group or from a friend? Paste it here first.</p>

      <textarea rows={4} value={text} placeholder="Paste the message or caption…" onChange={(e) => { setText(e.target.value); setResult(null); }} />
      <button className="primary" disabled={text.trim().length < 8} onClick={() => run()}>Check it</button>

      {result && result.level !== 'empty' && (
        <div className="card result" style={{ borderColor: LEVEL[result.level].color }}>
          <div className="row">
            <b style={{ color: LEVEL[result.level].color }}>{LEVEL[result.level].emoji} {LEVEL[result.level].label}</b>
            <span className="small muted">sus score {result.score}/100</span>
          </div>
          <div className="meter"><div style={{ width: result.score + '%', background: LEVEL[result.level].color }} /></div>
          <p>{result.verdict}</p>

          {result.flags.map((f) => (
            <div key={f.id} className="flag">
              <b>🚩 {f.label}</b>
              <div className="small muted">{f.why}</div>
            </div>
          ))}
          {result.greens.map((g) => (
            <div key={g.id} className="flag green">✓ {g.label}</div>
          ))}

          <div className="small muted" style={{ marginTop: 10 }}>
            This is a pattern check, not a guarantee. Before you buy anything from a tip, ask: who gains if I buy this?
          </div>
        </div>
      )}

      <div className="muted small" style={{ marginTop: 14 }}>Or try one of these:</div>
      <div className="samples">
        {SAMPLE_TIPS.map((s, i) => (
          <button key={i} className="sample" onClick={() => { setText(s); run(s); }}>{s}</button>
        ))}
      </div>
    </div>
  );
}
