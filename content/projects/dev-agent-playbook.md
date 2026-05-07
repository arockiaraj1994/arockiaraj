---
title: "dev-agent-playbook: Every Developer on Your Team Uses a Different AI Editor. None of Them Follow the Same Rules."
date: 2026-05-07T20:00:00+05:30
draft: false
author: "Arockiaraj"
description: "How I built an MCP server that delivers on-demand coding rules and architecture context to any AI editor — so the whole team writes consistent code regardless of whether they use Claude Code, Cursor, or Windsurf."
tags: ["mcp", "ai-tools", "developer-tooling", "python", "claude-code", "cursor", "windsurf", "enterprise"]
categories: ["Projects"]
featuredImage: "/images/dev-agent-playbook/dev_p_dashboard.png"
---

There is a specific kind of frustration that builds up quietly in a team that has adopted AI coding tools.

It does not show up on day one. On day one, everyone is shipping faster. The AI is helpful. Reviews are quicker. Then, after a few weeks, you start noticing things. The new feature looks nothing like the existing ones. The PR from the developer using Windsurf handles errors differently from the one using Claude Code. The junior who just joined is asking the AI to use patterns your team deprecated six months ago. Nobody is doing anything wrong — the AI is just working without your team's context.

The usual fix is `AGENTS.md`. Or `CLAUDE.md`. Or a pinned doc that someone pastes into every chat. These work, but only if every developer remembers to include the right context for the right task — and only if that context stays in sync as the codebase evolves. Front-loading everything into a single file is not a strategy; it is technical debt in disguise.

I built dev-agent-playbook to solve this differently.

<!--more-->

## The idea

Instead of asking each developer to manage their own context, put the context on a server. Every AI editor — Claude Code, Cursor, Windsurf, or anything else that speaks MCP — connects once and retrieves only the rules relevant to the current task. No copy-pasting. No stale docs. No hoping the developer remembered to read the file before generating code.

The server holds your rule docs: architecture decisions, language standards, anti-patterns, workflow playbooks, code patterns, guardrails. When a developer starts a task, the AI calls `start_task(project, task)` and gets back exactly what it needs — guardrails, the matched workflow, and pointers to fetch next. Every call is logged, so you can see which rules are being used and which gaps need filling.

