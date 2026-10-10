import { currentValue } from '../store.js';
import { getInstrument, RISK_META } from '../lib/data.js';
import { compactINR, formatINR, futureValue, SOURCES } from '../lib/money.js';

export default function Home({ state, dispatch, go }) {
  const { profile, mode } = state;
  const holdings = state.holdings[mode];
  const invested = holdings.reduce((s, h) => s + h.amount, 0);
  const value = holdings.reduce((s, h) => s + currentValue(h), 0);
  const gain = value - invested;
  const yearsTo30 = Math.max(1, 30 - profile.age);
  const at30 = futureValue(invested, yearsTo30);

  return (
    <div className="pad">
      <header className="top">
        <div>
          <div className="muted small">Hey {profile.name}</div>
          <h2 className="tight">Your pocket</h2>
        </div>
        <div className="toggle">
          {['practice', 'real'].map((m) => (
            <button key={m} className={mode === m ? 'on' : ''} onClick={() => dispatch({ type: 'setMode', mode: m })}>
              {m === 'practice' ? 'Practice' : 'Real'}
            </button>
          ))}
        </div>
      </header>

      <div className={'card hero ' + mode}>
        <div className="small">{mode === 'practice' ? 'Practice portfolio · fake money' : 'Real portfolio'}</div>
        <div className="hero-val">{formatINR(value)}</div>
        <div className="small">
          Invested {formatINR(invested)} ·{' '}
          <span className={gain >= 0 ? 'up' : 'down'}>{gain >= 0 ? '+' : ''}{formatINR(gain)}</span>
        </div>
        {mode === 'practice' && <div className="small faint">Practice cash left: {formatINR(state.practiceCash)}</div>}
      </div>

      {invested > 0 ? (
        <div className="card future-teaser" onClick={() => go('future')}>
          If you just leave this alone, it could be about <b>{compactINR(at30)}</b> when you're 30.
          <span className="muted small"> Assumes 12% a year. Tap to play with it →</span>
        </div>
      ) : (
        <div className="card soft">
          Nothing here yet. Easiest start: log the next money you get and let the split do the work.
        </div>
      )}

      <div className="actions">
        <button onClick={() => go('money')}><span>💸</span>Money just landed</button>
        <button onClick={() => go('vibe')}><span>🧐</span>Check a tip</button>
      </div>

      {holdings.length > 0 && (
        <>
          <h3>Why you bought</h3>
          <p className="muted small">Your own reasons, saved at the time of buying. Still true?</p>
          {holdings.map((h) => {
            const inst = getInstrument(h.instrumentId);
            return (
              <div key={h.id} className="card holding">
                <div className="row">
                  <b>{inst?.name}</b>
                  <span>{formatINR(currentValue(h))}</span>
                </div>
                <div className="row small muted">
                  <span style={{ color: RISK_META[inst?.risk]?.color }}>{RISK_META[inst?.risk]?.label}</span>
                  <span>{new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="reason">"{h.reason}"</div>
                {h.review ? (
                  <div className="small muted">You said: {h.review === 'still' ? '✅ still true' : '🤔 changed my mind'}</div>
                ) : (
                  <div className="row gap">
                    <button className="mini" onClick={() => dispatch({ type: 'review', id: h.id, review: 'still' })}>Still true</button>
                    <button className="mini ghost" onClick={() => dispatch({ type: 'review', id: h.id, review: 'changed' })}>Changed my mind</button>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {state.drops.length > 0 && (
        <>
          <h3>Money drops</h3>
          {state.drops.slice(0, 5).map((d) => (
            <div key={d.id} className="row drop">
              <span>{SOURCES[d.source]?.emoji} {SOURCES[d.source]?.label}</span>
              <span>{formatINR(d.amount)} <span className="muted small">· {formatINR(d.split.grow)} grew</span></span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
