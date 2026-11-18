---
title: "MedRecord Became FamHeal: Rebuilt for Trust"
date: 2026-04-21T10:00:00+05:30
draft: false
description: "Why a solo, on-device health vault wasn't enough for a family, why I moved it to the cloud and then back to the phone, and why I turned off the AI extraction in favour of plain, trustworthy records."
tags: ["android", "kotlin", "jetpack-compose", "offline-first", "room", "ml-kit", "medrecord", "famheal"]
featureimage: "/images/medrecord/app/dashboard-app.jpeg"
images: ["/images/medrecord/app/dashboard-app.jpeg"]  # og:image for link previews
---

Every family ends up as the unpaid record keeper for its own health history. Someone has to remember which parent is on which medication, where last month's lab report went, and what the doctor actually said about a result that came back borderline. In my house that someone is me, and the record was never in one place: a photo of a prescription here, a PDF from a lab portal there, a dosage half-remembered from a phone call.

<!--more-->

I built an app to fix that. It has gone through three real shapes so far. The second one exists because the first one solved the wrong half of the problem, and the third exists because the second one brought problems of its own.

## Attempt one: a vault on one phone

The first version was **MedRecord**: a Kotlin and Jetpack Compose app that lived entirely on one device. People, medications, labs, conditions, reminders, and documents, all behind a PIN-protected, SQLCipher-encrypted database. No server, no account, no sync. I planned it with Claude in Opus's Adaptive Mode down to package names and module boundaries, had Claude Design turn that plan into wireframes, then built it in Cursor with Composer for the long implementation stretch. Full package-level notes from that build live on a companion page: **[MedRecord build plan (reference)](/projects/medrecord-build-plan/)**.

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
        <img src="/images/medrecord/design/dashboard.webp" alt="MedRecord wireframe: dashboard" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
      </td>
      <td style="vertical-align: top; width: 50%; padding: 0.5rem;">
        <img src="/images/medrecord/app/dashboard-app.webp" alt="MedRecord app: dashboard" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top; width: 50%; padding: 0.5rem;">
        <img src="/images/medrecord/design/auth-screen.webp" alt="MedRecord wireframe: auth and vault entry" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
      </td>
      <td style="vertical-align: top; width: 50%; padding: 0.5rem;">
        <img src="/images/medrecord/app/auth-app.webp" alt="MedRecord app: auth and vault entry" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
      </td>
    </tr>
  </tbody>
</table>

It worked, and it was genuinely private. Your data never left your phone. But that was also the flaw. A family's health record is not one person's problem. If my mother's medication list lives only on her phone, I can't check it when she calls asking what she's supposed to take. If her phone is lost or replaced, the record goes with it. Encryption solved the wrong risk. The real risk was a single point of failure.

## Attempt two: FamHeal, built cloud-first

So I started over as **FamHeal**, with a different starting assumption: the data has to survive a lost phone and be reachable from more than one place. That ruled out an on-device-only vault from the beginning.

The first cut of FamHeal used Google Drive as the backend: a folder per family member, synced files, shareable links. It worked, but it meant reimplementing sync, caching, and permissions on top of an API that wasn't built for structured records. A few weeks in, I retired the Drive backend and moved to Firebase: Google Sign-In for auth, Firestore for the structured data, Firebase Storage for the files themselves. Less plumbing to maintain, and a proper base to build family profiles, medications, and records on top of.

## The bet I turned off

The most consequential decision in FamHeal wasn't a backend choice. It was about how a document gets from a photo into a record.

I built the obvious version first: scan a report with ML Kit's document scanner, send it to Gemini through a Cloud Function, get back structured fields (test name, value, date) and write them straight into the record. It worked often enough to look impressive in a demo.

It also got things wrong in ways that matter more in health data than almost anywhere else. A misread decimal point on a lab value, or a wrong date on a prescription, doesn't just look bad. It can sit in a family's record for years and quietly mislead someone. Automatic extraction is a fair trade when the cost of a mistake is small. It isn't when the record is your parent's blood pressure history.

