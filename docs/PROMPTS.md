# Prompts

**Approach:** one system prompt sets the product context and the rules that apply everywhere. Each feature then gets its own task prompt with the same structure: **context → task → requirements → constraints → output → acceptance criteria**. Requirements are written as testable rules, not vibes, so every prompt maps to an eval in [`EVALS.md`](./EVALS.md).

| # | Prompt | Output | Eval coverage |
|---|---|---|---|
| 0 | System prompt | Shared context for all tasks | n/a |
| 1 | Problem framing | Problem → feature map | Manual review |
| 2 | App shell and state | `App.jsx`, `store.js`, `styles.css` | App flow evals |
| 3 | Money in | `lib/money.js`, `MoneyIn.jsx` | Split invariants + behaviour |
| 4 | Vibe check | `lib/vibeCheck.js`, `VibeCheck.jsx` | Golden set (15 labelled tips) |
| 5 | Why I bought + cool-off | `lib/tradeCheck.js`, `Invest.jsx` | Pre-trade friction evals |
| 6 | Future you | `FutureYou.jsx` | Compounding maths evals |
| 7 | Evals | `evals/*.eval.test.js` | Self |

---

## 0. System prompt

```xml
<role>
You are a senior product engineer at Groww building a prototype for first-time
investors in India aged 20–26. You write clean, minimal React and you care about
behavioural design as much as UI.
</role>

<product_context>
- Users: students, interns, first-jobbers, part-timers, freelancers. First investment account.
- Income: small and irregular (stipends, gig payments, pocket money, gifts), not one fixed salary.
- Information sources: Instagram reels, YouTube, Telegram/WhatsApp groups, friends.
- Biggest risks: acting on tips, F&O/penny stocks as a first trade, quitting after one early loss.
</product_context>

<global_rules>
- Stack: React 18 + Vite, plain CSS, no UI libraries, no backend.
- Data: mock only. No KYC, payments, live prices or real orders.
- Persistence: localStorage.
- All business logic lives in pure functions under src/lib so it can be unit tested.
- Copy: casual, plain English, no finance jargon without an explanation. Never shame the user.
- Never present returns as guaranteed. Any projection must state its assumption.
- Mobile-first: 390px phone frame on desktop, full screen on mobile.
- Brand: primary #00D09C, Inter font.
</global_rules>

<output_rules>
- Return complete files, not diffs or snippets.
- Do not add comments that restate the code.
- If a requirement is ambiguous, pick the safer behaviour for the user and say so in one line.
</output_rules>
```

---

## 1. Problem framing

```xml
<context>
Groww already removes access barriers (zero-fee accounts, ₹100 SIPs). Simply making
the UI "younger" is not a strategy.
</context>

<task>
Identify the 3–4 problems that are specific to 20–26 year old first-time investors
and that current investing apps do not solve, then propose one feature per problem.
</task>

<requirements>
- Each problem must come from a structural difference (income pattern, information
  source, risk exposure, experience level), not from age or aesthetics alone.
- For each feature, state why it beats the obvious alternative
  (e.g. why it beats "start a ₹100 SIP" or "add a learning section").
- Exclude anything that needs regulatory approval or real money movement to demo.
</requirements>

<output_format>
Table with columns: Problem | Evidence or assumption | Feature | Why not the obvious fix
Then a 1-line scope statement and an out-of-scope list.
</output_format>

<acceptance_criteria>
- No feature is purely cosmetic (streaks, emojis, themes).
- At least one feature reduces harm rather than increasing engagement.
</acceptance_criteria>
```

---

## 2. App shell and state

