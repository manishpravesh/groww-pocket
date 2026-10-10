# Prompts used

Tool: Cursor (agent mode), building a React + Vite app that is deployed on Vercel.

## 1. The prompts I actually sent

1. The full problem statement (Designing Groww for the GenZ investor), followed by: *"ask if you have any doubt"*
2. My answers to the agent's clarifying questions:
   - Build in code (React + Vite) and deploy to a public URL (Vercel)
   - Problem focus: *"think of your own something great yet not obvious, be creative"*
   - Features: *"think the best ones"*
   - Mock data is fine, no real KYC, payments or market data
   - Due in 2–3 days

## 2. Prompt breakdown (the same build split into steps, reusable in Lovable or Bolt)

**P1: Framing**
> You're a product designer at Groww. Target user: 20–26, first investment account, money comes in uneven chunks (stipend, part-time, freelance, birthday money), learns about investing from Instagram reels and Telegram groups. Don't build "Groww but with emojis". Find 3–4 problems that are specific to this group and that today's apps (which assume a monthly salary and a rational user) don't handle. Give each problem a feature, and say why it's more than a cosmetic change.

**P2: App shell**
> Build a mobile-first React app called "Groww Pocket" inside a phone frame, with a pitch panel next to it on desktop. Use Groww's green (#00D09C). Bottom tabs: Home, Money in, Invest, Vibe check, Future you. Keep all state in localStorage. Use mock data only. Add a Practice / Real toggle; practice mode gives ₹1,00,000 of fake cash.

**P3: Money in (investing that follows income)**
> Instead of a fixed SIP date, the user logs money whenever it lands and picks the source. Split it into needs / fun / buffer / grow. Regular income uses the user's grow %. Freelance money also sends 10% to a buffer until a ₹10k goal is reached. Gifts and bonuses send at least 50% to grow. Grow is rounded to ₹10, with a ₹10 minimum. Show a split bar and a one-line explanation in casual language.

**P4: Vibe check (tip checker)**
> The user pastes a stock tip or caption. Use a rule-based checker (no LLM, so it's predictable and testable) with weighted red flags: guaranteed returns, 10x or 300% claims, urgency, Telegram or WhatsApp groups, insider or "sure-shot" talk, penny stocks or upper circuits, F&O or intraday pushes, paid groups, profit flexing. Green flags reduce the score: a SEBI registration number, long-term framing, diversification, an admission of risk. Output a 0–100 score, a red / amber / green level, and a plain-English reason for every flag.

**P5: Why I bought, plus the cool-off**
> Before any buy, ask for a one-line reason. Block empty or lazy reasons ("fomo", "friend said"). High-risk buys get a 5s cool-off and very-high-risk buys get 10s, plus 5s more if the buy is over 25% of the portfolio or over half a month's income. During the cool-off, show the user's own reason back to them. Save the reason with the holding and later ask "Still true?" on Home.

**P6: Future you**
> Show what a spend could become if invested instead (once, weekly or monthly), using 12% a year up to a target age chosen with a slider. Presets: late-night Swiggy, concert ticket, unused OTT subscriptions, phone upgrade. The tone shouldn't guilt-trip.

**P7: Evals**
> Write vitest evals: a hand-labelled golden set of 15 tips for the tip checker (≥90% accuracy, never label a red tip green), invariants for the split across every source × amount × grow % combination, compounding checks against known values, and pre-trade friction cases plus reducer flows.
