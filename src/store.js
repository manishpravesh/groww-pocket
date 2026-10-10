import { useEffect, useReducer } from 'react';
import { getInstrument } from './lib/data.js';

const KEY = 'groww-pocket-v1';
export const PRACTICE_CASH = 100000;

const initial = {
  profile: null,
  mode: 'practice',
  practiceCash: PRACTICE_CASH,
  holdings: { practice: [], real: [] },
  drops: [],
  bufferSaved: 0,
};

const uid = () => Math.random().toString(36).slice(2, 9);

function reducer(state, action) {
  switch (action.type) {
    case 'onboard':
      return { ...state, profile: action.profile };
    case 'setMode':
      return { ...state, mode: action.mode };
    case 'buy': {
      const { instrumentId, amount, reason } = action;
      const h = { id: uid(), instrumentId, amount, reason, date: Date.now(), review: null };
      const holdings = { ...state.holdings, [state.mode]: [h, ...state.holdings[state.mode]] };
      const practiceCash = state.mode === 'practice' ? state.practiceCash - amount : state.practiceCash;
      return { ...state, holdings, practiceCash };
    }
    case 'drop': {
      const { amount, source, split, growInto } = action;
      let next = {
        ...state,
        drops: [{ id: uid(), amount, source, split, date: Date.now() }, ...state.drops],
        bufferSaved: state.bufferSaved + split.buffer,
      };
      if (split.grow > 0) {
        next = reducer(next, { type: 'buy', instrumentId: growInto, amount: split.grow, reason: `Auto-split from ${source} money` });
      }
      return next;
    }
    case 'review': {
      const list = state.holdings[state.mode].map((h) => (h.id === action.id ? { ...h, review: action.review } : h));
      return { ...state, holdings: { ...state.holdings, [state.mode]: list } };
    }
    case 'reset':
      return initial;
    default:
      return state;
  }
}

export function useStore() {
  const [state, dispatch] = useReducer(reducer, initial, () => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      return saved ? { ...initial, ...saved } : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);
  return [state, dispatch];
}

// Mock "current value": pretend each holding has had about a month of its 1y return.
export function currentValue(h) {
  const inst = getInstrument(h.instrumentId);
  const monthly = (inst?.ret1y ?? 0) / 100 / 12;
  return h.amount * (1 + monthly);
}

export { reducer as _reducer, initial as _initial };
