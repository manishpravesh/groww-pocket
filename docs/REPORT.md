# Groww Pocket: Groww for the GenZ investor

## My take on the problem

Honestly, I don't think access is the problem anymore. Groww already lets us open an account in minutes and start a SIP with ₹100. So making the app "cooler" for 22 year olds with emojis and dark mode isn't really solving anything.

When I looked at how people my age actually deal with money, three things stood out.

First, our income is lumpy. A stipend one month, a freelance payment the next, ₹5,000 from a relative at Diwali. SIPs assume we get paid on the 1st and can commit a fixed amount forever. That just doesn't match how a student or intern earns.

Second, our first "advice" usually comes from a reel or a Telegram group. "10x by March, sure-shot, join my VIP group." Nobody teaches us to spot that stuff, so a lot of first trades are tips.

Third, one bad first loss can scare us off investing for years. If our first move is a penny stock or an options trade and we lose half of it, we're not coming back to try an index fund.

So the question I tried to answer was: how does Groww help us build a sane investing habit around irregular money, while protecting us from the stuff that burns beginners?

## What's in scope

- First-time investors aged 20 to 26, with small and irregular amounts
- A mobile prototype with four core features plus a practice mode
- Behaviour design: when to nudge, when to slow someone down
- Mock data for everything



## What's out of scope

- KYC, payments, live prices and actually placing orders
- F&O, crypto and advanced charts. I left these out on purpose, since this is the group most likely to get hurt by them
- An AI chatbot. I wanted the tip checker to be predictable and testable, and a chatbot that "explains" a stock tip could easily make it sound legit
- Social features like leaderboards or copy-trading. They're fun, but they also turn into a finfluencer playground pretty fast



## My solution and why

**Money in.** Instead of a fixed SIP date, we log money whenever it lands and pick where it came from. The app splits it into needs, fun, buffer and grow. Gig money also tops up a small buffer for the dry months. Gift money sends at least half to grow, since we weren't counting on it anyway. I think this beats "start a ₹100 SIP" because it fits how we earn instead of asking us to fake a salary.

**Vibe check.** We paste a tip and it shows a sus score with a plain-English reason for each red flag: guaranteed returns, crazy numbers, urgency, Telegram groups, insider talk, F&O hype. It's rule-based, not AI, so the same tip always gets the same answer and I could test it against tips I'd labelled myself.

**Why I bought, plus a cool-off.** Before any buy we write one line on why. "fomo" doesn't count. Risky buys get a short 5 to 15 second pause that shows our own reason back to us. Index fund buys get zero friction. Later, Home asks if our reason is still true. The idea is to slow down impulse trades without being preachy or blocking anything.

**Future you.** It shows what a weekly Swiggy order or an unused OTT subscription could become if invested, without guilt-tripping. Spending on stuff we love is fine. It's just about seeing the trade-off.

**Practice mode.** We get ₹1,00,000 of fake money so our first mistakes are free.

If this shipped, I'd judge it on three things: how many new users make a first investment within a week, what share of those first investments go into diversified funds rather than single stocks or F&O, and whether people who use practice mode first stick around longer.

## Assumptions

- All data is mock. The 12% yearly return used in projections is a rough long-term guess, not a promise
- The ₹10,000 buffer goal, the split percentages and the cool-off lengths are my guesses. They'd need real user testing
- I assumed most users in this group have more than one income source

