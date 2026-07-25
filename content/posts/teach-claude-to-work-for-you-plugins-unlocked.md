---
title: "Teach Claude to Work For You: Plugins Unlocked"
date: 2026-07-26T00:00:00+05:30
lastmod: 2026-07-26T00:00:00+05:30
categories: ["AI/ML"]
tags: ["Claude", "Plugins", "Agents", "Automation", "Chennaipy"]
author: "Arockiaraj"
description: "Notes from my ChennaiPy talk on turning Claude Code into a reusable plugin instead of a one-off prompt"
draft: false
---

Yesterday I gave a full talk at the ChennaiPy meetup: **"Teach Claude to Work For You: Plugins Unlocked."** The room was full of Python folks, and the question I wanted to answer was simple: what changes when you stop *prompting* Claude and start *packaging* it?

A prompt is something you type once and throw away. A plugin is something your whole team can reuse, tomorrow, without you in the room. (There's a fuller [recap of the talk itself](/talks/chennaipy-claude-plugins/) if you want the stage-side version.)

## "Aren't AI Tools Expensive?"

I opened with a show of hands: who has seen a post recently claiming AI tools cost more than just hiring someone?

Lots of hands. And my honest answer is the opposite. They're cheaper, not slightly, significantly. Claude, Codex, Gemini, any of them will build you a working website in under 30 minutes and an app in a couple of hours.

Which raises the actual question. If the tools are that cheap, why do people keep feeling like they're expensive? That's where the rest of the talk went.

## The Cost Factor

The cost isn't the model. The cost is **rework**. If the first pass doesn't hold up, you pay twice: once to build it, once to fix it.

![Presenting the cost factor diagram at ChennaiPy: entry with no plan feeds a loop of wrong model, bad inputs, model doing script work, no verification, rework, and start from 0.5, exiting to multiple retry](/images/talks/chennaipy-claude-plugins/cost-factor.jpeg)

It's a loop, not a line. You *enter* with **no plan**, and that entry feeds six steps:

1. **Wrong model** for the job
2. **Bad inputs** fed into it
3. **Model doing script work** it should never own
4. **No verification** of what came back
5. **Rework**, because nothing checked it
6. **Start from 0.5** instead of 1, and go round again

The exit isn't success. The exit is *multiple retry*: you go round enough times that you give up on the approach entirely.

Here's the part that got the most nods: not one of those six is the model's fault. Every single one is a **setup problem**. And a plugin is where you fix setup, once, for everyone.

## The Five Building Blocks

A Claude Code plugin is one folder with five kinds of files. Each one answers a different part of that loop.

**Skills** (`skills/<name>/SKILL.md`) teach. They load on demand, so only the description, around 100 tokens, sits in context until Claude decides the skill is relevant. That progressive disclosure is how you ship twenty conventions for roughly 2k tokens instead of paying for twenty full prompts every single turn. If you keep pasting the same instructions, that's a skill.

**Commands** (`commands/*.md`) trigger. Same markdown shape as a skill, except *you* own the timing by typing `/name`. They take `$ARGUMENTS`, and you can route a cheap one to a smaller model to keep the cost down. `/commit`, `/deploy`, `/status`.

**Agents** (`agents/*.md`) delegate. Fresh context, restricted tools, and you can fan out three to five in parallel. Noisy work stays in the child window while the parent keeps a thin summary. One thing worth knowing: inside a plugin, `hooks`, `mcpServers`, and `permissionMode` are blocked on purpose. It's a security restriction, so a packaged agent can't escalate its own privileges.

**Hooks** (`hooks/hooks.json`) enforce. They fire on a lifecycle event, run *outside* the model, and cost zero tokens. Instructions get you maybe 80% compliance. A hook gets you 100%. The gotcha that bites people: **exit code 2 blocks** the tool call, exit 1 doesn't.

**Scripts** (`scripts/*.py`) compute. Zero model tokens and far more reliable than an LLM for anything deterministic: math, parsing, file and PDF generation. Always resolve paths through `${CLAUDE_PLUGIN_ROOT}` so the plugin works wherever it gets installed.

Skills teach, commands trigger, agents delegate, hooks enforce, scripts compute.

## Plugin Anatomy

Before the talk I built a real one: [web-quote](https://github.com/arockiaraj1994/web-quote), a plugin that collects client requirements, researches domain and design in parallel, and produces a PDF quote.

![Presenting the plugin anatomy slide at ChennaiPy, showing the web-quote folder structure with manifest, skills, commands, agents, hooks, and scripts](/images/talks/chennaipy-claude-plugins/plugin-anatomy.jpeg)

Every block shows up where you'd expect it: a `.claude-plugin/plugin.json` manifest, two skills (`client-intake`, `quote-standards`), one command (`/quote`), three agents (`competitor-scanner`, `domain-checker`, `theme-recommender`), a `hooks/hooks.json`, and nine plain Python scripts doing the deterministic work. Nothing is wired up by hand. Claude discovers all of it from those paths.

Running `/quote` is five beats: **ask** (the intake skill defines what to collect), **check** (`validate_input.py` halts on bad input), **research** (three agents in parallel), **price** (`quote-standards` plus `calculate_quote.py`), **ship** (render, verify, then `html_to_pdf.py` writes the PDF).

The hooks are my favorite part. A `SessionStart` hook runs a dependency check before anything happens, and a `PreToolUse` gate blocks the PDF step until verification passes. That's the whole thesis in miniature: the verification step runs whether or not I remembered to ask for it.

## One Plugin, Many Teams

These five pieces don't just belong to engineering. In the talk I walked through seven functions, Engineering, Product, Program/PM, QA, Ops/DevOps, SecOps, and Go-to-market, with concrete plugins for each: `pr-review-kit`, `spec-writer`, `standup-gen`, `regression-guard`, `deploy-checklist`, `secret-guard`, `launch-kit`.

The scaffolding doesn't change, only the content does. That's the real unlock: once one team builds a working plugin, every other team has a template instead of a blank page.

## This Isn't Experimental Anymore

Worth grounding: plugins hit public beta in October 2025. The format hardened through late 2025, and in May 2026 Anthropic launched an official managed directory of 55+ vetted plugins alongside a community marketplace of 70+ more, which crossed 20,000 GitHub stars in four days. Dynamic Workflows went GA in June 2026.

## Wrapping Up

This ties back to something I wrote about a few weeks ago: [the ecosystem around a model matters more than the model itself](/posts/why-chasing-the-latest-ai-model-misses-the-point/). A plugin is that ecosystem made concrete, packaged so it survives past the one conversation where you figured it out.

If you're still typing the same instructions into Claude every week, that's the sign it's time to turn it into a plugin instead.
