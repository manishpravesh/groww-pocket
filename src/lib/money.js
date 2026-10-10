export const DEFAULT_RATE = 0.12;

export function formatINR(n) {
  const v = Math.round(Number(n) || 0);
  return '₹' + v.toLocaleString('en-IN');
}

export function compactINR(n) {
  const v = Math.round(Number(n) || 0);
  if (v >= 1e7) return '₹' + (v / 1e7).toFixed(2).replace(/\.?0+$/, '') + ' Cr';
  if (v >= 1e5) return '₹' + (v / 1e5).toFixed(2).replace(/\.?0+$/, '') + ' L';
  return formatINR(v);
}

export function futureValue(amount, years, rate = DEFAULT_RATE) {
  if (amount <= 0 || years <= 0) return Math.max(0, amount);
  return amount * Math.pow(1 + rate, years);
}

export function sipFutureValue(monthly, years, rate = DEFAULT_RATE) {
  if (monthly <= 0 || years <= 0) return 0;
  const r = rate / 12;
  const n = Math.round(years * 12);
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

export const SOURCES = {
  stipend: { label: 'Stipend', emoji: '🎓', kind: 'regular' },
  salary: { label: 'Salary', emoji: '💼', kind: 'regular' },
  freelance: { label: 'Freelance gig', emoji: '🎨', kind: 'irregular' },
  pocket: { label: 'Pocket money', emoji: '🏠', kind: 'regular' },
  gift: { label: 'Gift / bonus', emoji: '🎁', kind: 'windfall' },
};

const MIN_INVEST = 10;

/**
 * Splits a money drop into needs / fun / buffer / grow.
 * Rules:
 *  - regular income: grow = growPct
 *  - irregular income: same grow, plus 10% to buffer until the buffer goal is hit
 *  - windfall: at least 50% to grow, since nothing was budgeted against it
 *  - grow is rounded down to a multiple of 10 and never below ₹10 if there is room
 */
export function splitIncome(amount, source, { growPct = 20, bufferSaved = 0, bufferGoal = 10000 } = {}) {
  const amt = Math.max(0, Math.round(Number(amount) || 0));
  const kind = SOURCES[source]?.kind ?? 'regular';
  if (amt === 0) return { needs: 0, fun: 0, buffer: 0, grow: 0, kind, note: 'Nothing to split.' };

  let growShare = Math.min(Math.max(growPct, 0), 90) / 100;
  if (kind === 'windfall') growShare = Math.max(growShare, 0.5);

  let bufferShare = 0;
  const bufferLeft = Math.max(0, bufferGoal - bufferSaved);
  if (kind === 'irregular' && bufferLeft > 0) bufferShare = 0.1;

  let grow = Math.floor((amt * growShare) / 10) * 10;
  if (grow < MIN_INVEST && amt >= MIN_INVEST * 2) grow = MIN_INVEST;
  let buffer = Math.min(Math.round(amt * bufferShare), bufferLeft);

  const rest = amt - grow - buffer;
  const needsShare = kind === 'windfall' ? 0.4 : 0.7;
  const needs = Math.round(rest * needsShare);
  const fun = rest - needs;

  let note;
  if (kind === 'windfall') note = "Bonus money hits different. Half of it goes to grow because you weren't counting on it anyway.";
  else if (kind === 'irregular') note = bufferShare > 0
    ? 'Gig money is lumpy, so a bit goes to your buffer for the dry months.'
    : 'Buffer is full, nice. Same split as regular income now.';
  else note = `Your usual ${growPct}% to grow. Rest is yours.`;

  return { needs, fun, buffer, grow, kind, note };
}
