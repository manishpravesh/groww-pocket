import { describe, expect, it } from 'vitest';
import { tradeCheck } from '../src/lib/tradeCheck.js';
import { _reducer, _initial, PRACTICE_CASH } from '../src/store.js';
import { splitIncome } from '../src/lib/money.js';

const GOOD = 'Want broad India exposure for at least 5 years';

describe('Pre-trade friction', () => {
  it('blocks buys with no reason or a lazy reason', () => {
    expect(tradeCheck({ amount: 500, risk: 'moderate', reason: '' }).reasonOk).toBe(false);
    expect(tradeCheck({ amount: 500, risk: 'moderate', reason: 'fomo' }).reasonOk).toBe(false);
    expect(tradeCheck({ amount: 500, risk: 'moderate', reason: 'friend said it will go up a lot' }).reasonOk).toBe(false);
    expect(tradeCheck({ amount: 500, risk: 'moderate', reason: GOOD }).reasonOk).toBe(true);
  });

  it('no cool-off for a normal index fund buy', () => {
    const r = tradeCheck({ amount: 500, risk: 'moderate', reason: GOOD, holdingsValue: 5000, monthlyIncome: 20000 });
    expect(r.coolOff).toBe(0);
    expect(r.warnings).toEqual([]);
  });

  it('cool-off scales with risk', () => {
    expect(tradeCheck({ amount: 500, risk: 'high', reason: GOOD }).coolOff).toBe(5);
    expect(tradeCheck({ amount: 500, risk: 'very high', reason: GOOD }).coolOff).toBe(10);
  });

  it('flags concentration and big-vs-income buys, and adds time', () => {
    const r = tradeCheck({ amount: 15000, risk: 'very high', reason: GOOD, holdingsValue: 5000, monthlyIncome: 20000 });
    const ids = r.warnings.map((w) => w.id);
    expect(ids).toContain('concentration');
    expect(ids).toContain('income');
    expect(r.coolOff).toBe(15);
  });

  it('first ever buy is not flagged as concentration', () => {
    const r = tradeCheck({ amount: 1000, risk: 'moderate', reason: GOOD, holdingsValue: 0 });
    expect(r.warnings.find((w) => w.id === 'concentration')).toBeUndefined();
  });
});

describe('App state flows', () => {
  const profile = { name: 'Riya', age: 21, sources: ['stipend'], monthlyIncome: 15000, growPct: 20 };

  it('practice buys spend fake cash, real buys do not', () => {
    let s = _reducer(_initial, { type: 'onboard', profile });
    s = _reducer(s, { type: 'buy', instrumentId: 'nifty50', amount: 1000, reason: GOOD });
    expect(s.practiceCash).toBe(PRACTICE_CASH - 1000);
    s = _reducer(s, { type: 'setMode', mode: 'real' });
    s = _reducer(s, { type: 'buy', instrumentId: 'nifty50', amount: 1000, reason: GOOD });
    expect(s.practiceCash).toBe(PRACTICE_CASH - 1000);
    expect(s.holdings.real).toHaveLength(1);
    expect(s.holdings.practice).toHaveLength(1);
  });

  it('logging a money drop invests the grow part and saves the buffer', () => {
    let s = _reducer(_initial, { type: 'onboard', profile });
    const split = splitIncome(12000, 'freelance', { growPct: 20 });
    s = _reducer(s, { type: 'drop', amount: 12000, source: 'freelance', split, growInto: 'nifty50' });
    expect(s.drops).toHaveLength(1);
    expect(s.bufferSaved).toBe(split.buffer);
    expect(s.holdings.practice[0].amount).toBe(split.grow);
    expect(s.holdings.practice[0].reason).toMatch(/freelance/);
  });

  it('review marks only the chosen holding', () => {
    let s = _reducer(_initial, { type: 'onboard', profile });
    s = _reducer(s, { type: 'buy', instrumentId: 'nifty50', amount: 100, reason: GOOD });
    s = _reducer(s, { type: 'buy', instrumentId: 'gold', amount: 100, reason: GOOD });
    const id = s.holdings.practice[0].id;
    s = _reducer(s, { type: 'review', id, review: 'changed' });
    expect(s.holdings.practice[0].review).toBe('changed');
    expect(s.holdings.practice[1].review).toBeNull();
  });
});
