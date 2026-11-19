---
title: "MoneyBook: Tech Details"
date: 2026-11-19T10:04:00+05:30
draft: false
description: "The full MoneyBook setup: Apps Script parser, signed push, FastAPI, Postgres, SvelteKit, an Android app, timers, backups, checks, and how Claude Code ships a change."
tags: ["moneybook", "architecture", "fastapi", "postgres", "sveltekit", "android", "kotlin", "claude-code", "docker"]
build:
  list: never
showTableOfContents: true
---

This page has the tech details of [MoneyBook](/projects/moneybook/): every part of the setup, how the parts talk,
and how a change goes from an idea to a release.

## Architecture

The dots show live traffic: an alert coming in, prices being fetched, a change I asked for, and me reading the app.

[![MoneyBook architecture: bank alerts, Google parser, server with Caddy, ingest, login, read API, Postgres, td.py and timers; browser, Android and Claude Code](/images/moneybook/moneybook-architecture.svg)](/images/moneybook/moneybook-architecture.svg)

In simple terms: **one small server, one database, and the app only reads.** Every write goes through one
command-line tool.

## Parts

| Part | Built with | Job |
|---|---|---|
| Parser | Google Apps Script + Gemini | Reads each bank alert email and pushes the details to the server |
| Caddy | Caddy | HTTPS for everything, and the only way in from outside |
| Login | Keycloak + oauth2-proxy | Only my account gets in |
| Ingest | FastAPI (its own small service) | The one door for the parser. Checks the signature and saves the raw row |
| Read API | FastAPI, Python 3.12 | Read-only API for the web and Android apps. Checks the login again on every request |
| Database | Postgres | One database, one schema per area |
| `td.py` | Python | The only way to write: imports, sync, loans, cards, notes, everything |
| Timers | systemd | Clean new expense rows every 15 minutes, sync stocks 3 times on weekdays |
| Web | SvelteKit + Tailwind + ECharts | Desktop web app, built as static files and served by the API |
| Android | Kotlin + Jetpack Compose + Vico charts | Phone app with an app lock and a home-screen widget |
| Backup | Server-wide nightly job | Database and files to cloud storage |
| Claude Code | Claude Code on the server | Writes the code, runs the checks, and does the writes I ask for |

Everything on the server runs in Docker, except the timers.

## Database

Postgres is the single source of truth. There are no spreadsheets and no Markdown files holding data on the side.

| Schema | What is in it |
|---|---|
| `core` | Banks, accounts, cards, card terms, reward rules, benefits, documents |
| `expense` | Raw rows as parsed, clean rows, categories |
| `invest` | Stocks, prices, snapshots, holdings, trades, dividends, stock cards |
| `research` | Reports, notes, picks, analyst targets |
| `loan` | Loans, rates, payments, payment plans |
| `plan` | To-dos and reminders |
| `ai` | Claude's take for the Invest page |

A few rules keep it honest:

- **Changes to the schema are migrations** (Alembic). There were 14 in the first week. An applied migration is never
  edited.
- **Nothing is deleted.** Actions are cancelled, loans are closed and triggers are switched off.
- **Database checks** catch bad data at the door: a card number must be 4 digits, a loan plan marked "done" must
  point to a real payment, and a "spend" row must have a category.
- **Three database users**: an owner for migrations and the tool, a read-only user for the API, and an ingest user
  that can write one table only.
- **Last 4 digits only.** Full account numbers are never stored.

## Reading and writing data

- **The app reads.** The API's database user is read-only, with a short time limit on every query. No screen can
  change data.
- **`td.py` writes.** It has commands like `sync`, `import`, `expense reclean`, `loan txn`, `reward set`, `card set`
  and `brief set`. Each one checks its input and writes in a transaction.
- **Claude drives `td.py`.** When I say "I paid ₹10,000 on the gold loan", Claude runs the right command. When I
  share a card's terms, it sets the reward rules.

That keeps the web and Android apps simple. It also means every change is a command I can see.

## Security

- HTTPS everywhere. Only my login works, and the API checks the token again behind the proxy.
- The parser's push is signed, time-checked and can't be replayed. Its service can write one table, nothing more.
- Secrets live only in the server's environment file and in the parser's script settings. A secret scan runs on
  the code folders before each change.
- Container images are scanned for known security holes.
- Broker scripts call read-only endpoints. A Claude Code hook blocks any order command, and another blocks edits to
  raw data files.
- The Android app has an app lock, and its saved copy of the data is stored privately on the phone.

## Checks

One command, `make check`, runs everything:

| Area | Checks |
|---|---|
| API | ruff (lint), mypy (types), pytest (about 200 tests), pip-audit (known security holes) |
| Web | svelte-check, eslint, vitest, npm audit |
| Parser | Node syntax check and Node tests for every rule |
| Scripts | `td.py` tests against a copy of the database. Every case rolls back |
| Hooks | Lint, strict types and tests for the Claude Code hooks |
| Secrets and images | gitleaks on code folders, Trivy on the container image |

The Android app has its own pipeline in GitHub Actions: build, unit tests, lint, device tests on an emulator, and
31 screenshot checks. After a release is published, a smoke test downloads the signed APK, installs it and makes sure
it opens.

## Release steps

[![How a change ships: plan, branch and code, checks, pull request, merge and ship](/images/moneybook/shipping-flow.svg)](/images/moneybook/shipping-flow.svg)

1. **Plan.** I agree the change with Claude. A ticket in my Redmine tracker holds the plan, and bigger designs go on
   its wiki.
2. **Branch and code.** Claude writes the change on a new branch.
3. **Checks.** `make check`. For screen changes, Claude also takes screenshots and looks at them.
4. **Pull request.** I read the diff and the results.
5. **Merge and ship.** The server is deployed, or an Android release is built, signed and published, but only when
   I say so.

Android releases follow the same steps every time: bump the version, write the changelog, build the signed APK,
check the signing key matches the last release, and publish it as a GitHub release with checksums. That's 25 releases
in the first week.

## Claude Code setup

A few things make Claude dependable on this project:

- **Project rules** (`CLAUDE.md`): the layout, the database rules, the privacy rules and the writing style.
- **"Fresh data first"**: any price update or analysis starts with `td.py sync`. A hook reminds Claude if it forgets.
- **A stock-analysis skill**: my investor profile and a 10-step checklist, so every analysis follows the same steps.
- **Coding standards** from my own dev-playbook server: language rules, patterns and the definition of done.
- **Plain words**: short bullet points, money amounts written the Indian way, jargon explained the first time.

## What I learned

- **Keep raw data raw.** Raw expense rows are never edited, so every rule change is safe to undo.
- **Split reads and writes early.** A read-only app with one write tool is much easier to trust.
- **Use code where the answer must be exact.** The card advisor is plain code. The AI does the reading and the
  writing-up.
- **Plain words win.** The first stock cards were full of jargon and long text. Rewritten in short, plain points, I
  actually read them.
- **Write the gaps down.** Every page and every Claude take says what it does *not* count.