It is built on the [Model Context Protocol](https://modelcontextprotocol.io), which means it is vendor-neutral. One server, any editor.

## The problem with AGENTS.md at scale

If you have used `AGENTS.md` or a similar doc, you know the pattern: you write it once, it helps for a week, and then reality diverges from the doc because someone updates the codebase but not the doc. Or the doc grows to 400 lines and nobody reads all of it anyway. Or the new developer does not even know it exists.

The deeper issue is that a flat file cannot be selective. Every token of context you load costs time and attention — the AI's and yours. When you need to fix a bug in the payments service, you do not need the full architecture overview for the notification system. But if it's all in one file, you load all of it or none of it.

dev-agent-playbook structures rules by project and type — guardrails, language standards, patterns, skills, workflows, gates — and serves them on demand via BM25 search and direct fetch tools. The AI gets the right context at the right moment, not everything upfront.

## What the server looks like

<div style="margin: 32px 0; text-align: center;">
  <img src="/images/dev-agent-playbook/dev_p_dashboard.png" alt="dev-agent-playbook dashboard — live KPIs, tool call chart, recent activity" style="max-width: 100%; height: auto; border-radius: 10px; border: 2px solid #c8c8c8; box-shadow: 0 8px 32px rgba(0,0,0,0.18);" loading="lazy" decoding="async" />
  <p style="font-size: 0.85em; color: #888; margin-top: 10px;">Dashboard — connected editors, calls in the last 24h, zero-result rate, hourly activity chart</p>
</div>

The **Dashboard** is the first thing you open in the morning. It tells you how many editors are connected right now, how many tool calls were made in the last 24 hours, and — most importantly — the zero-result search rate. That last number is your backlog: every query the AI fired that returned nothing is a rule doc you have not written yet.

<div style="margin: 32px 0; text-align: center;">
  <img src="/images/dev-agent-playbook/dev_p_projects.png" alt="dev-agent-playbook projects view — rule health per project" style="max-width: 100%; height: auto; border-radius: 10px; border: 2px solid #c8c8c8; box-shadow: 0 8px 32px rgba(0,0,0,0.18);" loading="lazy" decoding="async" />
  <p style="font-size: 0.85em; color: #888; margin-top: 10px;">Projects — health score per project, file-by-file validation status, hard vs soft failures</p>
</div>

The **Projects** view shows every rule corpus the server has loaded. Each project gets a health score based on how many of its files pass the validator — required files present, correct folder layout, `INDEX.md` in sync. The example above shows `apache-camel` at 80% and `nexre` at 76%. The red dot on `nexre` means there is a hard failure that needs fixing before it is fully trusted.

<div style="margin: 32px 0; text-align: center;">
  <img src="/images/dev-agent-playbook/dev_p_tools.png" alt="dev-agent-playbook tools analytics — call counts, latency, most fetched docs" style="max-width: 100%; height: auto; border-radius: 10px; border: 2px solid #c8c8c8; box-shadow: 0 8px 32px rgba(0,0,0,0.18);" loading="lazy" decoding="async" />
  <p style="font-size: 0.85em; color: #888; margin-top: 10px;">Tools — call counts and latency per tool, plus which rule docs are fetched most</p>
</div>

The **Tools** view shows which MCP tools the team relies on and which rule docs are fetched most. In the screenshot above, `get_language_rules` and `start_task` are the two top tools — which is exactly the right pattern. The most-fetched doc is `nexre/languages/kotlin/anti-patterns.md`, which tells me the Kotlin anti-patterns doc is earning its place.

<div style="margin: 32px 0; text-align: center;">
  <img src="/images/dev-agent-playbook/dev_p_activity.png" alt="dev-agent-playbook activity feed — live tool calls with args and status" style="max-width: 100%; height: auto; border-radius: 10px; border: 2px solid #c8c8c8; box-shadow: 0 8px 32px rgba(0,0,0,0.18);" loading="lazy" decoding="async" />
  <p style="font-size: 0.85em; color: #888; margin-top: 10px;">Activity — every tool call, the exact args, which editor sent it, and whether it succeeded</p>
</div>

The **Activity** feed is a live log of every tool call. You can see who called what, with which arguments, from which editor, and whether it succeeded. This is useful for debugging a misconfigured editor and for spot-checking that the AI is actually following the right workflow before making changes.

<div style="margin: 32px 0; text-align: center;">
  <img src="/images/dev-agent-playbook/dev_p_users.png" alt="dev-agent-playbook users — active, inactive, never-called status per developer" style="max-width: 100%; height: auto; border-radius: 10px; border: 2px solid #c8c8c8; box-shadow: 0 8px 32px rgba(0,0,0,0.18);" loading="lazy" decoding="async" />
  <p style="font-size: 0.85em; color: #888; margin-top: 10px;">Users & adoption — who is actively using the server, who has gone quiet, who never connected</p>
</div>

The **Users** view is where adoption becomes visible. Every developer who connects their editor shows up here with a status: `active` (called in the last 2 days), `inactive` (gone quiet), or `never called` (configured but unused). The never-called list is your onboarding checklist.

<div style="margin: 32px 0; text-align: center;">
  <img src="/images/dev-agent-playbook/dev_p_tokens.png" alt="dev-agent-playbook API tokens — generate and manage bearer tokens" style="max-width: 100%; height: auto; border-radius: 10px; border: 2px solid #c8c8c8; box-shadow: 0 8px 32px rgba(0,0,0,0.18);" loading="lazy" decoding="async" />
  <p style="font-size: 0.85em; color: #888; margin-top: 10px;">Tokens — generate per-user Bearer tokens for MCP authentication</p>
</div>

<div style="margin: 32px 0; text-align: center;">
  <img src="/images/dev-agent-playbook/dev_p_token.png" alt="dev-agent-playbook manage users — create accounts with user or admin roles" style="max-width: 100%; height: auto; border-radius: 10px; border: 2px solid #c8c8c8; box-shadow: 0 8px 32px rgba(0,0,0,0.18);" loading="lazy" decoding="async" />
  <p style="font-size: 0.85em; color: #888; margin-top: 10px;">Manage Users — create team accounts, assign User or Admin roles</p>
</div>

**Tokens** is how each developer authenticates. They generate a Bearer token from this page and paste it into their editor's MCP config. It takes two minutes to set up, and from that point on the server knows who is calling.

## How it actually works for a developer

The MCP surface is designed so an agent can orient itself in **one call** and chain forward from there.

When you type a task into your editor — say, *"Add a new SFTP inbound route for payments to the apache-camel project"* — the AI calls `start_task('apache-camel', task)` first. That returns the always-on guardrails, the matched workflow (`new-feature.md`), and a `Next Calls` list pointing at the patterns and skills to fetch. The AI follows those pointers, loads the relevant context, and then generates code that follows your team's conventions — not just what it was trained on.

The developer types a task. The AI does the context loading. The developer reviews code that looks like it belongs in the codebase.

```
MCP tools available to the agent:

start_task(project, task)       → guardrails + workflow + next calls
get_guardrails(project)         → always-on MUST / MUST NOT rules
get_language_rules(project, language, doc?)   → standards / testing / anti-patterns
get_pattern(project, pattern)   → canonical code pattern
get_skill(project, skill)       → verb-noun playbook
get_workflow(project, name)     → new-feature / bug-fix / security-fix / refactor
search_rules(query)             → BM25 fallback
list_projects()                 → discovery
```

## Setting it up

The server is a Python process. Start it with:

```bash
git clone <this-repo>
cd <repo>/mcp
uv sync
uv run dev.py
```

`dev.py` regenerates each project's `INDEX.md`, validates the rule structure, and starts the server only if validation passes. Open `http://localhost:3000/dashboard/` to see it running.

To expose it on your LAN or inside a Docker network:

```bash
MCP_HOST=0.0.0.0 MCP_PORT=3000 uv run dev.py
```

Each developer then pastes a one-line config snippet into their editor — the exact snippet is on the **Setup** page in the dashboard for Claude Code, Cursor, and Windsurf.

Adding a new project is a matter of creating a directory next to `mcp/` with the right folder layout — `core/`, `architecture/`, `languages/`, `patterns/`, `skills/`, `workflows/`, `gates/` — writing the rule docs, and restarting the server.

## What I learned building this

The zero-result rate turned out to be the most valuable metric. The first week I ran this, the AI was firing queries like `"error handling conventions"` and `"retry policy"` and getting nothing back. Those empty results are not a problem with the server — they are an exact list of the rule docs the team has not written yet. The dashboard turned a vague sense of "we should document more" into a concrete, prioritised backlog.

The other insight: anti-patterns before patterns. An agent that knows what NOT to do makes fewer bad choices than one that only knows what good looks like. `anti-patterns.md` is now the first file I write for any new project in the corpus.

---

The project is open-source — the server, the dashboard, the validator, and example rule corpora are all included.

**→ [View on GitHub](https://github.com/arockiaraj1994/dev-agent-playbook)**

**Requirements:** Python 3.12+ and [uv](https://docs.astral.sh/uv/getting-started/installation/).
