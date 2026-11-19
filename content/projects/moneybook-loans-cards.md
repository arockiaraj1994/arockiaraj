---
title: "MoneyBook: Loans and Cards"
date: 2026-11-19T10:03:00+05:30
draft: false
description: "How MoneyBook tracks family loans and credit cards: what is owed, what is due, card rewards and benefits, and a 'Which card?' advisor written as plain code."
tags: ["moneybook", "personal-finance", "credit-cards", "loans", "fastapi"]
build:
  list: never
showTableOfContents: true
---

This page covers the **loans and cards** part of [MoneyBook](/projects/moneybook/). These have no automatic
feed. They come from papers: loan receipts, statements and card terms.

*Screenshots use made-up demo data: the banks, cards and amounts are not real.*

## Steps

[![Loans and cards flow: papers, Claude, td.py, tables, shown to me](/images/moneybook/loans-cards-flow.svg)](/images/moneybook/loans-cards-flow.svg)

1. **Papers.** A loan receipt, a bank statement, or a card's reward terms.
2. **Claude** reads it and picks the right command.
3. **One tool** (`td.py`) writes the loan, the payment or the card rule. There is no raw SQL.
4. **Tables** hold loans, payment plans, cards and reward rules.
5. **Shown to me** as what I owe, what is due, and which card to use.

## Loans

MoneyBook tracks my loans and my family's loans in one place. A gold loan, an EMI loan and an overdraft all work
differently, so each loan says how it is repaid.

[![MoneyBook loans page with total owed and two open loans](/images/moneybook/loans.webp)](/images/moneybook/loans.webp)
<p class="img-caption">Loans: total owed, interest per month, days left and the next planned payment</p>

For each loan:

- **Owed**: the last balance the bank showed, minus payments I made after it. If it is an estimate, the page says
  "est.", so I know to check with the bank.
- **Interest per month**, worked out from the rate.
- **Days left** until it is due.
- **A payment plan**: pay, save up, renew or close, each with a date and an amount. Done steps are linked to the
  real payment.
- **Over limit** warnings for overdrafts, with the interest included.
- **Papers**: photos of receipts, opened in the app.

Payments due in the next 7 days show on the Home page.

## Cards

Every credit card has its own small rule book, and I could never keep them in my head. Now each card's terms are in
the database:

- Limit (and whether it is shared with another card), bill day and due day.
- Annual fee, and how much I need to spend for it to be waived.
- **Reward rules**: points per ₹100, by category, by channel (shop, online, UPI), sometimes by shop or app. Many
  have a cap per month or per bill cycle, a minimum spend, or a list of things that earn nothing.
- **Benefits**: airport lounge visits per quarter, fuel surcharge waivers and fee waivers. I record each lounge
  visit, so the page shows how many are left.
- **Charges**, like a 1% fuel surcharge, and the amount range where it is waived.

[![MoneyBook card page with rewards this cycle, fees, how it earns and rewards by cycle](/images/moneybook/card.webp)](/images/moneybook/card.webp)
<p class="img-caption">A card page: rewards this cycle, fees and limits, how it earns, lounge visits and rewards by cycle</p>

The card page estimates the rewards for each bill cycle from my alerts. When the bank shows its real points, I add
them next to the estimate, so I can see how close the estimate is.

## Which card?

I type an amount and a category, and MoneyBook tells me which card to use, how to pay,
and why.

[![MoneyBook Which card? page recommending a card for a fuel spend](/images/moneybook/which-card.webp)](/images/moneybook/which-card.webp)
<p class="img-caption">Which card?: the best card, the reward in rupees and percent, the best card for each way to pay, and why</p>

**It is plain code, not an AI model.** Card rules are exact numbers, and the answer must be the same every time. An
AI guess is the wrong tool for that.

How it picks:

- For each open card, it works out this cycle's rewards **with** the new spend and **without** it. The difference is
  what this spend really earns.
- That way it counts what I already spent this cycle: caps already used up, minimum spends already reached.
- It takes off charges like a fuel surcharge, unless it is waived.
- It shows the best card **for each way to pay**: card at a shop, online, or QR scan.
- It explains the answer in short lines, like "13 points per ₹100 on fuel", "cap used up this month" or "no points
  on fuel on this card".

**Result:** before going live, I ran the same code over three months of my real spending: what I earned
against what the best card would have earned. I had missed a few thousand rupees in rewards. That was enough to
keep it.

On **Android**, a floating **Which card?** button opens a small popup: amount, category, and optional chips for
how I am paying. It is quick enough to use at the counter.

## Not done yet

- Short-term offers from payment apps are not modelled.
- Welcome bonuses and one-off offers are not counted. The page says so under every answer.
- Loan balances are as good as the last statement. Between statements, they are estimates.
