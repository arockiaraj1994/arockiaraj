---
title: "Full Talk at Chennaipy - Teach Claude to Work For You: Plugins Unlocked"
date: 2026-07-25T15:00:00+05:30
draft: false
author: "Arockiaraj"
description: "A recap of my full talk at the Chennaipy July 2026 meetup, on packaging Claude Code as a reusable plugin, skills, commands, agents, hooks, and scripts, instead of one-off prompts."
tags: ["python", "chennaipy", "claude", "plugins", "agents", "automation", "talk"]
categories: ["Talks"]
featuredImage: "/images/talks/chennaipy-claude-plugins/cost-factor.jpeg"
---

A prompt is something you type once and throw away. A plugin is something your whole team can reuse, tomorrow, without you in the room. That was the question behind my July 2026 Chennaipy talk: what changes when you stop prompting Claude and start packaging it?

<!--more-->

## The Question I Opened With

I started by asking the room for a show of hands: how many of you have seen a post recently claiming AI tools cost more than just hiring someone?

Plenty of hands went up. My honest answer is that they are cheaper. Not slightly, significantly. Claude, Codex, Gemini, any of them will build you a working website in under 30 minutes and an app in a couple of hours. I showed one live to make the point stick.

So if the tools are that cheap, where does the money actually go? That is the real talk.

## The Problem I Presented

The cost is not the model. The cost is rework. If the first pass does not hold up, you pay twice, once to build it and once to fix it.

I put a diagram on screen I call "the cost factor". You enter with **no plan**, and that entry point feeds a six-step loop: you pick the **wrong model**, feed it **bad inputs**, let it do **script work** it should never own, skip **verification**, so you **rework** what came back, and **start from 0.5** instead of 1. Then you go round again. Stay in that loop long enough and you exit the whole approach entirely, worn down by multiple retry.

The line that landed: none of those six are the model's fault. Every one of them is a setup problem.

<div style="margin: 32px 0; text-align: center;">
  <img src="/images/talks/chennaipy-claude-plugins/cost-factor.jpeg" alt="Presenting the cost factor diagram at Chennaipy: entry with no plan feeds a loop of wrong model, bad inputs, model doing script work, no verification, rework, and start from 0.5, exiting to multiple retry" style="max-width: 100%; height: auto; border-radius: 10px; border: 2px solid #c8c8c8; box-shadow: 0 8px 32px rgba(0,0,0,0.18);" loading="lazy" decoding="async" />
  <p style="font-size: 0.85em; color: #888; margin-top: 10px;">Walking the room through the Cost Factor loop: what an unplanned run really costs</p>
</div>

## The Five Building Blocks

The fix is a Claude Code plugin: one folder that answers all six failure points up front. I spent the middle of the talk on the five kinds of files that go in it, one slide each.

- **Skills** (`skills/<name>/SKILL.md`) teach. They load on demand, so only the description, roughly 100 tokens, sits in context until Claude decides the skill is relevant. That progressive disclosure is how you ship twenty conventions for about 2k tokens instead of twenty full prompts every turn.
- **Commands** (`commands/*.md`) trigger. Same markdown shape as a skill, except you own the timing by typing `/name`. They take `$ARGUMENTS`, and you can route a cheap one to a smaller model to keep it cheap.
- **Agents** (`agents/*.md`) delegate. Fresh context, restricted tools, and you can run three to five in parallel. Noisy work stays in the child window and the parent keeps a thin summary. Inside a plugin, `hooks`, `mcpServers`, and `permissionMode` are blocked on purpose, a security restriction so a packaged agent cannot escalate privileges.
- **Hooks** (`hooks/hooks.json`) enforce. They fire on a lifecycle event, run outside the model, and cost zero tokens. Instructions get you roughly 80 percent compliance, a hook gets you 100. The gotcha worth remembering: exit code 2 blocks the tool call, exit 1 does not.
- **Scripts** (`scripts/*.py`) do the work. Zero model tokens and more reliable than an LLM for anything deterministic: calculations, parsing, file and PDF generation. Always resolve paths through `${CLAUDE_PLUGIN_ROOT}` so the plugin works wherever it is installed.

Skills teach, commands trigger, agents delegate, hooks enforce, scripts compute. None of these pieces are exotic on their own. What matters is that they are bundled, versioned, and shipped together, so the plugin behaves the same way for every teammate who installs it.

