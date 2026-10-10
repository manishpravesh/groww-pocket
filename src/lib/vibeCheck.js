const RED_FLAGS = [
  {
    id: 'guaranteed',
    re: /\b(guarante\w*|assured|fixed returns?|risk[- ]?free|no risk|zero risk|can'?t lose)\b/i,
    weight: 35,
    label: 'Promises guaranteed returns',
    why: 'Nobody can guarantee market returns. SEBI literally bans advisers from saying this.',
  },
  {
    id: 'huge_returns',
    re: /(\b\d{2,4}\s?x\b|\b[1-9]\d{2,}\s?%|\bdouble (your )?money\b|\bmultibagger\b|\bto the moon\b|🚀)/i,
    weight: 25,
    label: 'Crazy return numbers',
    why: 'A good year for the Nifty is 12-15%. Anyone flashing 100x is selling a dream.',
  },
  {
    id: 'urgency',
    re: /\b(today only|right now|before it'?s too late|last chance|hurry|don'?t miss|limited (seats|time|slots)|act fast|tomorrow it will)\b/i,
    weight: 15,
    label: 'Rushing you',
    why: 'Real opportunities survive a night of sleep. Urgency is there to stop you from thinking.',
  },
  {
    id: 'private_group',
    re: /\b(telegram|whatsapp|dm me|join (my|our) (group|channel)|vip group|premium group|link in bio)\b/i,
    weight: 20,
    label: 'Pushes you into a private group',
    why: 'Pump-and-dump schemes live in Telegram and WhatsApp groups where nobody is accountable.',
  },
  {
    id: 'insider',
    re: /\b(insider|sure[- ]?shot|jackpot|operator|secret tip|inside news|confirmed news|100% (sure|accurate))\b/i,
    weight: 25,
    label: '"Inside info" or "sure-shot" talk',
    why: 'Trading on real insider info is illegal. Trading on fake insider info is how people get dumped on.',
  },
  {
    id: 'penny',
    re: /\b(penny stock|upper circuit|small ?cap gem|hidden gem|₹\s?\d(\.\d+)? stock|under ₹?\s?10)\b/i,
    weight: 20,
    label: 'Penny stock / circuit hype',
    why: 'Tiny, illiquid stocks are easy to pump. You can buy in but sometimes can\'t sell out.',
  },
  {
    id: 'fno',
    re: /\b(f&o|options? trading|intraday|btst|call option|put option|expiry (day )?trade|scalping|nifty options?)\b/i,
    weight: 20,
    label: 'F&O / intraday push',
    why: 'SEBI found about 9 in 10 retail F&O traders lose money. Not a beginner sport.',
  },
  {
    id: 'flex',
    re: /\b(made \d+\s?(k|l|lakh|thousand)?\b|profit of ₹?\d+|you should (try|buy)|everyone is buying|screenshot proof)/i,
    weight: 10,
    label: 'Profit flexing',
    why: "You only see the screenshots of wins. Nobody posts the day they lost 40%.",
  },
  {
    id: 'paid',
    re: /\b(pay(ing)? (just|only)?\s?₹?\d+|course fee|subscription|paid group|mentorship fee|registration fee|upi me)\b/i,
    weight: 15,
    label: 'Wants money from you first',
    why: 'If the tips were that good, they wouldn\'t need your ₹999 subscription.',
  },
];

const GREEN_FLAGS = [
  { id: 'sebi', re: /\bsebi[- ]registered\b|\bINH\d{9}\b|\bINA\d{9}\b/i, weight: 10, label: 'Mentions SEBI registration (verify it on the SEBI site)' },
  { id: 'longterm', re: /\b(long[- ]term|5\+? years?|10 years?|patience|sip)\b/i, weight: 8, label: 'Talks about the long term' },
  { id: 'diversify', re: /\b(diversif\w*|index fund|asset allocation|don'?t put all)\b/i, weight: 8, label: 'Talks about diversification' },
  { id: 'risk', re: /\b(not financial advice|do your own research|risks? involved|can lose|market risk)\b/i, weight: 6, label: 'Admits there is risk' },
];

export function vibeCheck(text) {
  const t = String(text || '').trim();
  if (t.length < 8) {
    return { score: 0, level: 'empty', flags: [], greens: [], verdict: 'Paste a tip to check it.' };
  }

  const flags = RED_FLAGS.filter((f) => f.re.test(t)).map(({ id, label, why, weight }) => ({ id, label, why, weight }));
  const greens = GREEN_FLAGS.filter((g) => g.re.test(t)).map(({ id, label, weight }) => ({ id, label, weight }));

  const raw = flags.reduce((s, f) => s + f.weight, 0) - greens.reduce((s, g) => s + g.weight, 0);
  const score = Math.max(0, Math.min(100, raw));

  let level, verdict;
  if (score >= 50) {
    level = 'red';
    verdict = 'Big nope. This has classic scam or pump-and-dump energy.';
  } else if (score >= 20) {
    level = 'amber';
    verdict = 'Kinda sus. Not necessarily a scam, but don\'t act on it without digging.';
  } else {
    level = 'green';
    verdict = flags.length
      ? 'Mostly fine, but check the flag below.'
      : 'No obvious red flags. Still, a tip is not a plan. Check the basics yourself.';
  }

  return { score, level, flags, greens, verdict };
}

export const SAMPLE_TIPS = [
  '🚀🚀 XYZ Infra is going to 10x by March! Sure shot multibagger, operators are buying. Join my Telegram VIP group before it\'s too late!!',
  'Guaranteed 5% returns every week with my BTST option strategy. Pay only ₹999 for lifetime access.',
  'Honestly just doing a Nifty 50 index fund SIP for the long term. Boring but works. Not financial advice, do your own research.',
  'This small cap gem hit upper circuit 4 days in a row, buy tomorrow morning, hurry',
];
