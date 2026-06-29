---
title: "Full Talk at Chennaipy - Consistent AI Coding Across Multiple Tools"
date: 2026-06-27T10:00:00+05:30
draft: false
author: "Arockiaraj"
description: "A recap of my full talk at the Chennaipy June 2026 meetup, how I built a Python MCP server that delivers on-demand coding rules to any AI editor, so a team using Cursor, Claude Code, and Windsurf all write consistent code."
tags: ["python", "chennaipy", "mcp", "ai-coding", "claude-code", "open-source", "talk"]
categories: ["Talks"]
featuredImage: "/images/talks/chennaipy-dev-playbook/audience-view.jpeg"
---

When your team adopts AI coding tools, the first few weeks feel great. Everyone is shipping faster, reviews go quicker, and the AI is genuinely helpful. Then, quietly, the cracks start to show, the new feature looks nothing like the existing ones, one developer's error handling is completely different from another's, and the AI keeps suggesting patterns you deprecated six months ago. Nobody is doing anything wrong. The AI is just working without your team's context. That was the problem I took to the June 2026 Chennaipy meetup, and the talk was about what I built to fix it.

<!--more-->

## The Problem I Presented

The setup I put on screen: three developers, three editors, one repo.

Dev A uses Cursor with GPT-4o. Dev B uses Claude Code with Sonnet. Dev C uses Windsurf with whatever's free this week. Same codebase. Three completely different sets of rules in their heads, and in their editor configs.

The deeper issue is that reviewing AI-generated code is not the same as writing it. You review the screen. You check if it runs. You rarely catch that it silently ignores your team's error-handling contract or uses a pattern you replaced eight months ago. "It works" is not the same as "it's right."

The common fix is a rules file, `AGENTS.md`, `CLAUDE.md`, a pinned doc someone pastes into every chat. These help, but only if every developer remembers to include the right context for the right task, and only if that doc stays in sync as the codebase evolves. A flat file cannot be selective. When you need to fix a bug in the payments service, you do not need the full architecture overview for the notification system. But if it's all in one file, you get all of it or none of it.

The reframe I offered: what if the rules lived outside every tool? Served on demand, over MCP, exactly matched to the current task.

## What I Built

The answer is a Python MCP server. Every AI editor that speaks the Model Context Protocol, Cursor, Claude Code, Windsurf, connects once and calls the same tools. No copy-pasting context. No stale docs. No per-editor configuration beyond a one-line server URL.

The core mechanic is a single tool: `start_task(project, task)`. You type a task into your editor. The AI calls `start_task` first. That call returns the always-on guardrails for the project, the matched workflow, and a "Next Calls" list, a chain of follow-up tools the AI should call next: `get_skill`, `get_pattern`, `get_language_rules`. The AI follows those pointers, loads context relevant to the specific task, and generates code that fits your team's conventions, not just what it was trained on.

Four things make it production-ready beyond that core:

- **Token-gated auth**: Bearer tokens per developer, so only your team connects to the server
- **Markdown validation**: rule docs are validated for structure before they go live; a broken frontmatter cannot quietly corrupt the corpus
- **BM25 search fallback**: when a task does not exact-match a workflow trigger, the server searches the corpus and returns the closest match
- **Usage dashboard**: tracks tool calls, latency, and zero-result searches; the zero-result rate is the most useful number, because every failed query is a rule doc you have not written yet

For the full technical walkthrough and dashboard screenshots, see the <a href="/projects/dev-agent-playbook/">project write-up</a>.

## The Live Demo

The demo ran against the NexRe project, a Kotlin Android app I have been building with AI assistance. The task: *"add a screen for viewing links."*

I showed the sequence live on the projector. The AI calls `start_task(project="nexre", task="add a screen for viewing links")`, gets back the guardrails and the matched `add-screen` workflow, then follows the Next Calls chain, `get_skill`, `get_pattern("compose-screen")`, `get_pattern("viewmodel")`, `get_language_rules("kotlin")`. By the time it writes a single line of code, it has loaded the team's actual patterns for Compose screens and ViewModels.

<div style="margin: 32px 0; text-align: center;">
  <img src="/images/talks/chennaipy-dev-playbook/live-demo.jpeg" alt="Live demo on the projector, session-analyzer report on screen during the talk" style="max-width: 100%; height: auto; border-radius: 10px; border: 2px solid #c8c8c8; box-shadow: 0 8px 32px rgba(0,0,0,0.18);" loading="lazy" decoding="async" />
  <p style="font-size: 0.85em; color: #888; margin-top: 10px;">Live demo on the projector, showing the dev-agent-playbook dashboard during the talk</p>
</div>

The contrast landed well. AI coding without loaded context produces code that runs. AI coding with the right rules loaded produces code that belongs.

## The Chennaipy Experience

Chennaipy is Chennai's Python user group. They run monthly meetups with a mix of full talks and lightning talks. I gave a lightning talk at the November 2025 meetup on a photo organizer tool. This time I came back with a full talk, more time on stage, a proper narrative arc, a live demo.

Preparing a full talk is a different kind of pressure than a lightning talk. Ten minutes forces you to cut everything except the punchline. A full talk forces you to earn the audience's attention from the first slide. You have to know why you are telling this story in this order. That process, more than anything, clarified what the project was actually about.

<div style="margin: 32px 0; text-align: center;">
  <img src="/images/talks/chennaipy-dev-playbook/audience-view.jpeg" alt="Audience at the Chennaipy June 2026 meetup" style="max-width: 100%; height: auto; border-radius: 10px; border: 2px solid #c8c8c8; box-shadow: 0 8px 32px rgba(0,0,0,0.18);" loading="lazy" decoding="async" />
  <p style="font-size: 0.85em; color: #888; margin-top: 10px;">The room at Chennaipy, June 2026</p>
</div>

The audience asked good questions, about how to handle multiple repos in the same corpus, whether the server could be hosted on a shared server across teams, and how you decide what belongs in a guardrail versus a pattern. Those are exactly the questions worth writing down.

## Links

- **Slides**: <a href="/files/dev-playbook.pdf" target="_blank">Download PDF</a>
- **Source code**: <a href="https://github.com/arockiaraj1994/dev-agent-playbook" target="_blank">GitHub Repository</a>
- **Project write-up**: <a href="/projects/dev-agent-playbook/">dev-agent-playbook on this site</a>
- **Community**: <a href="https://chennaipy.org" target="_blank">Chennaipy</a>
