export const MIN_REASON_LENGTH = 15;

const LAZY_REASONS = /^(fomo|idk|just|bc|because|friend said|insta|reel|yolo|why not|trust me|tip)\b/i;

/**
 * Pre-trade friction. Doesn't block anything, just slows down the risky stuff.
 * Returns the cool-off in seconds, warnings to show, and whether the reason is good enough.
 */
export function tradeCheck({ amount, risk, reason, holdingsValue = 0, monthlyIncome = 0 }) {
  const amt = Math.max(0, Number(amount) || 0);
  const why = String(reason || '').trim();
  const warnings = [];

  const reasonOk = why.length >= MIN_REASON_LENGTH && !LAZY_REASONS.test(why);
  if (!reasonOk) {
    warnings.push({
      id: 'reason',
      text: why.length === 0
        ? 'Write one line on why you\'re buying. Future you will read it.'
        : 'That reason is a bit thin. What do you actually expect to happen?',
    });
  }

  const after = holdingsValue + amt;
  const concentrationPct = after > 0 ? Math.round((amt / after) * 100) : 0;
  if (holdingsValue > 0 && concentrationPct > 25) {
    warnings.push({ id: 'concentration', text: `This one buy would be ${concentrationPct}% of your portfolio. Eggs, basket, etc.` });
  }

  if (monthlyIncome > 0 && amt > monthlyIncome * 0.5) {
    warnings.push({ id: 'income', text: 'That\'s more than half a month\'s income in one go. Maybe split it over a few weeks?' });
  }

  let coolOff = 0;
  if (risk === 'very high') coolOff = 10;
  else if (risk === 'high') coolOff = 5;
  if (warnings.some((w) => w.id === 'concentration' || w.id === 'income')) coolOff += 5;

  if (risk === 'very high') {
    warnings.push({ id: 'risk', text: 'Very high risk. This can drop 30-50% in a bad month. Only use money you won\'t miss.' });
  }

  return { coolOff, warnings, reasonOk, concentrationPct };
}
