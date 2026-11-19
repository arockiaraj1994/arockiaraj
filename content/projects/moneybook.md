---
title: "MoneyBook: One App for All My Money"
date: 2026-11-19T10:00:00+05:30
draft: false
description: "My free expense tracker grew into one app for spending, stocks, loans and cards. What changed, how it works, and what one week of building with Claude Code looked like."
tags: ["personal-finance", "claude-code", "fastapi", "postgres", "sveltekit", "android", "google-apps-script", "gemini", "moneybook"]
featureimage: "/images/moneybook/home.webp"
images: ["/images/moneybook/home.webp"]  # og:image for link previews
showTableOfContents: true
---

In March I wrote about [a free expense tracker that reads my bank emails](/projects/ai-expense-tracker-bank-emails/).
It ran on Google's free tools: Apps Script, Gemini and a Google Sheet. For eight months it did its job.

Then I started to notice the gaps. And my money was not only in expenses. There were stocks, loans, credit cards and
research reports, each in a different place.

So I built a bigger app. It is **MoneyBook**: one app for all of my money, built in about a week with Claude Code.

<!--more-->

*All screenshots on this page use made-up demo data. The banks, cards, stocks and amounts are not real.*

## Problems with the old tracker

The old tracker was good for a start. Over time, four problems showed up:

- **It lost alerts.** It read only the latest email in each Gmail thread. When two alerts with the same subject came
  in the same hour, one of them was gone.
- **Too much "Other".** About 4 in 10 rows had no proper category. Letting the AI guess every category was not
  enough.
- **Spend was counted twice.** Paying a credit card bill showed up as spending, but the card spends were already
  counted. That was a big part of all debits.
- **Messy account names.** The same card came in as `XX1234`, `1234` or a short name, depending on the bank.

And it only knew about expenses. My stocks, loans and cards lived in other apps, sheets and PDFs.

## What is in MoneyBook

MoneyBook has four parts. Each one has its own page.

| Part | What it does for me | Read more |
|---|---|---|
| **Expenses** | Every card and UPI payment, sorted into categories, with "how am I doing this month" | [Expenses →](/projects/moneybook-expenses/) |
| **Investing** | My stocks, their value over time, research notes and a short take from Claude | [Investing →](/projects/moneybook-investing/) |
| **Loans & cards** | What I owe, what is due, card rewards and "which card should I use?" | [Loans & cards →](/projects/moneybook-loans-cards/) |
| **Tech** | The full setup: parser, server, database, web, Android and how changes ship | [Tech →](/projects/moneybook-tech/) |

## User flow

There are three everyday flows: spending, investing, and loans and cards. Each dot in the picture is one item
moving through the steps.

[![MoneyBook user flow: spending, investing, and loans and cards, each in five steps](/images/moneybook/moneybook-user-flow.svg)](/images/moneybook/moneybook-user-flow.svg)

- **Spending is automatic.** I pay. The bank emails me. A parser reads the email and sends it to my server. MoneyBook
  sorts it, and I see it in the app a few minutes later.
- **Investing is half automatic.** A timer fetches my holdings and prices three times on weekdays. When I want an
  opinion, I ask Claude. It reads the fresh numbers and writes a short take.
- **Loans and cards are on request.** I share a receipt or a card's terms with Claude. It saves them through one
  tool. MoneyBook then reminds me what is due and tells me which card to use.

## Screenshots

The web app is for the desktop. On the phone I use the Android app and its home-screen widget.

[![MoneyBook home page with stock value, loans, spending so far and items needing attention](/images/moneybook/home.webp)](/images/moneybook/home.webp)
<p class="img-caption">Home: stock value, loans, spending so far this month, and what needs my attention</p>

[![MoneyBook expenses page with totals, a day-by-day chart, transactions and categories](/images/moneybook/expenses.webp)](/images/moneybook/expenses.webp)
<p class="img-caption">Expenses: day-to-day spend, one-offs kept apart, and categories against a usual month</p>

[![MoneyBook invest page with stock value over time and Claude's take](/images/moneybook/invest.webp)](/images/moneybook/invest.webp)
<p class="img-caption">Invest: value over time, Claude's take, biggest moves and price levels from my plan</p>

[![MoneyBook Which card? page recommending a card for a fuel spend](/images/moneybook/which-card.webp)](/images/moneybook/which-card.webp)
<p class="img-caption">Which card?: the best card for a spend, the reward, and why</p>

## Built in one week with Claude

MoneyBook did not start from zero. A few weeks earlier I had built a small stock journal with Claude: a database,
some scripts and a simple web page. MoneyBook took that in on day one and grew from there.

| Day | What got done |
|---|---|
| Day 1 | New repo, stock journal moved in, live behind my login. New parser written, and alerts started flowing to the server the same afternoon. |
| Day 2 | A better Expenses screen and the first Android app. |
| Day 3 | A home-screen widget and an app icon. |
| Day 4 | A proper desktop web app with a jump box (Ctrl K) and keyboard shortcuts. |
| Day 5 | Card benefits and reward tracking. Stock cards rewritten in plain words. |
| Day 6 | Claude's take on the Invest page, better charts on Android, the **Which card?** advice and a timer for prices. |
| Day 7 | The architecture poster, and this page. |

The numbers for that week:

- About **90 commits** and **80 pull requests**.
- **25 Android releases**, each signed and published.
- **14 database changes**, each a reviewed migration.
- Around **200 automated tests** on the server side, plus tests for the parser.
- 3,000+ old rows from the Google Sheet moved in, without losing one.

Like with [NexRe](/posts/from-3-days-per-feature-to-7-releases-in-2-days/), most of this happened from my phone. I
talk to Claude Code over Remote Control. It writes the code, runs the checks, takes screenshots and opens the pull
request. I read and approve.

## Safety rules

This is my money, so a few rules are fixed:

- **The app only reads.** No screen can change data. Every change goes through Claude and one command-line tool, and
  each one is logged.
- **No trading.** Scripts read my broker account. They never place, change or cancel an order.
- **Only me.** Every page is behind my own login, and the server checks it again on every request.
- **No old mail.** The parser reads only alerts that arrive after it was switched on. It never searches my inbox.
- **I approve.** Claude can't merge a pull request or deploy without my OK.
- **It is all written down.** Every task has a ticket in my Redmine tracker with the plan, the work and the test
  results.

## Not done yet

- Mutual funds and bonds don't have an automatic feed yet.
- A "Plan" area for goals, budgets and bills is still to be designed.
- Small edits from the app itself, like fixing a category, are still an open question.

## Tools used

Google Apps Script and Gemini (the parser), FastAPI and Postgres (the server), SvelteKit (the web app), Kotlin and
Jetpack Compose (the Android app), Caddy, Keycloak and Docker on one small server, and Claude Code for almost all of
the building.
