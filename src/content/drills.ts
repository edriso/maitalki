import type { DailyDrill } from './types';

export const drills: DailyDrill[] = [
  {
    id: 'pitch-a-tool', title: 'Pitch a tool you trust', focus: 'Customer-first value + thought groups', category: 'Sales', minutes: 8,
    warmup: ['Based on what you TOLD me / speed is the PRIORITY.', 'It saves TIME ↗ / reduces RISK ↗ / and keeps work MOVING ↘.'],
    prompt: 'A freelance developer loses time writing project updates. Recommend one tool or workflow you genuinely use.',
    outline: ['Their current friction', 'One relevant capability', 'The practical result for them'],
    model: 'Based on what you told me / the main issue is the time you lose writing updates. / A reusable project template would give you one clear place for decisions / so you can update clients in minutes instead of rebuilding the message each time.',
    checklist: ['I used their problem—not a feature list', 'I paused between ideas', 'I stressed the result', 'I ended without overselling'],
  },
  {
    id: 'answer-concisely', title: 'Answer without a tangent', focus: 'Answer → reason → example', category: 'Speaking', minutes: 7,
    warmup: ['My short ANSWER is YES.', 'The main REASON is CONSISTENCY.'],
    prompt: 'What is the best way to learn a difficult new skill?',
    outline: ['Your answer in one sentence', 'The strongest reason', 'One real example from your life'],
    model: 'I’d say the best method is short, deliberate practice. / It is easier to repeat consistently / and when I practiced one speaking skill for ten minutes, I noticed more than when I studied several topics at once.',
    checklist: ['My answer came first', 'I kept only one reason', 'My example was specific', 'I stayed under 60 seconds'],
  },
  {
    id: 'discover-the-gap', title: 'Run a discovery minute', focus: 'Ask, listen, confirm', category: 'Sales', minutes: 8,
    warmup: ['How are you HANDLING this TODAY?', 'What would a better OUTCOME look like?'],
    prompt: 'A small agency says, “Our projects keep running late.” Ask three questions before offering any solution.',
    outline: ['Current process question', 'Desired outcome question', 'Business impact question'],
    model: 'How are projects planned today? / What would an on-time process look like for your team? / When a delivery slips, what is the biggest effect on the client or the business?',
    checklist: ['My questions were open', 'I did not pitch early', 'Each question had one purpose', 'I summarized the likely gap'],
  },
  {
    id: 'handle-price', title: 'Handle “too expensive”', focus: 'Acknowledge + clarify', category: 'Sales', minutes: 8,
    warmup: ['I HEAR what you’re SAYING.', 'When you say EXPENSIVE / what are you comparing it WITH?'],
    prompt: 'A prospect says your proposal is too expensive. Respond without discounting or defending immediately.',
    outline: ['Acknowledge calmly', 'Clarify what “expensive” means', 'Connect the answer to their priority'],
    model: 'I hear you. / When you say the proposal is too expensive / is the concern the upfront budget or whether the return is clear? / Based on what you told me, the main value is avoiding two weeks of rework, so let’s check whether that outcome justifies the cost.',
    checklist: ['I sounded curious, not defensive', 'I asked before answering', 'I used their stated priority', 'I checked rather than pressured'],
  },
  {
    id: 'rhythm-report', title: 'Make a work update land', focus: 'Stress + reductions + pauses', category: 'Rhythm', minutes: 7,
    warmup: ['I NEED tə FINISH the REPORT before FRIDAY.', 'We could əv SHIPPED it EARLIER.'],
    prompt: 'Give a brief update: what you finished, what is blocked, and what happens next.',
    outline: ['Completed work', 'Current blocker', 'Next action and time'],
    model: 'I FINISHED the checkout update this MORNING. / I’m waiting for the final API KEY. / Once I have it / I can SHIP the build by FRIDAY.',
    checklist: ['I stressed content words', 'I reduced small words', 'I used three thought groups', 'My final word landed'],
  },
  {
    id: 'egypt-invite', title: 'Invite someone to Egypt', focus: 'Three benefits + list intonation', category: 'Speaking', minutes: 8,
    warmup: ['the HISTORY ↗ / the FOOD ↗ / and the PEOPLE ↘', 'You can EXPLORE / EAT / and RELAX.'],
    prompt: 'Convince a curious friend to visit Egypt without using “really,” “very,” or “a lot.”',
    outline: ['A vivid place', 'A specific experience', 'Who this trip suits'],
    model: 'You should visit Egypt for the contrast. / You can walk through thousands of years of history in Giza / try fresh seafood by the Mediterranean / and end the trip somewhere quiet on the Red Sea.',
    checklist: ['I chose three concrete images', 'My list rose, rose, then fell', 'I spoke to “you”', 'I avoided vague intensifiers'],
  },
  {
    id: 'sound-contrast', title: 'Sharpen the contrasts', focus: 'Short I/E + CH/SH', category: 'Sounds', minutes: 6,
    warmup: ['sit / set · fill / fell · disk / desk', 'chip / ship · chair / share · which / wish'],
    prompt: 'Read the model slowly, then naturally. Keep each target word distinct.',
    outline: ['Five minimal-pair rounds', 'Slow sentence', 'Natural sentence'],
    model: 'Please sit at the desk / and check which shipping list we should send.',
    checklist: ['My I and E were different', 'CH had a brief stop', 'SH had continuous air', 'The natural version stayed clear'],
  },
  {
    id: 'respectful-close', title: 'Close the call cleanly', focus: 'Recap + next step + date', category: 'Sales', minutes: 7,
    warmup: ['I want to reSPECT your TIME.', 'The next STEP is a technical reVIEW.'],
    prompt: 'End a discovery call after the prospect agrees that slow reporting is the main problem.',
    outline: ['Recap the agreed problem', 'Propose one small action', 'Confirm owner and date'],
    model: 'I want to respect your time. / We agreed that slow reporting is delaying client decisions. / The next useful step is a 20-minute workflow review with your project lead. / Would Tuesday afternoon work?',
    checklist: ['My recap was accurate', 'I proposed only one action', 'The owner was clear', 'I asked for a date'],
  },
  {
    id: 'remote-standup', title: 'Give a clear stand-up', focus: 'American R in work words', category: 'Sounds', minutes: 6,
    warmup: ['EARly / EARlier / the EARlier REPORT', 'The reMOTE team is READY for the reLEASE.'],
    prompt: 'Give a 30-second update to a remote team: what you reviewed, what is ready, and what you need.',
    outline: ['What you reviewed earlier', 'What is ready now', 'One clear request'],
    model: 'Earlier this morning / I reviewed the report for the remote team. / The error rate is lower / and the release is ready. / I just need one more review from our developer.',
    checklist: ['My tongue stayed back on every R', 'I did not rush “earlier” or “error”', 'I used clear thought groups', 'My request was specific'],
  },
  {
    id: 'correct-a-detail', title: 'Correct a detail politely', focus: 'Stress the correction', category: 'Rhythm', minutes: 6,
    warmup: ['The meeting is on TUESDAY / not THURSDAY.', 'I sent the FINAL file / not the DRAFT.'],
    prompt: 'A client confirms the wrong launch date and the wrong budget scope. Correct both details without sounding defensive.',
    outline: ['Thank them for confirming', 'Correct the first detail', 'Correct the second, then check'],
    model: 'Thanks for confirming. / Just one small correction: / the launch is on the FIFTEENTH / not the fifth. / And the budget we agreed covers the FIRST phase / not the whole project. / Does that match your notes?',
    checklist: ['I stressed only the corrected words', 'I sounded helpful, not defensive', 'Each correction was one sentence', 'I ended with a check'],
  },
  {
    id: 'pause-not-fill', title: 'Pause instead of filling', focus: 'Deliberate pauses, no fillers', category: 'Speaking', minutes: 7,
    warmup: ['Give me a MOMENT / to think about THAT.', 'That’s a good QUESTION. / Here’s how I SEE it.'],
    prompt: 'In an interview you are asked, “What is your biggest weakness?” Answer honestly in under 45 seconds.',
    outline: ['One real weakness', 'What you do about it now', 'A recent sign of progress'],
    model: 'That’s a good question. / I used to say yes to too many tasks at once. / Now I plan my week every Monday / and agree on priorities before I commit. / Last month that helped me deliver two projects on time / without working late.',
    checklist: ['I paused instead of saying “um”', 'I avoided “like” and “really”', 'I named only one weakness', 'My example was concrete'],
  },
  {
    id: 'confirm-the-need', title: 'Rewind and confirm', focus: 'Summarize, then check', category: 'Sales', minutes: 7,
    warmup: ['What I’m HEARING is / SPEED matters MORE than COST.', 'Have I underSTOOD that CORRECTLY?'],
    prompt: 'A prospect says their team copies data between two tools for hours before every client report. Summarize their need and check it.',
    outline: ['Their current problem', 'The outcome they want', 'A confirming question'],
    model: 'What I’m hearing is / your team loses several hours / copying data between two tools before each report. / What you want is one reliable source / so reports are ready without the manual step. / Is that right?',
    checklist: ['I used their words, not mine', 'I named the problem and the outcome', 'I did not pitch yet', 'I ended with a real question'],
  },
];

export const getDailyDrill = (date = new Date()) => {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86_400_000);
  return drills[day % drills.length];
};
