import { useState } from 'react';
import { useStore } from './store.js';
import Onboarding from './screens/Onboarding.jsx';
import Home from './screens/Home.jsx';
import MoneyIn from './screens/MoneyIn.jsx';
import Invest from './screens/Invest.jsx';
import VibeCheck from './screens/VibeCheck.jsx';
import FutureYou from './screens/FutureYou.jsx';

const TABS = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'money', label: 'Money in', icon: '↓' },
  { id: 'invest', label: 'Invest', icon: '↗' },
  { id: 'vibe', label: 'Vibe check', icon: '?' },
  { id: 'future', label: 'Future you', icon: '◷' },
];

export default function App() {
  const [state, dispatch] = useStore();
  const [tab, setTab] = useState('home');

  const screen = !state.profile ? (
    <Onboarding onDone={(profile) => dispatch({ type: 'onboard', profile })} />
  ) : (
    {
      home: <Home state={state} dispatch={dispatch} go={setTab} />,
      money: <MoneyIn state={state} dispatch={dispatch} go={setTab} />,
      invest: <Invest state={state} dispatch={dispatch} />,
      vibe: <VibeCheck />,
      future: <FutureYou state={state} />,
    }[tab]
  );

  return (
    <div className="stage">
      <aside className="pitch">
        <div className="logo-dot" />
        <h1>Groww Pocket</h1>
        <p>A prototype of Groww for people who just got their first stipend, salary or gig payment.</p>
        <ul>
          <li><b>Money in:</b> invest when money actually lands, not on a fixed SIP date</li>
          <li><b>Vibe check:</b> paste a tip from Insta or Telegram and see the red flags</li>
          <li><b>Why I bought:</b> one line of reasoning plus a short cool-off before risky buys</li>
          <li><b>Practice mode:</b> ₹1,00,000 of fake money to learn on</li>
        </ul>
        <p className="muted small">All data is mock and stays in your browser.</p>
        {state.profile && (
          <button className="link" onClick={() => { dispatch({ type: 'reset' }); setTab('home'); }}>
            Reset demo
          </button>
        )}
      </aside>

      <div className="phone">
        <div className="screen">{screen}</div>
        {state.profile && (
          <nav className="tabbar">
            {TABS.map((t) => (
              <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
                <span className="ic">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