<div style="margin: 32px 0; text-align: center;">
  <img src="/images/talks/chennaipy-claude-plugins/plugin-anatomy.jpeg" alt="Presenting the plugin anatomy slide at Chennaipy, showing the web-quote folder structure with manifest, skills, commands, agents, hooks, and scripts" style="max-width: 100%; height: auto; border-radius: 10px; border: 2px solid #c8c8c8; box-shadow: 0 8px 32px rgba(0,0,0,0.18);" loading="lazy" decoding="async" />
  <p style="font-size: 0.85em; color: #888; margin-top: 10px;">Plugin anatomy: all five building blocks in one folder, discovered by path</p>
</div>

## The Live Demo

I demoed a real plugin on stage: **web-quote**, which collects client requirements, researches domain and design in parallel, and produces a PDF quote. Every building block shows up exactly where you would expect it. A `.claude-plugin/plugin.json` manifest, two skills (`client-intake` and `quote-standards`), one command (`/quote`), three agents (`competitor-scanner`, `domain-checker`, `theme-recommender`), a `hooks/hooks.json`, and nine plain Python scripts. Nothing is wired up by hand, Claude discovers all of it from those paths.

The `/quote` run is five beats:

1. **Ask**: the `client-intake` skill defines what to collect
2. **Check**: `validate_input.py` halts on bad input
3. **Research**: the three agents run in parallel on domain, theme, and competitors
4. **Price**: `quote-standards` plus `calculate_quote.py`
5. **Ship**: render, verify behind hooks, then `html_to_pdf.py` writes the client PDF

The hooks are the part people asked about afterwards. A `SessionStart` hook runs `check_deps.py` before anything else, a `PreToolUse` matcher guards the templates from edits, and a second `PreToolUse` gate blocks the PDF step until verification actually passes. That last one is the whole thesis in miniature: the verification step runs whether or not I remembered to ask for it.

## One Structure, Every Team

I also showed that the same five-piece structure is not just an engineering pattern. I walked through seven functions, Engineering, Product, Program/PM, QA, Ops/DevOps, SecOps, and Go-to-market, with four or five concrete plugins each: `pr-review-kit` and `commit-helper` for engineering, `spec-writer` and `research-synth` for product, `standup-gen` and `sprint-planner` for program, `regression-guard` and `flaky-finder` for QA, `deploy-checklist` and `incident-response` for ops, `secret-guard` and `dep-audit` for security, `launch-kit` and `battle-cards` for go-to-market.

The scaffolding never changes, only the content does. Once one team builds a working plugin, every other team has a template instead of a blank page.

## Where Plugins Actually Are

I closed on the release line, because it is easy to assume this is all still experimental. Plugins went to public beta in October 2025 with `/plugin` in the terminal and VS Code. The format hardened to v1.1.0 in late 2025 and native installers replaced the global npm install. In May 2026 Anthropic launched an official managed directory, `anthropics/claude-plugins-official`, a vetted set of 55+ plugins alongside a community marketplace of 70+ more that passed automated safety screening, and it crossed 20,000 GitHub stars within four days. Dynamic Workflows hit GA in June 2026, and the Claude Security multi-agent plugin shipped in beta in July.

This is not an early-adopter bet anymore.

## The Chennaipy Experience

This was my second **full talk** at Chennaipy, after a lightning talk in November 2025 and my first full talk in June 2026 on the [dev-agent-playbook](/talks/chennaipy-dev-playbook/) MCP server. Where that talk was about serving rules on demand over MCP, this one was about packaging those rules, and everything else Claude needs, into a single installable unit.

The questions from the room were sharp: how plugin versioning should work across teams, whether hooks can be shared between plugins, and where the line sits between a skill and a script. Good questions to keep chewing on.

## Links

- **Slides**: <a href="/files/claude-plugins-unlocked.pdf" target="_blank">Download PDF</a>
- **Demo / source code**: <a href="https://github.com/arockiaraj1994/web-quote" target="_blank">GitHub Repository</a>
- **Blog write-up**: <a href="/posts/teach-claude-to-work-for-you-plugins-unlocked/">Teach Claude to Work For You: Plugins Unlocked</a>
- **Community**: <a href="https://chennaipy.org" target="_blank">Chennaipy</a>
