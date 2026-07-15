# BotMentor — Plain-Language Guide (for non-technical readers)

> This guide is for the program lead, a teacher, a volunteer coordinator, or anyone who
> will help keep BotMentor running **without needing to write code**. The technical details
> live in a separate folder (`../`) for developers. You do not need to read those.

## What BotMentor is (in one paragraph)
BotMentor is a free website where a student types what's wrong with their robot — for example,
"the left wheel won't turn" — and gets back a short, ranked list of likely causes plus safe
steps to try. It is built to act like a **mentor at a robotics expo**, not like a repair shop:
it helps the student *think through* the problem and do the hands-on testing themselves. It is
named after the Nebraska Robotics Expo, where college students volunteered to coach
middle- and high-school robotics teams.

**The screen makes the split obvious:** a panel at the top shows "🤖 Claude works out the
causes" vs "✋ You run the tests," with a progress bar of the hands-on steps the student
has ticked off. That is the whole point in one glance — the tool never touches the robot;
the student does, and the mentoring happens in that doing.

## Why it's built this way (the "4D" idea)
The tool follows a simple four-part coaching method. You'll see these words in the app:
- **Delegation** — the tool suggests the test; the *student* does it. The tool never claims
  to have touched the robot.
- **Description** — the tool asks the student to describe the problem clearly, because a good
  description leads to a good answer.
- **Discernment** — each suggestion says how confident it is and flags the *cheapest, safest
  check to try first*, so students don't waste time or take risks.
- **Diligence** — the tool includes safety reminders (for example, "have an adult present for
  battery work") and is honest when it isn't sure.

This is the same method a human mentor would use, which is the whole point.

## What it costs
- **Hosting:** free (on Vercel's free tier).
- **AI answers:** if the demo is set to give *real* AI answers, each conversation costs a
  fraction of a cent. Budget roughly **$5–10 per month**. If it's set to the built-in
  practice mode ("mock"), it costs **nothing**.

## Day-to-day: what you might actually do
Most days, nothing. The website runs on its own. Your occasional jobs:
1. **If answers stop appearing**, tell a volunteer (or follow "If something breaks" below).
2. **Once a year**, help confirm the AI key is still valid (a 10-minute task for a volunteer).
3. **Share the link** (https://botmentor.vercel.app) with teams and at events.

## If something breaks (plain steps)
- **The website won't open at all.** Tell the volunteer who set it up, or email the org's
  technical contact. This is rare.
- **The student gets an error after typing a problem.** Note the time and what they typed,
  and pass it to a volunteer. There is a written troubleshooting guide for them.
- **Answers look wrong or generic.** The AI key may have expired. A volunteer refreshes it
  (see the technical runbooks, R2). As a stopgap, the site can be switched to practice mode
  so it still works without a key.

You do **not** need to fix any of this yourself — you need to know *who* to tell and *what*
to write down. That's the handoff.

## How a non-coder can still help improve it
- **Add a coaching tip:** tell a volunteer a common robot problem you've seen; they can add it
  to the tool's knowledge.
- **Translate the interface** into another language for non-English clubs (the words are in
  one place).
- **Run a workshop:** use the tool in a session and teach students the 4D method — that *is*
  the "enable the organization" work the program cares about.
- **Give feedback:** tell a volunteer when an answer confused a student, so the tool improves.

## How this connects to the Claude Corps values
The Claude Corps program looks for people who can **teach mixed (technical + non-technical)
audiences** and **leave something that keeps running after they're gone**. BotMentor is built
for exactly that: this plain-language guide, the volunteer runbooks, and the coaching method
mean a non-profit can own and grow the tool without the original builder in the room.
