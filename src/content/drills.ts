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
];

export const getDailyDrill = (date = new Date()) => {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86_400_000);
  return drills[day % drills.length];
};