```xml
<task>
Build the app shell, navigation and state for "Groww Pocket".
</task>

<requirements>
- Layout: pitch panel (left) + phone frame (right) on desktop; phone only on width < 820px.
- Bottom tabs: Home, Money in, Invest, Vibe check, Future you.
- First run shows a 3-step onboarding: name + age; income sources (multi-select)
  + rough monthly income; grow % slider (5–50%, step 5) with a live ₹ example.
- Mode toggle: Practice (₹1,00,000 fake cash) / Real (mock, no cash tracking).
- Holdings are stored separately per mode.
- State managed with useReducer; persisted to localStorage under a versioned key.
- Export the reducer and initial state so they can be tested without React.
- A "Reset demo" control clears all state.
</requirements>

<state_shape>
profile: { name, age, sources[], monthlyIncome, growPct } | null
mode: "practice" | "real"
practiceCash: number
holdings: { practice: Holding[], real: Holding[] }
  Holding = { id, instrumentId, amount, reason, date, review: null | "still" | "changed" }
drops: { id, amount, source, split, date }[]
bufferSaved: number
</state_shape>

<acceptance_criteria>
- Buying in practice mode reduces practiceCash; buying in real mode does not.
- Refreshing the page keeps all state.
</acceptance_criteria>
```

---

## 3. Money in (investing that follows income)

```xml
<context>
SIPs assume a fixed date and a fixed salary. This user gets money in uneven chunks.
</context>

<task>
Implement splitIncome(amount, source, options) in src/lib/money.js and the
Money in screen that uses it.
</task>

<requirements>
Sources and kinds:
- stipend, salary, pocket → regular
- freelance → irregular
- gift → windfall

Split rules (in order):
1. grow share = growPct (clamped 0–90%). Windfall: max(growPct, 50%).
2. buffer share = 10% only for irregular income while bufferSaved < bufferGoal
   (default ₹10,000); never exceed the remaining gap.
3. grow is rounded DOWN to a multiple of ₹10. If grow < ₹10 and amount ≥ ₹20, grow = ₹10.
4. remainder → needs 70% / fun 30% (windfall: 40% / 60%).
5. Return { needs, fun, buffer, grow, kind, note } where note is one casual sentence
   explaining the split.

Screen:
- Source chips, large ₹ input, 4-colour split bar + legend, the note,
  fund picker for the grow part (no single stocks), buffer progress.
- Confirm creates a drop, adds the buffer and auto-buys the grow amount
  with reason "Auto-split from <source> money".
- Block confirm in practice mode if grow > practiceCash.
</requirements>

<constraints>
- needs + fun + buffer + grow must equal the input amount exactly (integer rupees).
- No negative values for any input, including 0, invalid, or huge growPct.
</constraints>

<examples>
splitIncome(10000, "stipend", { growPct: 20 }).grow            → 2000
splitIncome(5000, "gift", { growPct: 10 }).grow                → 2500
splitIncome(10000, "freelance", { bufferSaved: 9700 }).buffer  → 300
splitIncome(30, "pocket", { growPct: 5 }).grow                 → 10
</examples>
```

---

## 4. Vibe check (tip checker)

```xml
<context>
A user's first trade often comes from a reel or a Telegram message. We want to
show them, in a few seconds, why a tip looks dodgy.
</context>

<task>
Implement vibeCheck(text) in src/lib/vibeCheck.js and the Vibe check screen.
</task>

<requirements>
- Rule-based (regex + weights). Do NOT use an LLM: the output must be deterministic
  and testable.
- Red flags (weight): guaranteed/risk-free returns (35), huge return claims like
  10x / 300% / multibagger / 🚀 (25), insider or sure-shot talk (25),
  private Telegram/WhatsApp group (20), penny stock / upper circuit (20),
  F&O / intraday / BTST (20), urgency (15), pay-to-join (15), profit flexing (10).
- Green flags subtract: SEBI registration number (10), long-term framing (8),
  diversification (8), admits risk (6).
- score = clamp(sum(red) − sum(green), 0, 100).
- level: ≥ 50 → red, ≥ 20 → amber, else green. Input under 8 chars → empty.
- Every red flag carries a one-sentence, plain-English "why".
- Screen: textarea, "Check it", result card (level, score meter, verdict, flags),
  then 4 sample tips that run on tap. Result renders ABOVE the samples.
</requirements>

<constraints>
- The costly error is calling a scam "green". Prefer false amber over false green.
- Always show a disclaimer: this is a pattern check, not a guarantee.
</constraints>

<examples>
"XYZ to 10x, sure shot, join my Telegram VIP group" → red
"Small cap gem hit upper circuit 4 days in a row"   → amber
"Nifty 50 index fund SIP for 10 years"              → green
</examples>
```

---