So I turned it off. Uploads now go straight to storage as plain, dated documents (a report or a consult note), viewable in-app with pinch-to-zoom, no numbers pulled out and no fields auto-filled. The extraction pipeline still exists in the codebase, dormant, for a version where I trust it enough to re-enable as a genuine assist rather than the default path. Doing the data entry yourself is slower. Being wrong about a lab result is worse.

## Attempt three: back on the phone

After living with the cloud version for a while, I changed my mind again. A cloud app needs an account, a server, an internet connection and a monthly bill, and it puts a family's health reports on someone else's server. For a set of files that a family mostly reads at home or at a doctor's desk, that was more than the problem needed.

So I rebuilt FamHeal as a fully offline app. There is no account, no server and no internet permission at all. Each family member is a folder. You scan a report or import a PDF or photos, give it a title, category and date, and it is stored as a PDF in the app's private storage.

The lost-phone problem from MedRecord still needed an answer, and this time the answer is a backup file, not a server. Everything goes into one password-protected file that you save wherever you like (a USB drive, an SD card, another folder) and restore on a new phone with the same password.

Reading reports came back too, but on the phone and in the shape I promised myself. ML Kit's bundled text recognizer reads the words on each saved file, so search finds words inside reports, such as "creatinine" or "HbA1c". When you add a file, the app suggests a title, date and category from the first page, and you check them before saving. Nothing is filled in without a person seeing it, and nothing is sent anywhere.

## What the app does today

- **Family folders**: one folder per person, with health folders inside (Fever, Diabetes, Dental care) to group related records.
- **Adding files**: scan with the camera, import PDFs or photos, or share them in from WhatsApp, email or Gallery.
- **Search inside reports**: the text is read on the phone, so search finds words inside reports, not just titles.
- **Suggestions**: a title, date and category from the first page, always checked by you before saving.
- **Backup**: one password-protected file you can restore on a new phone.
- **Emergency info card**: name, age, blood group, allergies and conditions in large text.

## Tech stack

| Area | Choice |
|------|--------|
| Language | Kotlin |
| UI | Jetpack Compose, Material 3 |
| Storage | Room for records, PDFs in the app's private storage |
| Capture | ML Kit Document Scanner |
| Text reading | ML Kit Text Recognition (bundled, on-device) |
| Backup | One password-protected file (AES-GCM, key from PBKDF2) |
| Network | None. The app has no internet permission |

## What hurt along the way

**Person scoping, now with higher stakes.** Every screen that lists medications, labs, or records has to filter by the selected family member. That was true in the on-device version too, but a missed filter used to be a UI bug. In a cloud-synced, multi-person account it's a real privacy bug.

**A refactor broke a dependency nobody had written down.** Decoupling the Records screen from the old report-syncing repository, part of moving to plain document storage, silently broke the dashboard, which turned out to depend on that same sync call as an undocumented side effect. The fix was straightforward once found; finding it meant tracing a "why did the dashboard stop updating" report back to a change in an unrelated screen.

**Blurry scans under zoom.** The PDF viewer rendered pages at their native point size with no DPI scaling, so a standard letter-size report looked fine at a glance but turned to mush the moment you pinch-zoomed in to actually read a number. The fix scales pages up to a resolution cap while leaving already-sharp scans alone. It was an easy bug to miss because it only shows up once someone tries to read the fine print, which is exactly when a health record matters most.

## What's next

Next is reading lab values out of reports on the phone, so a test like HbA1c can show as a trend over time. The rule stays the same as for suggestions: the app proposes, a person confirms, and nothing is written unreviewed.

## Closing

The lesson from MedRecord wasn't about encryption or architecture. It was that the right unit for a health record is the family, not the device, and that a feature working in a demo isn't the same as a feature worth trusting with your parents' medication list. It took three shapes to learn that a family's record has to survive a lost phone, but it doesn't need a server to do that. FamHeal is slower to use in a couple of places than the flashier version would have been. That's the trade I'd make again.
