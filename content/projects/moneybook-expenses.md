---
title: "MoneyBook: Expenses"
date: 2026-11-19T10:01:00+05:30
draft: false
description: "How MoneyBook turns bank alert emails into clean, sorted spending: the parser, the signed push, raw and clean rows, category rules, and the screens."
tags: ["moneybook", "personal-finance", "google-apps-script", "gemini", "postgres"]
build:
  list: never
showTableOfContents: true
---

This page covers one part of [MoneyBook](/projects/moneybook/): **expenses**. It covers how a bank alert
email becomes a sorted row in the app, and what the screens show.

*Screenshots use made-up demo data.*

## Simple flow

[![Expenses flow: alert email, parser, signed push, raw row, rules, clean row](/images/moneybook/expenses-flow.svg)](/images/moneybook/expenses-flow.svg)

Six steps, from "I paid" to "it's in the app":

1. **Alert email.** My bank or card sends an email for every payment.
2. **Parser.** A Google Apps Script job reads the email. Gemini pulls out the details.
3. **Signed push.** The parser sends the details to my server over HTTPS, with a signature.
4. **Raw row.** The server saves exactly what came in. This row is never edited.
5. **Rules.** A cleaner applies my rules: which account, which category, what kind of money movement.
6. **Clean row.** The result is what the app shows.

## Email parser

The parser still lives in Google Apps Script, like the [first version](/projects/ai-expense-tracker-bank-emails/).
It is free, it sits next to Gmail, and it works. But it is a full rewrite.

**What changed from the old parser:**

| Old parser | New parser |
|---|---|
| Read only the latest email in a thread | Reads **every** email, one by one |
| Labelled emails to mark them done | **Read-only** on Gmail. It can't label, change or send anything |
| A failed email could vanish | Every email gets a line in a log: saved, skipped (with the reason), retry, or failed |
| Rules mixed with Google calls | All rules in one file, tested on my machine with Node |
| Could read old mail | Reads **only mail that arrives after it was switched on**. No backfill |

Gemini still does the reading. It turns a batch of alert emails into a list of transactions: date, account (last 4
digits only), amount, shop, debit or credit, channel (card, UPI, online). The API key goes in a header, never in the
URL, so it can't leak into a log. Busy or rate-limited answers are tried again after a short wait.

The parser also writes every transaction to a Google Sheet. That Sheet is a backup log I can always open.

## Sending data

The parser sends each transaction to one narrow address on my server. That door only accepts a request that passes
every check:

- **A signature** made with a secret that only the parser and the server know.
- **A time check.** Requests older than a few minutes are refused.
- **No repeats.** Each request carries a one-time number. A copied request is refused.
- **A schema check.** Wrong fields or odd values are refused.

The service behind that door has its own database user. It can write to one table only, the raw expense table, and
nothing else. No transaction details are written to the logs.

If the same email is sent twice, nothing is doubled. Each row is keyed on the email's own message id.

## Sorting

There are three layers:

1. **Raw rows**: exactly what the parser saw. Never edited.
2. **Rules**: a small file with my accounts, payees and shops.
3. **Clean rows**: what the app shows, made from the raw rows by the rules.

If a rule changes, the clean rows are simply made again. A dry run shows what would change first, and I back up
the database before the real run. Rows I have checked by hand are left alone.

### Types of payments

Each clean row goes into one bucket:

| Bucket | Example | Counts as spend? |
|---|---|---|
| Spend | Groceries, food, fuel | Yes |
| Refund | Money back from a shop | Takes away from spend |
| Card bill | Paying the credit card bill | **No**, the card spends are already counted |
| Self transfer | Moving money to my own account | No |
| Investment | Money to my broker | No |
| Money sent | UPI to a person | Needs a check |
| Income | Salary, interest | No |

This one table fixed the "counted twice" problem of the old tracker.

### Categories

Categories come from rules, not from the AI's guess:

- **Account rules** map the last 4 digits (or a short name) to the right card or account.
- **Payee rules** map a shop or a person to a category. When someone pays a small shop by UPI, the alert shows the
  owner's name. A rule says "this name is my tea stall", and it only sets the category, never renames the payee.
- **Fallbacks** fill what is left. For example, a very small UPI payment with no other rule is most likely tea or
  snacks.
- **New categories** (like Salon or Hardware) are added as a database change, so the list stays clean.

Anything the rules can't decide is marked **needs a check**, with a short reason. The Home page counts these.

## App screens

[![MoneyBook expenses page with totals, a day-by-day chart, transactions and categories](/images/moneybook/expenses.webp)](/images/moneybook/expenses.webp)
<p class="img-caption">The Expenses page on the web</p>

What the Expenses page shows, top to bottom:

- **Total spent and day-to-day spend.** Big one-off payments (₹10,000 or more in one go) are shown on their own, so
  one big purchase doesn't hide how the normal days went.
- **Pace.** Day-to-day spend so far compared with the same days last month. A half month is never compared with a
  full month.
- **Today, Yesterday, Last 7 days**, each with what is usual.
- **Day by day** chart, with one-offs in a different colour.
- **Transactions**, with search, filters and a CSV export.
- **Categories** against a usual month, so "over a usual month" stands out.
- **Top shops**, **last 4 months** and UPI totals.

On **Android**, the same data is simpler: totals, today's tiles, and transactions grouped by date. Each row shows the
time of the payment, the category and the account. Filters stay behind one button.

The **home-screen widget** shows Today, Yesterday and the last 7 days, and refreshes on its own.

## Not done yet

- I can't fix a category from the app. I ask Claude, and it updates the rule.
- Cash spends are not tracked, because there is no alert for them.
- The time of a payment comes from the email, so a late email can show a slightly later time.
