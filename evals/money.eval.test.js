import { describe, expect, it } from 'vitest';
import { futureValue, sipFutureValue, splitIncome, formatINR, compactINR } from '../src/lib/money.js';

const SOURCES = ['stipend', 'salary', 'freelance', 'pocket', 'gift'];
const AMOUNTS = [0, 15, 50, 99, 500, 1234, 8000, 15000, 42000, 150000];

describe('Split invariants (every source x amount x grow %)', () => {
  for (const source of SOURCES) {
    for (const amt of AMOUNTS) {
      for (const growPct of [5, 20, 50]) {
        it(`${source} ₹${amt} @${growPct}%`, () => {
          const s = splitIncome(amt, source, { growPct });
          expect(s.needs + s.fun + s.buffer + s.grow).toBe(amt);
          for (const k of ['needs', 'fun', 'buffer', 'grow']) expect(s[k]).toBeGreaterThanOrEqual(0);
          expect(s.grow % 10).toBe(0);
          expect(s.note.length).toBeGreaterThan(0);
        });
      }
    }
  }
});

describe('Split behaviour', () => {
  it('regular income follows the chosen %', () => {
    expect(splitIncome(10000, 'stipend', { growPct: 20 }).grow).toBe(2000);
  });
  it('windfalls grow at least half', () => {
    expect(splitIncome(5000, 'gift', { growPct: 10 }).grow).toBe(2500);
  });
  it('freelance money tops up the buffer until the goal', () => {
    expect(splitIncome(10000, 'freelance', { bufferSaved: 0 }).buffer).toBe(1000);
    expect(splitIncome(10000, 'freelance', { bufferSaved: 9700 }).buffer).toBe(300);
    expect(splitIncome(10000, 'freelance', { bufferSaved: 10000 }).buffer).toBe(0);
  });
  it('tiny amounts still invest the ₹10 minimum', () => {
    expect(splitIncome(30, 'pocket', { growPct: 5 }).grow).toBe(10);
  });
  it('rejects silly grow % values', () => {
    expect(splitIncome(1000, 'salary', { growPct: 500 }).grow).toBeLessThanOrEqual(900);
    expect(splitIncome(1000, 'salary', { growPct: -10 }).grow).toBeGreaterThanOrEqual(0);
  });
});

describe('Compounding maths matches known values', () => {
  it('lumpsum: ₹1,00,000 at 12% for 10y ≈ ₹3.1L', () => {
    expect(Math.round(futureValue(100000, 10))).toBe(310585);
  });
  it('SIP: ₹1,000/month at 12% for 10y ≈ ₹2.32L', () => {
    expect(Math.round(sipFutureValue(1000, 10))).toBeCloseTo(232339, -2);
  });
  it('zero / negative inputs are safe', () => {
    expect(sipFutureValue(0, 10)).toBe(0);
    expect(futureValue(1000, 0)).toBe(1000);
  });
  it('formats rupees the Indian way', () => {
    expect(formatINR(1234567)).toBe('₹12,34,567');
    expect(compactINR(250000)).toBe('₹2.5 L');
    expect(compactINR(12500000)).toBe('₹1.25 Cr');
  });
});
