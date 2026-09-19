---
title: "dev-playbook: Every Developer on Your Team Uses a Different AI Editor. None of Them Follow the Same Rules."
date: 2026-05-07T20:00:00+05:30
draft: false
author: "Arockiaraj"
description: "How a Python MCP server for serving a team's coding standards grew into a Docker-first server, a Claude Code plugin, a redesigned dashboard, and its own site at devplaybook.co.in."
tags: ["mcp", "developer-tooling", "python", "claude-code", "cursor", "windsurf", "docker", "open-source"]
categories: ["Projects"]
featuredImage: "/images/dev-agent-playbook/dashboard.jpg"
---

Three developers, three AI editors, one pull request that reads like it came from three different teams. That is what a shared codebase turns into a few weeks after everyone adopts an AI coding tool. The developer on Windsurf handles errors one way, the one on Claude Code another. A junior who joined last month is asking the AI to use a pattern the team retired six months ago. Nobody did anything wrong, which is exactly what makes it hard to fix.

<!--more-->

The usual answer is a rules file - `AGENTS.md`, `CLAUDE.md`, a doc someone pastes into every chat. It works for a week. Then the codebase moves and the doc does not, or it grows past the length anyone actually reads, or the new developer never learns it exists. Pasting the whole thing into every conversation is not a strategy. It is context nobody asked for, most of the time, and the exact context nobody has, right when it matters.

I built dev-playbook to fix that by moving the rules off every developer's desk and onto a server that any AI editor can ask.

## The idea

Put the standards behind an MCP endpoint instead of a file. Claude Code, Cursor, Windsurf, or anything else that speaks the protocol connects once and calls `playbook_start_task(project, intent)` when a session begins. It gets back the guardrails that always apply, the workflow that matches the kind of change being made, and a short list of what to read next - not the whole corpus, just the slice this task needs.

No copy-pasting. No stale doc quietly diverging from the codebase. No hoping a developer remembered to open a file before asking the AI to write code.

## Most teams start with nothing

The harder problem sits earlier than "serve the rules." Ask most teams where their standards live and you get a shrug and a link to something written in 2021, if that.

So the write side of dev-playbook generates a first draft: guardrails, a definition of done, architecture and git conventions, task workflows, and per-language standards and anti-patterns, built from template packs for Go, Java, Kotlin, Python, Rust, and TypeScript. Run it with `dry_run=true` first and you get the manifest, nothing written, so a team can see exactly what would land before it does. Then you go through the rules one at a time and accept or reject each one, which is a different exercise than rubber-stamping a folder full of text you never read.

Every tool declares what it needs confirmed before it runs. The one that writes is additive, not a merge - it creates a new standards project and refuses to fold into an existing one, on purpose.

## Getting it in front of the agent

Two ways in, depending on who is using it.

**On one machine**, the Claude Code plugin runs its own server over stdio, against its own local database. No port, no bearer token, nothing to deploy. It needs `uv` on the path and that is the whole setup:

```
claude plugin marketplace add arockiaraj1994/dev-playbook
claude plugin install dev-playbook@dev-playbook
```

**For a team**, one shared server everyone points at:

```
docker compose up -d
```

That brings up the MCP endpoint and the dashboard on the same port, with bearer tokens issued from the dashboard so each developer authenticates as themselves. Cursor and Windsurf have no plugin system, so they use the same MCP endpoint through a couple of lines of manual config.

## Off by default

The one design decision I keep coming back to is that installing the plugin does not block anyone's work.

Out of the box, a session-start hook puts the guardrails and the definition of done in front of the agent before the first edit, and that is all. If a repo has no standards project yet, the agent is told so, in one line, along with the command that fixes it. Nothing stops.

There is an enforcement mode that denies `Write` and `Edit` in a repo with no standards project, with a reason attached naming what is missing. I built it, and I ship it off. A tool that starts blocking people the day they install it teaches them to route around it, not to trust it. Adoption had to come before enforcement, not the other way round.

## It got its own site

