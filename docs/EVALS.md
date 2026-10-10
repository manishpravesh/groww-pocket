# Evals

Run them with `npm test`. There are 187 checks and all of them pass.

## A. Automated evals (`/evals`)

| Eval | What it checks | Pass bar |
|---|---|---|
| Tip checker golden set | 15 hand-labelled tips (6 red, 4 amber, 5 green) | ≥ 90% match, and **zero red tips labelled green** |
| Tip checker quality | Every flag has a human-readable reason; empty or junk input doesn't crash; score stays within 0–100 | 100% |
| Split invariants | 5 sources × 10 amounts (₹0 to ₹1.5L) × 3 grow % values = 150 cases. Parts always add up to the amount exactly, nothing is negative, grow is a multiple of ₹10, there is always a note | 100% |
| Split behaviour | Grow % is respected; windfalls grow ≥ 50%; the freelance buffer tops up and then stops; the ₹10 minimum applies; silly grow % values are clamped | 100% |
| Compounding maths | ₹1L at 12% for 10 years = ₹3,10,585; a ₹1k/month SIP for 10 years ≈ ₹2.32L; Indian number formatting (₹12,34,567, ₹2.5 L, ₹1.25 Cr) | exact |
| Pre-trade friction | Lazy reasons are blocked; a normal index fund buy gets no friction; cool-off scales with risk; concentration and income warnings fire; a first buy isn't flagged | 100% |
| App flows | Practice buys spend fake cash and real buys don't; a money drop invests the grow part and fills the buffer; "Still true?" only marks the chosen holding | 100% |

**What the evals caught:** the first run failed 2 golden cases. "Small cap gem hit upper circuit 4 days in a row" and "Doing intraday on Bank Nifty, made 20k today" were both rated green. A single hype signal wasn't weighted enough. I raised the weight on penny stocks and F&O, added a "profit flexing" rule, and both cases now come out amber.

## B. Manual checks (done in the browser)

1. **First-time user:** onboarding takes 3 screens and under 30 seconds, with no finance jargon.
2. **Freelancer:** logged ₹12,000 of gig income. It split into ₹6,300 needs, ₹2,700 fun, ₹1,200 buffer and ₹1,800 grow, and the grow part showed up on Home with an auto-written reason.
3. **Impulse buyer:** a ₹1,250 Zomato stock buy with a small portfolio showed a "41% of your portfolio" warning, a "very high risk" warning and a 15s cool-off that shows the user's own reason back to them.
4. **Scam tip:** a Telegram "10x sure-shot" message was rated red at 85/100, with a reason for each flag.

## C. Product-level evals (what I'd measure if this shipped)

- **Activation:** % of new 20–26 users who make a first investment within 7 days (target: up vs. the current baseline)
- **Habit:** money drops logged per user per month, and % of drops where the suggested grow amount is accepted
- **Quality of investing:** % of first investments that go into diversified funds vs. single stocks or F&O
- **Harm reduction:** % of very-high-risk buys abandoned during the cool-off (it should be meaningful but not 90%, or it's just annoying), and tip checks per week
- **Retention:** 90-day retention of users who used Practice mode first vs. users who didn't
- **Guardrail:** buy-flow drop-off for low-risk funds shouldn't increase, since friction is meant only for the risky stuff
