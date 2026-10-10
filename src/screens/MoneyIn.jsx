import { useState } from 'react';
import { SOURCES, formatINR, splitIncome } from '../lib/money.js';
import { INSTRUMENTS } from '../lib/data.js';

const BUFFER_GOAL = 10000;

export default function MoneyIn({ state, dispatch, go }) {
  const { profile } = state;
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState(profile.sources[0] ?? 'stipend');
  const [growInto, setGrowInto] = useState('nifty50');
  const [done, setDone] = useState(null);

  const amt = Number(amount) || 0;
  const split = splitIncome(amt, source, { growPct: profile.growPct, bufferSaved: state.bufferSaved, bufferGoal: BUFFER_GOAL });
  const parts = [
    { k: 'needs', label: 'Needs', color: '#7c8db5' },
    { k: 'fun', label: 'Fun', color: '#ffb547' },
    { k: 'buffer', label: 'Buffer', color: '#5367ff' },
    { k: 'grow', label: 'Grow', color: '#00d09c' },
  ];
  const practiceShort = state.mode === 'practice' && split.grow > state.practiceCash;

  if (done) {
    return (
      <div className="pad center-col">
        <div className="big-emoji">🌱</div>
        <h2>{formatINR(done.grow)} is growing</h2>
        <p className="muted">
          {done.buffer > 0 && <>{formatINR(done.buffer)} went to your buffer. </>}
          The other {formatINR(done.needs + done.fun)} is all yours, guilt free.
        </p>
        <button className="primary" onClick={() => { setDone(null); setAmount(''); go('home'); }}>Back home</button>
      </div>
    );
  }

  return (
    <div className="pad">
      <h2>Money just landed?</h2>
      <p className="muted">No fixed SIP date. Log it whenever it shows up and we'll split it.</p>

      <div className="chips">
        {Object.entries(SOURCES).map(([id, s]) => (
          <button key={id} className={'chip ' + (source === id ? 'on' : '')} onClick={() => setSource(id)}>
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      <div className="amount-input">
        <span>₹</span>
        <input type="number" inputMode="numeric" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>

      {amt > 0 && (
        <>
          <div className="splitbar">
            {parts.map((p) => split[p.k] > 0 && (
              <div key={p.k} style={{ flex: split[p.k], background: p.color }} />
            ))}
          </div>
          <div className="split-legend">
            {parts.map((p) => (
              <div key={p.k}>
                <i style={{ background: p.color }} /> {p.label}<b>{formatINR(split[p.k])}</b>
              </div>
            ))}
          </div>
          <div className="card soft small">{split.note}</div>

          <label>Grow it in</label>
          <select value={growInto} onChange={(e) => setGrowInto(e.target.value)}>
            {INSTRUMENTS.filter((i) => i.type !== 'Stock').map((i) => (
              <option key={i.id} value={i.id}>{i.name}{i.starter ? ' (good starter)' : ''}</option>
            ))}
          </select>

          <div className="small muted">Buffer: {formatINR(state.bufferSaved)} / {formatINR(BUFFER_GOAL)} saved for the dry months</div>

          {practiceShort && <div className="warn">Not enough practice cash left for this.</div>}
          <button
            className="primary"
            disabled={practiceShort}
            onClick={() => {
              dispatch({ type: 'drop', amount: amt, source, split, growInto });
              setDone(split);
            }}
          >
            Split it {state.mode === 'practice' && '(practice)'}
          </button>
        </>
      )}
    </div>
  );
}
