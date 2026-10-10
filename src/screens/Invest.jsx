import { useEffect, useState } from 'react';
import { INSTRUMENTS, RISK_META } from '../lib/data.js';
import { formatINR } from '../lib/money.js';
import { tradeCheck } from '../lib/tradeCheck.js';
import { currentValue } from '../store.js';

export default function Invest({ state, dispatch }) {
  const [picked, setPicked] = useState(null);
  const [filter, setFilter] = useState('all');
  const list = INSTRUMENTS.filter((i) => filter === 'all' || (filter === 'starter' ? i.starter : i.type === 'Stock'));

  return (
    <div className="pad">
      <h2>Invest</h2>
      <p className="muted">Everything is explained in plain words. No jargon, promise.</p>
      <div className="chips">
        {[['all', 'All'], ['starter', 'Good to start'], ['stocks', 'Single stocks']].map(([id, l]) => (
          <button key={id} className={'chip ' + (filter === id ? 'on' : '')} onClick={() => setFilter(id)}>{l}</button>
        ))}
      </div>

      {list.map((i) => (
        <button key={i.id} className="card inst" onClick={() => setPicked(i)}>
          <div className="row">
            <b>{i.name}</b>
            <span className={i.ret1y >= 0 ? 'up' : 'down'}>{i.ret1y > 0 ? '+' : ''}{i.ret1y}% <span className="muted small">1Y</span></span>
          </div>
          <div className="row small">
            <span className="muted">{i.type}</span>
            <span className="pill" style={{ color: RISK_META[i.risk].color, borderColor: RISK_META[i.risk].color }}>{RISK_META[i.risk].label}</span>
          </div>
          <p className="small plain">{i.plain}</p>
        </button>
      ))}

      {picked && <BuySheet inst={picked} state={state} dispatch={dispatch} onClose={() => setPicked(null)} />}
    </div>
  );
}

function BuySheet({ inst, state, dispatch, onClose }) {
  const [amount, setAmount] = useState(inst.minAmount * 5);
  const [reason, setReason] = useState('');
  const [timer, setTimer] = useState(null);
  const [bought, setBought] = useState(false);

  const holdingsValue = state.holdings[state.mode].reduce((s, h) => s + currentValue(h), 0);
  const check = tradeCheck({ amount, risk: inst.risk, reason, holdingsValue, monthlyIncome: state.profile.monthlyIncome });
  const tooLow = amount < inst.minAmount;
  const noCash = state.mode === 'practice' && amount > state.practiceCash;

  useEffect(() => {
    if (timer === null || timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const confirm = () => {
    dispatch({ type: 'buy', instrumentId: inst.id, amount, reason: reason.trim() });
    setBought(true);
  };

  const onBuy = () => {
    if (check.coolOff > 0 && timer === null) setTimer(check.coolOff);
    else confirm();
  };

  return (
    <div className="sheet-wrap" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        {bought ? (
          <div className="center-col">
            <div className="big-emoji">✅</div>
            <h3>Bought {formatINR(amount)} of {inst.name}</h3>
            <p className="muted small">Your reason is saved on Home. We'll ask if it's still true later.</p>
            <button className="primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="row">
              <h3 className="tight">{inst.name}</h3>
              <button className="link" onClick={onClose}>✕</button>
            </div>
            <p className="small muted">{inst.plain}</p>

            <label>Amount (min {formatINR(inst.minAmount)})</label>
            <div className="amount-input sm">
              <span>₹</span>
              <input type="number" value={amount} onChange={(e) => { setAmount(Number(e.target.value)); setTimer(null); }} />
            </div>

            <label>Why are you buying this? <span className="muted small">(one line, just for you)</span></label>
            <textarea
              rows={2}
              value={reason}
              placeholder="e.g. I want broad India exposure for 5+ years"
              onChange={(e) => { setReason(e.target.value); setTimer(null); }}
            />

            {check.warnings.map((w) => <div key={w.id} className="warn">{w.text}</div>)}
            {tooLow && <div className="warn">Minimum is {formatINR(inst.minAmount)}.</div>}
            {noCash && <div className="warn">Not enough practice cash.</div>}

            {timer !== null && timer > 0 ? (
              <div className="cooloff">
                <div className="cooloff-num">{timer}</div>
                <div className="small">Quick breather. Read your reason again: <i>"{reason.trim()}"</i>. Still feel good?</div>
              </div>
            ) : null}

            <button
              className="primary"
              disabled={!check.reasonOk || tooLow || noCash || (timer !== null && timer > 0)}
              onClick={onBuy}
            >
              {timer === 0 ? 'Yep, buy it' : timer > 0 ? `Wait ${timer}s…` : check.coolOff > 0 ? `Buy (${check.coolOff}s cool-off)` : 'Buy'}
              {state.mode === 'practice' && ' · practice'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