The product outgrew a README. [devplaybook.co.in](https://devplaybook.co.in) is a separate Astro and Starlight site with a landing page, docs, a changelog, and a blog, deployed to GitHub Pages on its own domain. It pulls `CHANGELOG.md` and the template spec straight from this repo on each update, so the docs site and the actual releases cannot quietly drift apart the way the old rules-file problem worked in the first place.

Point a teammate at the GitHub repo and they are reading source code. Point them at the site and they get a two-command install, a reason to care, and a search box. That distinction turned out to matter more than I expected.

## Inside the dashboard

The dashboard went through its own redesign since I first built this - dual light and dark themes, a command-K search palette, and a nav split into Content, Manage, and Analytics.

<div style="margin: 32px 0; text-align: center;">
  <img src="/images/dev-agent-playbook/dashboard.jpg" alt="dev-playbook dashboard - live KPIs, tool call chart, recent activity" style="max-width: 100%; height: auto; border-radius: 10px; border: 2px solid #c8c8c8; box-shadow: 0 8px 32px rgba(0,0,0,0.18);" loading="lazy" decoding="async" />
  <p style="font-size: 0.85em; color: #888; margin-top: 10px;">Dashboard - connected editors, tool calls, and the zero-result search count</p>
</div>

**Dashboard** is the first page you open. Tool calls in the last 24 hours, active versus inactive users, and the zero-result search count - queries the agent fired that came back empty. That number is a backlog: every empty result names a rule doc nobody has written yet.

<div style="margin: 32px 0; text-align: center;">
  <img src="/images/dev-agent-playbook/standards.jpg" alt="dev-playbook standards health - per-project score, green/amber/red files" style="max-width: 100%; height: auto; border-radius: 10px; border: 2px solid #c8c8c8; box-shadow: 0 8px 32px rgba(0,0,0,0.18);" loading="lazy" decoding="async" />
  <p style="font-size: 0.85em; color: #888; margin-top: 10px;">Standards - per-project health, file by file</p>
</div>

**Standards** scores every project against the validator - required files present, correct layout, the index in sync. In the screenshot above, FamHeal sits at 100% and nexre at 70%, which is an honest read: nexre has seven files with a soft warning I have not gone back to clear.

<div style="margin: 32px 0; text-align: center;">
  <img src="/images/dev-agent-playbook/tools.jpg" alt="dev-playbook tools and rule popularity - call counts and latency per tool" style="max-width: 100%; height: auto; border-radius: 10px; border: 2px solid #c8c8c8; box-shadow: 0 8px 32px rgba(0,0,0,0.18);" loading="lazy" decoding="async" />
  <p style="font-size: 0.85em; color: #888; margin-top: 10px;">Tools - call volume and latency per tool, most-fetched docs</p>
</div>

**Tools** shows which of the five calls the team actually leans on. `playbook_get_standard` and `playbook_start_task` dominate here, which is the pattern I want to see - an agent orienting itself once, then fetching the specific document it needs.

<div style="margin: 32px 0; text-align: center;">
  <img src="/images/dev-agent-playbook/activity.jpg" alt="dev-playbook recent activity - live feed of tool calls with args and status" style="max-width: 100%; height: auto; border-radius: 10px; border: 2px solid #c8c8c8; box-shadow: 0 8px 32px rgba(0,0,0,0.18);" loading="lazy" decoding="async" />
  <p style="font-size: 0.85em; color: #888; margin-top: 10px;">Activity - every call, its arguments, and whether it succeeded</p>
</div>

**Activity** is a live feed of every call, useful for the exact question "why did the agent just do that" - the row shows the project, the ref it asked for, and the latency.

<div style="margin: 32px 0; text-align: center;">
  <img src="/images/dev-agent-playbook/users.jpg" alt="dev-playbook users and adoption - active, inactive, never-called status" style="max-width: 100%; height: auto; border-radius: 10px; border: 2px solid #c8c8c8; box-shadow: 0 8px 32px rgba(0,0,0,0.18);" loading="lazy" decoding="async" />
  <p style="font-size: 0.85em; color: #888; margin-top: 10px;">Users - who is actively using the server</p>
</div>

**Users** turns adoption into a real number instead of a guess - configured, active, inactive, never called. The never-called column is the onboarding checklist nobody has to ask for.

## Tech stack

| Area | Choice |
|------|--------|
| Server | Python, Starlette + Uvicorn, the official MCP SDK (stdio and SSE) |
| Dashboard | Jinja2 templates, SQLite for standards and telemetry |
| Distribution | Docker Compose, self-hosted marketplace, Claude Code plugin |
| Website | Astro + Starlight, deployed to GitHub Pages on a custom domain |
| Tests | pytest, 649 tests as of this writing |

## What actually hurt

**The zero-result rate was the real signal.** Early on, the AI was firing queries like "error handling conventions" and getting nothing back. Those empty results were never a server problem - they were an exact, prioritised list of the docs the team had not written. The dashboard turned a vague sense of "we should document more" into a specific backlog.

**Anti-patterns earned their place before patterns did.** An agent that knows what not to do avoids more bad choices than one that only knows what good looks like. `anti-patterns.md` is the first file I write for any new project now.

**Even the tool descriptions have a rule against this.** One of the 649 tests checks that no tool's own description reuses AI or agent persona language. I did not set out to write this post the same way, but writing it without "seamless" or "robust" turned out to be less work than I expected, because the product's own copy had already banned them first.

---

The server, the dashboard, the validator, and the template packs are all open source.

**Repo:** [github.com/arockiaraj1994/dev-playbook](https://github.com/arockiaraj1994/dev-playbook)
**Site:** [devplaybook.co.in](https://devplaybook.co.in) - landing page, docs, changelog, blog

```
claude plugin marketplace add arockiaraj1994/dev-playbook
claude plugin install dev-playbook@dev-playbook
```

**Requirements:** Python 3.12+ and [uv](https://docs.astral.sh/uv/getting-started/installation/) for the plugin, or Docker for a shared server.
