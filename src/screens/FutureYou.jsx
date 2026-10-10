import { useState } from 'react';
import { compactINR, formatINR, sipFutureValue, futureValue } from '../lib/money.js';

const FREQ = { once: 'Once', weekly: 'Every week', monthly: 'Every month' };
const PRESETS = [
  { label: 'Late-night Swiggy', amount: 350, freq: 'weekly' },
  { label: 'Concert ticket', amount: 3500, freq: 'once' },
  { label: 'Unused OTT subs', amount: 650, freq: 'monthly' },
  { label: 'New phone upgrade', amount: 25000, freq: 'once' },
];

export default function FutureYou({ state }) {
  const age = state.profile.age;
  const [label, setLabel] = useState(PRESETS[0].label);
  const [amount, setAmount] = useState(PRESETS[0].amount);
  const [freq, setFreq] = useState(PRESETS[0].freq);
  const [targetAge, setTargetAge] = useState(Math.max(age + 5, 30));

  const years = Math.max(1, targetAge - age);
  const monthly = freq === 'weekly' ? (amount * 52) / 12 : freq === 'monthly' ? amount : 0;
  const fv = freq === 'once' ? futureValue(amount, years) : sipFutureValue(monthly, years);
  const putIn = freq === 'once' ? amount : monthly * 12 * years;

  return (
    <div className="pad">
      <h2>Future you</h2>
      <p className="muted">Not here to make you feel bad about biryani. Just showing the trade-off so you can choose.</p>

      <div className="chips">
        {PRESETS.map((p) => (
          <button key={p.label} className={'chip ' + (label === p.label ? 'on' : '')}
            onClick={() => { setLabel(p.label); setAmount(p.amount); setFreq(p.freq); }}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="row gap">
        <div className="amount-input sm grow">
          <span>₹</span>
          <input type="number" value={amount} onChange={(e) => { setAmount(Number(e.target.value)); setLabel(''); }} />
        </div>
        <select value={freq} onChange={(e) => setFreq(e.target.value)}>
          {Object.entries(FREQ).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <label>By the time I'm {targetAge}</label>
      <input type="range" min={age + 1} max={60} value={targetAge} onChange={(e) => setTargetAge(Number(e.target.value))} />

      <div className="card future">
        <div className="small">If you invested this instead</div>
        <div className="hero-val">{compactINR(fv)}</div>
        <div className="small">You'd put in {compactINR(putIn)} over {years} {years === 1 ? 'year' : 'years'}. The rest is compounding doing its thing.</div>
      </div>

      <div className="card soft small">
        Fair take: spending on stuff you love is fine. Maybe just skip the ones you won't remember next week, like
        {freq === 'weekly' ? ` 1 in 4 of those ${formatINR(amount)} orders` : ' the stuff you forgot you were paying for'}.
      </div>
      <p className="muted small">Assumes 12% a year, which is roughly what Indian equity has done over long periods. Not guaranteed. Could be more, could be less.</p>
    </div>
  );
}
