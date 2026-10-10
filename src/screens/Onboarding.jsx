import { useState } from 'react';
import { SOURCES, formatINR } from '../lib/money.js';

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState(21);
  const [sources, setSources] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState(15000);
  const [growPct, setGrowPct] = useState(15);

  const toggle = (s) => setSources((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <div className="pad onboarding">
      <div className="steps">{[0, 1, 2].map((i) => <span key={i} className={i <= step ? 'on' : ''} />)}</div>

      {step === 0 && (
        <>
          <h2>Hey 👋 let's set you up</h2>
          <p className="muted">No KYC, no forms. Three quick questions.</p>
          <label>What should we call you?</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoFocus />
          <label>How old are you?</label>
          <input type="number" min={16} max={40} value={age} onChange={(e) => setAge(Number(e.target.value))} />
          <button className="primary" disabled={!name.trim()} onClick={() => setStep(1)}>Next</button>
        </>
      )}

      {step === 1 && (
        <>
          <h2>How does money come in?</h2>
          <p className="muted">Pick all that apply. Most people your age have more than one.</p>
          <div className="chips">
            {Object.entries(SOURCES).map(([id, s]) => (
              <button key={id} className={'chip ' + (sources.includes(id) ? 'on' : '')} onClick={() => toggle(id)}>
                {s.emoji} {s.label}
              </button>
            ))}
          </div>
          <label>Roughly how much in a normal month?</label>
          <input type="number" min={0} step={500} value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} />
          <button className="primary" disabled={!sources.length} onClick={() => setStep(2)}>Next</button>
        </>
      )}

      {step === 2 && (
        <>
          <h2>How much of each drop should grow?</h2>
          <p className="muted">Every time money lands, we'll suggest putting this % to work. You can change it anytime.</p>
          <div className="big-pct">{growPct}%</div>
          <input type="range" min={5} max={50} step={5} value={growPct} onChange={(e) => setGrowPct(Number(e.target.value))} />
          <div className="card soft">
            Out of {formatINR(monthlyIncome)}, <b>{formatINR(Math.floor((monthlyIncome * growPct) / 1000) * 10)}</b> grows and the rest is yours to spend.
            {growPct >= 35 && <div className="muted small">Ambitious! Just make sure rent and food are covered.</div>}
          </div>
          <button className="primary" onClick={() => onDone({ name: name.trim(), age, sources, monthlyIncome, growPct })}>
            Let's go
          </button>
        </>
      )}
    </div>
  );
}