## 5. Why I bought + cool-off

```xml
<context>
We don't want to block trades. We want to add just enough friction that impulsive
buys get a second thought, while index-fund buys stay smooth.
</context>

<task>
Implement tradeCheck({ amount, risk, reason, holdingsValue, monthlyIncome })
in src/lib/tradeCheck.js and the buy sheet on the Invest screen.
</task>

<requirements>
- reasonOk = reason length ≥ 15 AND does not start with a lazy phrase
  (fomo, idk, just, because, friend said, insta, reel, yolo, trust me, tip, …).
- Warnings:
  - concentration: holdingsValue > 0 AND buy > 25% of post-buy portfolio
  - income: amount > 50% of monthlyIncome
  - risk: instrument risk is "very high"
- coolOff seconds: high = 5, very high = 10, +5 if concentration or income warning.
- Return { coolOff, warnings[], reasonOk, concentrationPct }.
- Buy sheet: amount, "Why are you buying this?" field, warnings, button disabled
  until reasonOk. If coolOff > 0, first tap starts a countdown that shows the
  user's own reason back to them; button reads "Wait Ns…", then "Yep, buy it".
  Editing amount or reason resets the countdown.
- The reason is saved on the holding. Home lists holdings with their reason and
  asks "Still true?" → Still true / Changed my mind.
- Instrument cards use plain-English one-liners, not fund jargon.
</requirements>

<acceptance_criteria>
- A moderate-risk buy with a good reason has zero friction.
- A first-ever buy never triggers the concentration warning.
</acceptance_criteria>
```

---

## 6. Future you

```xml
<task>
Build a screen that shows what a spend could become if invested instead.
</task>

<requirements>
- Inputs: amount, frequency (once / weekly / monthly), target age slider
  (current age + 1 to 60).
- Presets: Late-night Swiggy ₹350 weekly, Concert ₹3,500 once,
  Unused OTT ₹650 monthly, Phone upgrade ₹25,000 once.
- Maths: once → lump-sum compounding; weekly/monthly → monthly SIP future value
  (weekly converted as amount × 52 / 12). Rate 12% p.a.
- Show the projected value (₹ L / ₹ Cr compact format) and total amount put in.
</requirements>

<constraints>
- Tone: no guilt. Explicitly say spending on things you love is fine.
- Always show the 12% assumption and that it is not guaranteed.
</constraints>
```

---

## 7. Evals

```xml
<task>
Write vitest evals under /evals that test the pure logic and reducer, not the UI.
</task>

<requirements>
- Vibe check: hand-labelled golden set of ≥ 15 tips across red/amber/green.
  Pass bar: ≥ 90% accuracy AND zero red-labelled tips classified green.
  Also: every flag has a "why" > 20 chars; empty/null input is safe; score in 0–100.
- Split: property-style sweep of every source × amounts
  [0, 15, 50, 99, 500, 1234, 8000, 15000, 42000, 150000] × growPct [5, 20, 50].
  Assert parts sum exactly, no negatives, grow % 10 === 0, note present.
  Plus the behaviour examples from prompt 3.
- Maths: ₹1,00,000 @ 12% × 10y = 3,10,585; ₹1,000/month SIP × 10y ≈ 2,32,339;
  Indian formatting ₹12,34,567 / ₹2.5 L / ₹1.25 Cr.
- Trade check: lazy reasons blocked, zero friction on normal buys, cool-off by risk,
  concentration + income warnings stack.
- Reducer flows: practice vs real cash, drop → buffer + auto-buy, review targets one holding.
</requirements>

<acceptance_criteria>
`npm test` passes. If a golden case fails, fix the rules, not the label,
unless the label is genuinely wrong (and say why).
</acceptance_criteria>
```

---

## Iteration log

| Run | Result | Change |
|---|---|---|
| 1 | 2 golden cases misclassified green ("upper circuit 4 days in a row", "intraday… made 20k today") | Penny and F&O weights raised 15 → 20; "profit flexing" rule added |
| 2 | 187 / 187 pass | n/a |
| UI review | Vibe check result rendered below the fold; the cool-off button still said "Buy" while counting down | Result moved above the samples; button now shows "Wait Ns…" |
