import { ArrowDown, ArrowRight, Check, ExternalLink, MessageCircleQuestion, Target } from 'lucide-react';

const salesSteps = [
  { number: '01', title: 'Open', action: 'Set the tone and a small agenda.', example: 'Thanks for meeting with me. / I’d like to understand your current process / then decide whether a next step makes sense.' },
  { number: '02', title: 'Discover', action: 'Find current state, desired state, and impact.', example: 'How do you handle this today? / What would better look like? / Why does that matter now?' },
  { number: '03', title: 'Confirm', action: 'Reflect the gap and get a yes—or a correction.', example: 'What I’m hearing is that the slow handoff is costing you two days. / Is that right?' },
  { number: '04', title: 'Connect', action: 'Link one capability to their stated result.', example: 'Based on what you told me / one shared review step would remove that second handoff.' },
  { number: '05', title: 'Advance', action: 'Agree on one action, owner, and date.', example: 'The next useful step is a technical review with Sara. / Would Tuesday work?' },
];

export function PlaybookScreen() {
  return (
    <main className="screen" id="main-content">
      <div className="page-heading playbook-heading"><div><span className="eyebrow">The compact playbook</span><h1>Clear speech.<br />Useful conversations.</h1><p>Your lesson priorities and a customer-first sales flow on one page.</p></div><div className="focus-badge"><Target /><span>Current focus</span><strong>Rhythm before speed</strong></div></div>

      <section className="priority-section">
        <div className="section-title"><span>01</span><div><h2>Practice in this order</h2><p>Do not polish low-impact details while a core contrast is still unclear.</p></div></div>
        <div className="priority-lanes">
          <article className="priority-lane core"><span>Core</span><h3>Clarity first</h3><ul><li><Check /> Sentence stress and rhythm</li><li><Check /> American R</li><li><Check /> CH / SH</li><li><Check /> Short I / E and vowel A</li></ul></article>
          <ArrowRight className="lane-arrow" />
          <article className="priority-lane next"><span>Next</span><h3>Shape the message</h3><ul><li><Check /> Thought groups and pauses</li><li><Check /> Intonation</li><li><Check /> TH and vowel U</li><li><Check /> Concise answers</li></ul></article>
          <ArrowRight className="lane-arrow" />
          <article className="priority-lane polish"><span>Polish</span><h3>Refine later</h3><ul><li><Check /> American flap T</li><li><Check /> Nasal resonance</li><li><Check /> Wider vocabulary</li><li><Check /> Faster delivery</li></ul></article>
        </div>
      </section>

      <section className="sales-section">
        <div className="section-title"><span>02</span><div><h2>The GAP conversation</h2><p>Make the call about them: ask, listen, reflect, then connect.</p></div></div>
        <div className="sales-flow">{salesSteps.map((item, index) => <div className="flow-wrap" key={item.title}><article className="sales-step">
          <span>{item.number}</span><h3>{item.title}</h3><p>{item.action}</p><blockquote>{item.example}</blockquote>
        </article>{index < salesSteps.length - 1 && <ArrowDown className="flow-arrow" />}</div>)}</div>
        <aside className="sales-reminder"><MessageCircleQuestion /><div><strong>The rule before every pitch</strong><p>Could you explain the customer’s problem, desired result, and reason to act—in their words? If not, ask one more question.</p></div></aside>
      </section>

      <section className="source-section">
        <div className="section-title"><span>03</span><div><h2>Keep learning</h2><p>A short source shelf. Your private lesson material shaped the priorities; these public references reinforce the methods.</p></div></div>
        <div className="source-grid">
          <a href="https://americanenglish.state.gov/files/ae/resource_files/etf_58_2_pg02-13.pdf" target="_blank" rel="noreferrer"><span>Pronunciation</span><strong>Thought groups, focus words, and rhythm</strong><small>U.S. Department of State · American English</small><ExternalLink /></a>
          <a href="https://www.toastmasters.org/magazine/magazine-issues/2019/july/silence-is-golden" target="_blank" rel="noreferrer"><span>Speaking</span><strong>Use pauses for clarity and emphasis</strong><small>Toastmasters International</small><ExternalLink /></a>
          <a href="https://trailhead.salesforce.com/content/learn/modules/relationship-selling/collaborate-with-the-customer" target="_blank" rel="noreferrer"><span>Sales</span><strong>Clarify, confirm, and hear the customer</strong><small>Salesforce Trailhead</small><ExternalLink /></a>
          <a href="https://trailhead.salesforce.com/content/learn/modules/customer-centric-conversations-strategies/communicate-successfully-with-executives" target="_blank" rel="noreferrer"><span>Listening</span><strong>Rephrase, mirror, and stay curious</strong><small>Salesforce Trailhead</small><ExternalLink /></a>
        </div>
      </section>
    </main>
  );
}
