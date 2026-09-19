---
title: "MedRecord Became FamHeal: A Family Health App Rebuilt for Trust, Not Automation"
date: 2026-04-21T10:00:00+05:30
draft: false
author: "Arockiaraj"
description: "Why a solo, on-device health vault wasn't enough for a family, and why I turned off the AI extraction I built to replace it with plain, trustworthy record-keeping."
tags: ["android", "kotlin", "jetpack-compose", "firebase", "firestore", "room", "hilt", "medrecord", "famheal"]
categories: ["Projects"]
featuredImage: "/images/medrecord/app/dashboard-app.jpeg"
---

Every family ends up as the unpaid record keeper for its own health history. Someone has to remember which parent is on which medication, where last month's lab report went, and what the doctor actually said about a result that came back borderline. In my house that someone is me, and the record was never in one place - a photo of a prescription here, a PDF from a lab portal there, a dosage half-remembered from a phone call.

<!--more-->

I built an app to fix that. It has gone through two real shapes so far, and the second one exists because the first one solved the wrong half of the problem.

## Attempt one: a vault on one phone

The first version was **MedRecord** - a Kotlin and Jetpack Compose app that lived entirely on one device. People, medications, labs, conditions, reminders, and documents, all behind a PIN-protected, SQLCipher-encrypted database. No server, no account, no sync. I planned it with Claude in Opus's Adaptive Mode down to package names and module boundaries, had Claude Design turn that plan into wireframes, then built it in Cursor with Composer for the long implementation stretch. Full package-level notes from that build live on a companion page: **[MedRecord build plan (reference)](/projects/medrecord-build-plan/)**.

Side by side, the wireframe and the shipped screen from that build:

<table>
  <thead>
    <tr>
      <th>Wireframe (Claude Design)</th>
      <th>App</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="vertical-align: top; width: 50%; padding: 0.5rem;">
        <img src="/images/medrecord/design/dashboard.png" alt="MedRecord wireframe - dashboard" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
      </td>
      <td style="vertical-align: top; width: 50%; padding: 0.5rem;">
        <img src="/images/medrecord/app/dashboard-app.jpeg" alt="MedRecord app - dashboard" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top; width: 50%; padding: 0.5rem;">
        <img src="/images/medrecord/design/auth-screen.png" alt="MedRecord wireframe - auth and vault entry" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
      </td>
      <td style="vertical-align: top; width: 50%; padding: 0.5rem;">
        <img src="/images/medrecord/app/auth-app.jpeg" alt="MedRecord app - auth and vault entry" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
      </td>
    </tr>
  </tbody>
</table>

It worked, and it was genuinely private - your data never left your phone. But that was also the flaw. A family's health record is not one person's problem. If my mother's medication list lives only on her phone, I can't check it when she calls asking what she's supposed to take. If her phone is lost or replaced, the record goes with it. Encryption solved the wrong risk. The real risk was a single point of failure.

## Attempt two: FamHeal, built cloud-first

So I started over as **FamHeal**, with a different starting assumption: the data has to survive a lost phone and be reachable from more than one place. That ruled out an on-device-only vault from the beginning.

The first cut of FamHeal used Google Drive as the backend - a folder per family member, synced files, shareable links. It worked, but it meant reimplementing sync, caching, and permissions on top of an API that wasn't built for structured records. A few weeks in, I retired the Drive backend and moved to Firebase: Google Sign-In for auth, Firestore for the structured data, Firebase Storage for the files themselves. Less plumbing to maintain, and a proper base to build family profiles, medications, and records on top of.

## The bet I turned off

The most consequential decision in FamHeal wasn't a backend choice. It was about how a document gets from a photo into a record.

I built the obvious version first: scan a report with ML Kit's document scanner, send it to Gemini through a Cloud Function, get back structured fields - test name, value, date - and write them straight into the record. It worked often enough to look impressive in a demo.

It also got things wrong in ways that matter more in health data than almost anywhere else. A misread decimal point on a lab value, or a wrong date on a prescription, doesn't just look bad - it can sit in a family's record for years and quietly mislead someone. Automatic extraction is a fair trade when the cost of a mistake is small. It isn't when the record is your parent's blood pressure history.

So I turned it off. Uploads now go straight to storage as plain, dated documents - a report or a consult note, viewable in-app with pinch-to-zoom, no numbers pulled out and no fields auto-filled. The extraction pipeline still exists in the codebase, dormant, for a version where I trust it enough to re-enable as a genuine assist rather than the default path. Doing the data entry yourself is slower. Being wrong about a lab result is worse.

## What the app does today

- **Family profiles** - each person's medications, labs, conditions, and documents kept separate, switchable from the top bar.
- **Records** - a plain, dated timeline of uploaded reports and consult notes, with an in-app PDF viewer instead of handing the file off to another app.
- **Dashboard** - trend cards for each lab test, laid out like a small analytics board: reorder them, resize them, hide the ones you don't need. It replaced a fixed summary view that couldn't be adjusted per family member.
- **Cloud-backed profiles** - one signed-in account, all of that family's data synced to Firestore and Storage so it survives a phone swap and is visible from any device on that account.

## Tech stack

| Area | Choice |
|------|--------|
| Language | Kotlin |
| UI | Jetpack Compose, Material 3 |
| DI | Hilt |
| Cloud data | Firestore + Firebase Storage, scoped per signed-in account |
| Local | Room, as an on-device cache |
| Auth | Firebase Auth via Google Sign-In (Credential Manager) |
| Capture | ML Kit Document Scanner |
| Extraction (dormant) | Firebase Functions calling Gemini |
| Images | Coil |

## What actually hurt

**Person scoping, now with higher stakes.** Every screen that lists medications, labs, or records has to filter by the selected family member. That was true in the on-device version too, but a missed filter used to be a UI bug. In a cloud-synced, multi-person account it's a real privacy bug.

**A refactor broke a dependency nobody had written down.** Decoupling the Records screen from the old report-syncing repository - part of moving to plain document storage - silently broke the dashboard, which turned out to depend on that same sync call as an undocumented side effect. The fix was straightforward once found; finding it meant tracing a "why did the dashboard stop updating" report back to a change in an unrelated screen.

**Blurry scans under zoom.** The PDF viewer rendered pages at their native point size with no DPI scaling, so a standard letter-size report looked fine at a glance but turned to mush the moment you pinch-zoomed in to actually read a number. The fix scales pages up to a resolution cap while leaving already-sharp scans alone - an easy bug to miss because it only shows up once someone tries to read the fine print, which is exactly when a health record matters most.

## What's next

Today, FamHeal is still one signed-in account managing all of that family's data - not yet separate logins for each family member with their own access to a shared record. That's the next real piece: a token-scoped, read-only view so a sibling or a doctor can check a record without holding the primary account's keys. After that, I'd like to bring the extraction pipeline back as an optional assist - suggest the fields, let a person confirm them, never write anything unreviewed.

## Closing

The lesson from MedRecord wasn't about encryption or architecture. It was that the right unit for a health record is the family, not the device, and that a feature working in a demo isn't the same as a feature worth trusting with your parents' medication list. FamHeal is slower to use in a couple of places than the flashier version would have been. That's the trade I'd make again.
