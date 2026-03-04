---
title: Intro to Graceful Degradation
description: A training on designing resilient systems that fail gracefully
duration: 20
author: Xander Peterson
tags: [resilience, training, graceful-degradation]
---

# How to Use This Training

## Navigation

This training is divided into sections. Navigate through each part sequentially.

## Questions & Answers

Throughout this training, you'll see question prompts. Write your answer in the text box below each question. Suggested answers are provided afterward so you can check your understanding.

Give it a try!

<FreeResponse id="example-q" label="How do you check your understanding after answering a question?" placeholder="Try writing an answer here..." />

> **Suggested Answer:** Read the suggested answer below each prompt and compare it with your own thinking.

## We Learn from Your Answers Too

Your answers are visible to the training team. This helps us:

- Understand how you're thinking about the material
- Improve future trainings based on real learner input
- Celebrate smart thinking and spot areas where more clarity may be helpful

We're not grading you — just listening. So please make the effort to think critically and write something meaningful in each box.

## Terminology

Encounter an acronym or a term you're unfamiliar with? Look it up in the Terminology section!

## How to Complete the Training

You'll need to **enter a code** into Docebo to complete the training. You'll **receive this code after submitting feedback** at the end.

---

# 1) Intro to Graceful Degradation

## *"Why does our app need to degrade gracefully?"*

You're a Staff Software Engineer starting a new Tour of Duty on the BaseThreads team — Coinbase's much-hyped onchain storefront for crypto-native clothing and limited merch drops. Your timing couldn't be better (or worse?) — you've joined just after the infamous "Diamond Hands Denim Drop Debacle."

During a major Friday release, the store saw a 10x spike in traffic. Halfway through the launch, the onchain-powered recommendation engine failed. And yet — astonishingly — the app didn't crash.

Users could still browse, add to cart, and check out. The product detail pages simply omitted the "You may also like" section. Most customers didn't even notice.

Afterward, your manager pulls you into the postmortem. "This is exactly what we mean by *graceful degradation*," she says. "We didn't need to recover instantly. We just needed to make sure the failure didn't take down everything else."

<FreeResponse id="q1-what-is-gd" label="What do you think 'graceful degradation' is? (Hint: It's in the name!)" placeholder="Write your definition here..." />

> **Suggested Answer:** *Graceful degradation is a design principle where a system continues to operate with reduced functionality instead of failing completely when parts of it break.*

<FreeResponse id="q2-why-important" label="Why would it be important for system reliability?" placeholder="Explain why graceful degradation matters..." />

> **Suggested Answer:** *It helps ensure users can still complete core tasks even when non-essential services fail, improving reliability and trust.*

---

The Diamond Hands Denim incident wasn't a fluke — it was a product of good engineering. But graceful degradation is just one tool in your resilience toolkit. Sometimes, you want failures to be invisible to users (think failover, retries, or redundancy). Other times, you can't hide the failure — but you can soften the impact.

