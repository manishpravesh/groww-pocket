import { describe, expect, it } from 'vitest';
import { vibeCheck } from '../src/lib/vibeCheck.js';

// Hand-labelled golden set. Expected level is what a sensible human would say.
const GOLDEN = [
  // red: scams / pump-and-dump
  ['🚀 XYZ to 10x by March, sure shot multibagger, join my Telegram VIP group now', 'red'],
  ['Guaranteed 5% weekly returns with my BTST options strategy, pay only ₹999', 'red'],
  ['Operator buying confirmed news, this penny stock will hit upper circuit, hurry!!', 'red'],
  ['Risk free trading! Double your money in 30 days. DM me for the WhatsApp group', 'red'],
  ['Insider tip: 100% sure, ABC Ltd results leak, buy before it\'s too late', 'red'],
  ['Join our premium group, assured 300% returns on nifty options every expiry', 'red'],
  // amber: hype but not textbook scam
  ['This small cap gem has hit upper circuit 4 days in a row, buy tomorrow', 'amber'],
  ['Doing intraday on Bank Nifty, made 20k today, you should try it too', 'amber'],
  ['Hidden gem alert, don\'t miss this one', 'amber'],
  ['Learn options trading in my course, course fee ₹4,999', 'amber'],
  // green: normal / sensible
  ['Started a Nifty 50 index fund SIP, planning to hold for 10 years', 'green'],
  ['Thinking about diversifying into a gold ETF, not financial advice, do your own research', 'green'],
  ['Read the annual report of HDFC Bank, looks solid for the long term', 'green'],
  ['My dad says keep an emergency fund in a liquid fund before investing in stocks', 'green'],
  ['Which flexi cap fund do you guys use? Looking for something for 5 years', 'green'],
];

describe('Vibe check golden set', () => {
  it.each(GOLDEN)('%s -> %s', (text, expected) => {
    expect(vibeCheck(text).level).toBe(expected);
  });

  it('overall accuracy >= 90%', () => {
    const correct = GOLDEN.filter(([t, e]) => vibeCheck(t).level === e).length;
    expect(correct / GOLDEN.length).toBeGreaterThanOrEqual(0.9);
  });

  it('never calls a red-labelled tip green (the costly mistake)', () => {
    const missed = GOLDEN.filter(([t, e]) => e === 'red' && vibeCheck(t).level === 'green');
    expect(missed).toEqual([]);
  });

  it('every flag comes with a human explanation', () => {
    for (const [t] of GOLDEN) {
      for (const f of vibeCheck(t).flags) expect(f.why.length).toBeGreaterThan(20);
    }
  });

  it('handles empty / junk input without crashing', () => {
    expect(vibeCheck('').level).toBe('empty');
    expect(vibeCheck(null).level).toBe('empty');
    expect(vibeCheck('hi').level).toBe('empty');
  });

  it('score stays within 0-100', () => {
    const everything = GOLDEN.map(([t]) => t).join(' ');
    const r = vibeCheck(everything);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.score).toBeGreaterThanOrEqual(0);
  });
});
