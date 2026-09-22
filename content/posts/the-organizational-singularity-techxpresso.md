---
title: "The Organizational Singularity: Notes from TechXpresso"
date: 2026-09-23
categories: ["AI/ML"]
tags: ["Ai", "Agents", "Organization", "Conference", "Techxpresso"]
description: "Salim Ismail's talk at TechXpresso argued that AI breaks the economics that made companies necessary. Here is what he said and what I think holds up."
draft: false
---

Last week I sat in a ballroom at TechXpresso, the conference run by IDFC FIRST Bank's technology
hub, and watched a slide go up with three words at the top of it: Coase's Law Dead.

The speaker was Salim Ismail. He wrote *Exponential Organizations*, founded OpenExO, and was the
founding executive director of Singularity University. His talk was called The Organizational
Singularity. I have been thinking about it since, partly because I disagreed with less of it than
I expected to.

## Why Companies Exist At All

In 1937 Ronald Coase asked a question that sounds simple and is not. Why do firms exist? If markets
are so good at allocating work, why does anyone bother hiring people full time instead of buying
every task on the open market?

His answer was cost. Finding the right person, agreeing what the work is, negotiating a price,
checking that it got done, doing that again tomorrow. All of that is expensive. Past a certain
point it is cheaper to put people inside a building, give them titles, and coordinate them through
a hierarchy. That is the whole reason for the pyramid. CEO at the top, then the C-suite, then VPs
and directors, then managers, then everyone who actually does the work.

Salim's claim is that AI attacks exactly that cost, and that when the cost goes the structure
built to manage it has no reason to stay.

His slide made the point in two pictures. On the left, the traditional firm, with a dashed line
around it marked "firm boundary" and a caption underneath: high coordination cost, so firms exist.
On the right, no boundary at all. A ring of people and software agents around a single coordinating
point, with the caption: AI collapses costs, so firms dissolve. An arrow between the two, labelled
AI collapse.

There was a phrase in the corner of that slide that got four words and no explanation, and I think
it was the most interesting thing on the screen. **The firm as a protocol.** Not a place you join.
A set of rules for putting capability together when you need it, and taking it apart when you do
not.

The numbers he put up were the kind that make a room go quiet. From my notes, a company in the
near future doing roughly ten times the output of a 2024 company with about a tenth of the people,
and a ratio of something like one manager to twenty individual contributors. I did not get a clean
photograph of that slide, so treat the exact figures as my recollection rather than a quote. The
shape of the claim is what matters, and the shape is that most of the middle of the org chart is
assumed to be gone.

## The Part I Keep Coming Back To

I build with agents most days. So the slide that held my attention was not the org chart, it was
the architecture behind it.

He called it the Intelligence Stack, and described it as Boyd's OODA loop turned into enterprise
architecture that runs continuously at machine speed. Six layers:

1. **Purpose**, the constraints the whole thing operates under
2. **Sense**, taking in signals
3. **Interpret**, building context from them
4. **Decide**, generating options
5. **Orchestrate**, actually executing
6. **Learn**, feeding results back

Then, down the side of all six, a single column labelled Govern and Assure. Its job, in his words:
monitors every layer in real time, logs every decision, enforces guardrails, triggers escalations,
owns the kill switches.

I want to sit on that for a second, because the drawing is making an argument. Govern and Assure is
not a step in the loop. It is not a review stage you pass through on the way to production. It runs
alongside every layer at once, which is the only way it works.

Almost everything I see built with agents today is the Orchestrate layer and nothing else. Purpose
is a system prompt somebody wrote in an afternoon. Learn is a human editing that prompt by hand
when something goes wrong. Sense and Interpret are whatever got pasted into the context window.
And Govern is usually missing entirely, because logs, evaluations, rollback and a queue where a
human reviews the uncertain cases are not the parts you demo.

That gap is the difference between something impressive and something you would let run against a
real book of business. I have written before about
[the ecosystem around a model mattering more than the model itself](/posts/why-chasing-the-latest-ai-model-misses-the-point/),
and this is the same thought at company scale. The model is not the hard part. The scaffolding
around it is.

## Human Above the Loop