Understanding [when to use fault tolerance vs graceful degradation](https://docs.google.com/document/d/15PmnfAit4QizKZSs-LIGmaJx-zSQ4Rdn7zvMbIOFqqw/edit?tab=t.fdo6du63zqxs) and [why it matters](https://docs.google.com/document/d/15PmnfAit4QizKZSs-LIGmaJx-zSQ4Rdn7zvMbIOFqqw/edit?tab=t.hj3fim742fq#heading=h.29yuoqmd28pn) is key to designing resilient systems.

<FreeResponse id="q3-both-ft-gd" label="Should a system have both fault tolerance and graceful degradation? When do you implement one versus the other?" placeholder="Share your reasoning..." />

> **Suggested Answer:** *Yes. Use fault tolerance to maintain seamless service when failures are hidden (e.g., failover), and graceful degradation when you can't hide the failure but can still offer something useful (e.g., static content or cached results).*

---

Not every system gets it right. Often, the difference between a minor annoyance and a major outage is whether the team planned for failure — or just hoped it wouldn't happen.

Let's think through what happens when graceful degradation is *missing entirely.*

<FreeResponse id="q4-reflect-missing-gd" label="Reflect on a situation (real or hypothetical) where lack of graceful degradation led to a negative outcome. What was the impact and how could it have been avoided?" placeholder="Describe a scenario..." />

> **Suggested Answer:** *A video platform's homepage once failed to load because the recommendation API was down. If the page had a fallback layout or cached videos, users could have still browsed content.*

---

Designing for graceful degradation isn't just about theory — it happens at every layer of the stack. From hiding broken UI components, to serving cached data, to auto-scaling under pressure, resilience requires coordination.

Let's break it down by layer.

<FreeResponse id="q5-strategies-by-layer" label="Identify one frontend, one backend, and one infrastructure-level strategy for graceful degradation. How do they work together to support resilience?" placeholder="One strategy per layer..." />

> **Suggested Answer:** *Frontend: Hide failing components. Backend: Serve cached data when real-time sources fail. Infra: Use auto-scaling to handle load spikes. Together, they ensure minimal disruption during incidents.*

---

# 2) Designing for Resilience

## *"If a service fails, what should happen next?"*

You're now embedded on the BaseThreads Checkout team. Your first assignment: help stabilize payment processing ahead of the "Proof-of-Stake Sneakers" drop — a collab with a famous crypto influencer. Hype is high, gas fees are low, and execs are nervously watching the countdown clock.

You jump into the code for the `onchain-payment-service`, which interacts with a third-party fiat bridge to handle credit card transactions. Almost immediately, you notice a red flag: the retry logic for the bridge is aggressive — it fires retries immediately after failure, no delay, no mercy.

Your teammate sighs. "Yeah... that's caused some pain. One timeout turns into twenty. It's a classic retry storm."  

You use what you know about [retry and fallback mechanisms](https://docs.google.com/document/d/15PmnfAit4QizKZSs-LIGmaJx-zSQ4Rdn7zvMbIOFqqw/edit?tab=t.t9gkkjwtnx9t) and rewrite the logic to implement exponential backoff:

```
Attempt 1 → Wait 100ms
Attempt 2 → Wait 200ms
Attempt 3 → Wait 400ms
Attempt 4 → Wait 800ms
```

<FreeResponse id="q6-exponential-backoff" label="Describe how exponential backoff works and why it helps prevent cascading failures. What kind of problem does it solve, and where would you use it?" placeholder="Explain the mechanism and a use case..." />

> **Suggested Answer:** *Exponential backoff increases the delay between retries to give failing services time to recover. I've used it in a wallet transaction queue when RPC nodes were overloaded.*

---

Next, you propose adding a **circuit breaker**. "We need a way to stop retrying altogether when things are clearly busted," you say. Your tech lead nods. "Yup — give it a failure threshold and a cooldown window."

You set the circuit breaker to open after 4 failures in a row and to remain open for 10 seconds before trying a single "canary" request.

<FreeResponse id="q7-circuit-breaker" label="Describe how a circuit breaker works. In your own words, explain when you'd want a circuit breaker to trip and what behavior you'd expect during the cooldown window." placeholder="Explain the circuit breaker pattern..." />

> **Suggested Answer:** *A circuit breaker stops requests after repeated failures. During the cooldown, requests fail fast or fall back. After the timeout, one request tests recovery before fully resuming.*

---

You then turn your attention to caching. "We could fall back to cached payment methods if the bridge is flaky," you offer. Your SRE teammate raises an eyebrow. "Only if you handle staleness. We don't want to offer someone an expired card or a maxed-out wallet."

<FreeResponse id="q8-caching-strategy" label="Choose a caching strategy you've used or read about. What are the risks of stale data, and how would you mitigate them in a degraded state?" placeholder="Describe a caching approach and its tradeoffs..." />

> **Suggested Answer:** *I'd use time-based invalidation (e.g., TTL of 5 minutes). I'd also add freshness metadata to show when data was last updated, so we can inform the user or avoid fallbacks if it's too old.*

---

Finally, the PM poses a bigger design question: "If the fiat bridge goes fully offline during the drop... should we still let users complete checkout with crypto-only items?"

You pause. "That's a fail-open question. Depends what the product and legal teams want."

You lead a quick design discussion with stakeholders and sketch out tradeoffs of [fail-open vs fail-closed strategies](https://docs.google.com/document/d/15PmnfAit4QizKZSs-LIGmaJx-zSQ4Rdn7zvMbIOFqqw/edit?tab=t.2coi3heo8sp7).

<FreeResponse id="q9-fail-open-closed" label="Describe a case where failing open is appropriate and one where failing closed is necessary. Explain your reasoning based on system goals, user experience, and security implications." placeholder="Compare fail-open vs fail-closed..." />

> **Suggested Answer:** *Fail open if the failure affects a non-critical feature like live merch counters. Fail closed for payment processing or identity verification — those need to be secure and auditable.*

---

# 3) Protecting the User Experience

## *"Even if it breaks, users should still trust and use the app."*

You're jumping into a new UI reliability effort for BaseThreads's mobile dashboard — just in time for a high-traffic weekend featuring the "Gas-Free Friday" promo. The dashboard includes a real-time crypto price widget that fetches asset prices from an onchain oracle.

Hours before the event goes live, users begin reporting full-screen crashes. You open the app and simulate a disconnected oracle feed. Sure enough — one failed component tanks the entire view.

You wrap the component in an error boundary and re-test. Now, the app loads normally, and the widget space shows a fallback message instead: *"Price data is temporarily unavailable."* Success. But you're not done yet.

<FreeResponse id="q10-prevent-full-page-failure" label="Describe how you would prevent a full-page failure when a single UI component (e.g. a chat widget or price widget) experiences an error." placeholder="How would you isolate the failure?" />

> **Suggested Answer:** *I would isolate the component using an error boundary or try/catch block so it can fail independently. This way, the rest of the app continues functioning even if that one component has issues.*

---

You review the error copy and notice it's still set to the default placeholder: "Something went wrong. Error code 0xREKT0001." Not exactly helpful.

You rewrite it to say: *"Live asset prices are currently unavailable. We'll refresh automatically when service resumes."* This version is clear, actionable, and reassuring — [exactly what users need](https://docs.google.com/document/d/15PmnfAit4QizKZSs-LIGmaJx-zSQ4Rdn7zvMbIOFqqw/edit?tab=t.6bgn1giasqjd).

<FreeResponse id="q11-error-messages" label="What makes an error message trustworthy and useful? Share a time you saw one that worked well — or didn't." placeholder="What makes a good error message?" />

> **Suggested Answer:** *Good messages are simple, clear, and tell the user what's happening and what to do next. A bad one I saw said "Null pointer exception — contact admin." A better one would've offered a retry or fallback.*
