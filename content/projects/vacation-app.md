---
title: "I Spent 1 Lakh on a Vacation and Built an App Because of It"
date: 2026-03-30T10:00:00+05:30
draft: false
author: "Arockiaraj"
description: "How a chaotic group vacation led me to build a full Android app using AI tools and vibe coding - from idea to Play Store in days."
tags: ["vibe-coding", "android", "product-thinking", "side-project", "firebase"]
categories: ["Projects"]
featuredImage: ""
---

I recently went on a long vacation with family and friends. The total cost crossed 1 lakh rupees. At that scale, poor planning becomes expensive. I had to manage an itinerary across multiple cities, checklists for each person and for the group, shared expenses that needed splitting, flight and train tickets, ID copies, and contact details for hotels, cab drivers, and local guides.

<!--more-->

Everything was scattered. The itinerary was in a Google Doc. Checklists were in different notes apps. Expenses lived in a WhatsApp group where people kept losing track of who paid what. Tickets were buried in email. Contacts were saved in random phone entries that only one person had.

It was chaos. And it was expensive chaos.

## Why No App Existed

I searched for a single app that could handle all of this. The answer was no.

There were tools for notes. Tools for expense tracking. Tools for bookings. Tools for itinerary planning. But no single system designed for real trips with real people - where you need all of these things together, accessible to everyone in the group, without jumping between five different apps.

Every existing app solved one piece of the puzzle. None of them understood what an actual group vacation looks like.

Instead of adapting my workflow to fit scattered tools, I decided to build what I actually needed.

## The Build Journey

I didn't sit down and plan a four-version roadmap. Each version was born from hitting a real limitation in the previous one.

**v1 - Google Sheet.** The first version was just a shared Google Sheet. Columns for destinations, dates, costs, comparisons. It worked for initial planning - comparing hotel prices, listing transport options, splitting rough estimates. Simple, collaborative, and good enough for the "should we go to Goa or Ooty" stage.

**v2 - Google Apps Script Web App.** The spreadsheet quickly became unreadable on mobile. I used Google Apps Script to build an HTML front-end hosted on Google's infrastructure. Same data, but now presented as a clean web view that anyone could open from a shared link. Better UX, still zero hosting cost.

**v3 - Android App via Apps Script API.** A web view wasn't enough. I wanted native notifications, offline access, and a real app experience. I built an Android app that consumed the Google Apps Script API as its backend. The data still lived in Google Sheets, but the interface was now a proper mobile app. This was where GitHub Copilot changed everything - I could iterate on UI, API integration, and features at a speed that would have taken weeks solo.

**v4 - Firebase Migration.** Google Sheets as a database hit its ceiling - slow reads, no real-time sync, no proper authentication. I migrated the backend to Firebase with Firestore for the database and Firebase Auth for user management. Real-time updates, proper security rules, and an architecture that could actually scale.

Each version took days, not months. No team. No sprints. Just a real problem, GitHub Copilot, and fast execution.

## What I Learned

**Vibe coding is real.** Using GitHub Copilot, I could describe what I wanted and get working code fast. The iteration speed was unlike anything I'd experienced building side projects before. Features that would have taken me a weekend took hours.

**Spreadsheets are underrated as v1.** Starting with a Google Sheet forced me to think about the data model before writing any code. By the time I built the app, I already knew exactly what fields, relationships, and views I needed.

**Google Apps Script has a ceiling.** It's incredible for prototypes and automation, but the moment you need real-time data, proper auth, or sub-second response times, you've outgrown it. Knowing when to migrate is the skill.

**Publishing to the Play Store is a journey.** Store listings, screenshots, privacy policies, content ratings, review cycles - there's a whole process beyond just building the APK. It took longer than expected, but going through it once demystified the entire pipeline.

**When you solve your own problem, motivation is never the bottleneck.** Every feature I built was something I personally needed. No guessing what users want. No feature debates. The requirements were crystal clear because I lived them.

## The App Today

The app is called **My Trip**, and it's live on the Play Store.

It handles everything a group trip needs in one place:

- **Itinerary** - day-by-day plan with destinations, timings, and notes
- **Checklists** - individual packing lists and shared group checklists
- **Expense Splitting** - track who paid, split costs, settle balances
- **Document Storage** - tickets, ID copies, booking confirmations
- **Important Contacts** - hotels, cab drivers, local guides, emergency numbers

One app. One trip. Everything organized.

<a href="https://play.google.com/store/apps/details?id=com.mindshift.mytrip" target="_blank">Download My Trip on Google Play</a>

## Closing Thought

I didn't set out to build an app. I set out to plan a vacation without losing my mind.

The app was a side effect of a real problem that no existing tool solved well enough. Using today's AI tools and a vibe coding approach, the gap between "I wish this existed" and "I built it and shipped it" has collapsed to days.

When the problem is real, clarity is easy. Execution is everything.