The bottom half of his first slide was a migration plan, and I noticed that almost nobody was
photographing it. Three steps. Build an AI native twin of your operation at the edge. Move
workflows across to it, written down and specified rather than carried in people's heads. And
then, the line I wrote down twice:

**Human above the loop.** Dashboard monitoring, problem solving, exception handling.

Not human in the loop. Above it. In the loop means a person is a step inside the process, clicking
approve, and the process waits for them. Above it means the process runs without you and your job
is to watch it, notice when it goes wrong, and deal with the things it was never designed to
handle.

Read the three duties he listed and notice what is not there. Nothing routine. Nothing that can be
written down as a procedure, because anything that can be written down as a procedure has already
been moved. What is left for people is the work that does not fit the workflow.

## Why Companies Say No

The slide that got the biggest laugh was a wall of text. Fifty objections, in three columns, under
a title that was doing more work than the list: Typical Immune System Responses.

We have never done it before. We tried it before. It will not work in our company. We have been
doing it this way for years. The boss will never buy it. It is not my job. Sales says it cannot be
done. We do not have the time. It needs committee study. It needs sleeping on.

Every one of them is familiar, and I have said at least three.

The framing is the useful part. An immune response is not stupidity and it is not sabotage. It is
a working system rejecting foreign material, which is exactly what it is supposed to do. That
explains something that otherwise looks like a puzzle, which is why these objections come from
capable, well meaning people, and why arguing with them one at a time never gets you anywhere. You
do not talk an immune system out of a response.

Put that slide next to the migration plan and the two of them turn into a single argument. If the
organisation rejects transplants, do not transplant. Build the new thing beside the old one, move
one workflow at a time, and let the results do the arguing. That is a much less dramatic strategy
than the rest of the talk, and I suspect it is the part that actually works.

## The Question To Keep Asking

There was one question in the talk that he suggested running permanently in the background, not as
an exercise but as a standing check.

> Could a three person team with agents rebuild our highest margin business in ninety days?

If the answer is no, you have some time. If the answer is yes, then the only question left is
whether the three people doing it work for you or for somebody else.

## Six Mindsets, and My Own Reading of Them

He closed with a slide listing six mindsets for what he called the exponential road ahead.
Curiosity, abundance, exponential, moonshot, longevity, gratitude. Six words, no explanation on
the slide.

So what follows is mine, not his. He named them and moved on, and I have been turning them over
since.

**Curiosity.** Children ask why all day. Somewhere in a career we stop, because in a room full of
colleagues, not knowing starts to look like a weakness.

**Abundance.** We hold on to what we know because we are afraid that sharing it makes us
replaceable. It usually does the opposite. The fear is still real, and it does not go away just
because somebody points out it is irrational.

**Exponential.** We plan in straight lines. Next year is this year plus a bit. Very little about
the last three years has behaved that way, and I have been wrong about the timing in both
directions.

**Moonshot.** Aim for ten percent better and you will tweak what is already there. Aim for ten
times and you are forced to put it down and start from the problem again. Same effort, completely
different question.

**Longevity.** The tools change every few months. Most of what I learned carefully two years ago
is half obsolete now. The thing worth keeping is not any one tool, it is staying good at picking up
the next one.

**Gratitude.** This one looks out of place on a technology slide, which is probably why it is the
one worth keeping. When everything moves this quickly it gets easy to forget the people and the
older work that got you here.

None of those are techniques. They are what is left over when the tools stop being the hard part.

## Wrapping Up

The honest summary is that I walked in expecting a talk about AI and got a talk about org charts.

I am not convinced the firm dissolves. Coase's argument was never only about coordination cost.
Firms also exist to hold risk, to be accountable to a regulator, to be something a customer can
sue, and none of that gets cheaper because your agents got better. In a bank in particular, the
boundary is doing legal work, not just economic work.

But the weaker version of his claim does not need any of that to be true. If coordination inside a
company gets much cheaper, then the number of people you need to coordinate it drops, and the
layer whose whole job is coordination gets thin. That does not require the firm to dissolve. It
only requires it to need fewer managers, and that part is already happening.

The interesting conversation right now is not about which model is ahead this month. It is about
what shape an organisation needs to be when coordination stops being expensive.
