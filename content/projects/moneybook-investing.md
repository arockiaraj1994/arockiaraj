---
title: "MoneyBook: Investing"
date: 2026-11-19T10:02:00+05:30
draft: false
description: "How MoneyBook tracks my stocks: holdings and prices on a timer, value over time, stock cards in plain words, research reports and a short take from Claude."
tags: ["moneybook", "personal-finance", "stocks", "claude-code", "postgres"]
build:
  list: never
showTableOfContents: true
---

This page covers the **investing** part of [MoneyBook](/projects/moneybook/). It covers how holdings and
prices come in, and how Claude helps me read them without placing a single trade.

*Screenshots use made-up demo data: the companies and prices are not real.*

## Steps

[![Investing flow: timer or me, sync, snapshot, Claude reads, take and cards](/images/moneybook/investing-flow.svg)](/images/moneybook/investing-flow.svg)

1. **Timer or me.** A timer runs three times on weekdays: after the market opens, at midday and near the close. I can
   also just say "update prices".
2. **Sync.** One command fetches my holdings from the broker and prices from a public price feed.
3. **Snapshot.** Each sync is saved with its time. Snapshots are what draw the "value over time" chart.
4. **Claude reads.** When I ask for an analysis, Claude starts from fresh numbers, never old ones.
5. **Take and cards.** Claude writes a short take for the Invest page and updates the stock cards.

## Where the data comes from

- **Holdings** come from my broker's API. The script logs in, reads, and stops. It can't place, change or cancel
  orders, and the rule is written into the project.
- **Prices** come from a public daily price feed. Live tick-by-tick prices are not needed for a long-term investor.
- **Past trades and dividends** come from the broker's report exports, loaded once. Loading them again is safe: each
  trade is keyed on its exchange order id, so nothing is doubled.
- **Other accounts** (a second broker, bonds) still come in from files I export. The page says so when it matters.

One rule: a price update **always** fetches holdings too. Once, only prices were updated,
and the page said "holdings fetched 4 days ago". Now there is one command, `sync`, that does both.

## Invest page

[![MoneyBook invest page with stock value over time and Claude's take](/images/moneybook/invest.webp)](/images/moneybook/invest.webp)
<p class="img-caption">The Invest page: value over time, Claude's take, biggest moves, plan levels and overdue reviews</p>

- **Stocks value** with the gain on what I invested, and when holdings were last fetched.
- **Value over time** (1 month, 3 months, 1 year), invested amount against value.
- **Claude's take**: 4 to 7 short points. What moved and why it matters (or doesn't), price levels near my plan,
  reviews that are late, and what the numbers don't include. After the next price update it is marked "older than
  the latest prices", so I never read a stale take as fresh.
- **Biggest moves today**, in rupees and percent.
- **Plan price levels**: "buy more below ₹X", and how far the price is from it now.
- **Overdue reviews**: stocks I said I would look at again by a date.
- **Stocks table** and **stocks by sector**, with a warning if one stock or one sector gets too big a share.

## Stock cards

Each stock has a card. The first versions were full of investment terms and long paragraphs. I asked for plain
words, and now every card has the same three blocks:

[![A MoneyBook stock page with what it does, broker recommends and Claude recommends](/images/moneybook/stock.webp)](/images/moneybook/stock.webp)
<p class="img-caption">A stock page: what it does, the broker's view, Claude's view and the next step</p>

| Block | What it holds |
|---|---|
| **What it does** | One plain line about the business |
| **Broker recommends** | The research report's reasons, in 2 to 4 short points. The last point is always **"Not said: …"**, what the report leaves out |
| **Claude recommends** | A clear call in one or two lines, then **Why**, **Watch out** and **Next check** |

Hard words get a short explanation the first time, like "loans not repaid" instead of a banking term. Quarter names
like Q2 FY27 stay, because they are clear enough.

## Research reports

My broker sends research reports as PDFs. For each one:

- The PDF is saved, and the app opens it in its own reader.
- Claude writes a note: what the report says, what it doesn't say, and its own view.
- Each stock pick is saved with the price on that day, so I can later see how the pick did.
- **Reprints are marked.** Some reports repeat an old page. The stock page shows "Last report: date (reprint, no
  change)", so a repeated call doesn't look like new advice.

Claude follows a 10-step checklist for every analysis. It is saved as a skill in the project, so every session
uses the same steps.

## Reminders

- **Price actions**: "buy 20 more if the price is ₹300 or less". The page shows how far away that is.
- **Review dates**: "look at this stock again after its results".
- **Triggers**: things that should make me rethink a stock, like "loans not repaid above 3%".

## Android app

The Android Invest home shows only Claude's take. I found the other cards too busy on a phone, so the take now
carries the key points as short bullets. Stock pages have proper charts with pins for each buy and sell. Tap a pin
to see the details.

## Not done yet

- Mutual funds and bonds have no automatic feed.
- A second broker's holdings come from files, not an API.
- Claude's take is written when I ask. The timer updates prices but doesn't write a take on its own.
