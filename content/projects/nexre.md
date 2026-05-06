---
title: "NexRe: I Was Saving Links to Myself on WhatsApp and Never Reading Them"
date: 2026-05-07T00:01:00+05:30
draft: false
author: "Arockiaraj"
description: "How a habit of sharing links to myself on WhatsApp—and never reading them—turned into a full Android read-it-later app with two share targets, Gemini AI summaries, and a clean reading library."
tags: ["android", "kotlin", "jetpack-compose", "room", "workmanager", "hilt", "gemini", "nexre", "claude-design"]
categories: ["Projects"]
featuredImage: "/images/nexre/app/app_home_page.png"
---

I have a habit. When I come across something interesting—a GitHub repo, an arXiv paper, a LinkedIn post, a dev.to article—I share it to myself on WhatsApp. Sometimes Telegram. The idea is always the same: I'll read it later.

I never do.

<!--more-->

The links pile up. There is no organisation. No way to know what I have already read. No tagging, no tracking, no memory. Just an endless scroll of URLs mixed in with actual conversations, collecting dust.

I looked for an app that solved this. Pocket exists. Instapaper exists. They are fine tools, but they felt like overkill for what I wanted—something lightweight, private, on-device, with no account, no sync to a server I don't control, and ideally some AI intelligence layered on top without requiring a separate subscription. Nothing fit well enough.

So I built it.

## The problem, more precisely

The core issue is not that I save too many links. It is that saving has zero friction and reading has infinite friction.

Sharing a link to WhatsApp takes two taps. Reading it later requires: remembering you saved it, scrolling back through a chat to find it, remembering why it seemed interesting, and then actually opening it. By that point, the context is gone and the motivation has evaporated.

What I needed was a system that:

1. **Makes saving completely invisible** — I share it, it's saved, done. No UI opens. No confirmation flow to tap through.
2. **Makes reading feel worth it** — Show me what the link is about before I click. Give me context, not just a URL.
3. **Tracks what I've actually read** — So I can stop saving things I've already seen.

The Android share sheet is the right entry point. It's already the universal "send this somewhere" gesture. I just needed to become a destination in it—twice.

## The design came first

Before writing a single line of Kotlin, I used **Claude Design** to mock up the full app. I had a detailed spec in my head—two share modes, six screens, swipe gestures, source badges for GitHub, LinkedIn, arXiv, and so on—and I wanted to see it rendered before committing to code.

The conversation with the design tool was iterative. I answered questions about navigation style (bottom nav, four tabs), card density (compact default), read state treatment (coloured dot for unread, greyed-out card for read), tag layout, library filters, and whether to show a mini chart on the home screen. The AI made decisions where I had no strong opinion—the Topics screen layout, the polish extras, the summary anatomy.

What came out was a hi-fi clickable React prototype: Home, Library, Topics, Search, Detail, and Settings screens, plus an onboarding carousel and a simulated Android share sheet showing both NexRe options. The design established the accent colour (deep indigo, `#3B4ACC`), the source badge system, the gradient thumbnail approach (no real OG image fetching in V1—just a deterministic gradient from the URL hash), and the swipe-to-dismiss interaction.

Having that prototype as a reference made the implementation session much faster. I wasn't making design decisions during code—I was executing against a reference.

## Two share targets, two behaviours

The most interesting architectural decision in NexRe is having two separate entries in the Android share sheet.

**NexRe — Save** is completely silent. You share a URL, the activity receives it, enqueues a WorkManager job, and immediately calls `finish()`. The app never opens. A few seconds later, a quiet notification appears: `Saved: <title>`. The WorkManager job fetches OG tags (title, description, image URL) using Jsoup, detects the source platform from the URL domain, applies keyword-based auto-tags, and writes everything to Room. That is the entire flow.

**NexRe — Summarize** opens a transparent activity that hosts a modal bottom sheet over whatever app you were in. It does not feel like launching an app—it feels like a popup. The bottom sheet shows a loading state while it fetches OG tags plus article body text, sends it to **Gemini Flash** with a structured prompt, and parses the JSON response into a 3–5 sentence summary and suggested tags. You see the title, summary, and tag chips. You can tap Save, and it is stored with the summary attributed to Gemini. Then the sheet dismisses and you are back where you started.

The fallback chain for Summarize matters: no API key configured → warning in the sheet with a link to Settings. No internet → offer to just save without summary. Gemini failure or quota hit → save with the OG description as the summary, flag `summary_source = OG_META`. Paywalled article with no extractable body → use OG description only, auto-tag as `paywalled`.

This two-target design came directly from a real UX observation: most of the time I just want to save something quickly and not think about it. But occasionally I want to understand something before I commit to reading it. Having both modes without having to configure anything per-save is the right default.

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin: 24px 0;">
  <div style="flex: 1; min-width: 200px; text-align: center;">
    <img src="/images/nexre/app/share_sheet.png" alt="NexRe — Android share sheet showing both Save and Summarize targets" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
    <p style="font-size: 0.85em; color: #888; margin-top: 8px;">Android share sheet — both NexRe targets visible</p>
  </div>
  <div style="flex: 1; min-width: 200px; text-align: center;">
    <img src="/images/nexre/app/app_share_summary.png" alt="NexRe — Summarize bottom sheet over the calling app" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
    <p style="font-size: 0.85em; color: #888; margin-top: 8px;">Summarize bottom sheet — floats over the calling app</p>
  </div>
</div>

## The data model

The `links` table captures everything that matters for reading behaviour:

- The usual metadata: `url`, `title`, `description`, `thumbnail_url`, `source_platform`
- Status lifecycle: `UNREAD` → `READ` → `ARCHIVED`
- AI provenance: `summary` and `summary_source` (`NONE`, `OG_META`, or `GEMINI`)
- Reading analytics: `opened_at`, `read_duration_sec`, `read_count`
- Personal layer: `personal_note`, `is_favourite`

Tags live in their own normalised tables—`tags` and `link_tags` junction—with a `source` column tracking whether a tag came from keyword matching or Gemini. This matters for knowing whether to trust a tag or treat it as a suggestion.

Source platform detection is just URL domain matching: `github.com` → `GITHUB`, `linkedin.com` → `LINKEDIN`, `twitter.com` / `x.com` → `TWITTER`, `arxiv.org` → `RESEARCH`, and so on. Nothing clever, entirely reliable.

Keyword auto-tagging applies when Gemini is not involved. A predefined map checks the title and description for terms like "Android", "Kotlin", "Compose" → tag `Android`, or "AI", "LLM", "GPT" → tag `AI`. Lowercase stored, title-case displayed.

## The six screens

**Home** is newest-first: unread and recently read links, a weekly bar chart showing reads per day, and a badge on the bottom nav showing the unread count. Swipe right to mark read (green reveal), swipe left to archive (orange reveal). No FAB—the share sheet is the only way in.

**Library** has a filter tab bar: All, Unread, Read, Archived, Favourites. A sort toggle switches between date saved and recently opened. Same card layout throughout.

**Topics** lists every tag with its unread count and total count, sorted by unread descending. Tap a tag to see a filtered Library view. Long press gives options to rename, merge, or delete the tag.

**Search** is a full-screen overlay with a SearchBar. It queries across title, description, personal note, URL, and tag names—all local, no server. Recent searches are stored in DataStore.

**Detail** is where the reading context lives: hero thumbnail, source badge, full summary with its provenance label ("Summary by Gemini" or "Auto-summary"), editable tag chips, a personal note text field, favourite toggle, and a stats row showing saved date, open count, and total read time. The primary action is **Open in Browser**, which launches a Chrome Custom Tab. When you return to the app, a snackbar asks "Did you finish reading?"—tap Yes to mark it read, or ignore it to leave it unread. This is the only read-tracking mechanism. No browser hooks, no background timers.

**Settings** covers the Gemini API key (masked input with show/hide toggle, plus a Test Key button that pings the API with a minimal request), daily reminder and weekly digest notification toggles, JSON export to Downloads, tag management, and a data clear option with confirmation dialog.

The **onboarding carousel** is three screens shown only on first launch, tracked via DataStore. Once you tap Get Started, it never appears again.

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin: 24px 0;">
  <div style="flex: 1; min-width: 160px; text-align: center;">
    <img src="/images/nexre/app/app_home_page.png" alt="NexRe — Home screen" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
    <p style="font-size: 0.85em; color: #888; margin-top: 8px;">Home</p>
  </div>
  <div style="flex: 1; min-width: 160px; text-align: center;">
    <img src="/images/nexre/app/app_library.png" alt="NexRe — Library screen" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
    <p style="font-size: 0.85em; color: #888; margin-top: 8px;">Library</p>
  </div>
  <div style="flex: 1; min-width: 160px; text-align: center;">
    <img src="/images/nexre/app/app_topics.png" alt="NexRe — Topics screen" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
    <p style="font-size: 0.85em; color: #888; margin-top: 8px;">Topics</p>
  </div>
  <div style="flex: 1; min-width: 160px; text-align: center;">
    <img src="/images/nexre/app/app_setting.png" alt="NexRe — Settings screen" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
    <p style="font-size: 0.85em; color: #888; margin-top: 8px;">Settings</p>
  </div>
</div>

## Tech stack

| Layer | Choice |
|---|---|
| Language | Kotlin |
| UI | Jetpack Compose + Material 3 |
| Architecture | MVVM + Clean Architecture (data / domain / ui) |
| Local DB | Room |
| Background | WorkManager (custom factory, not Hilt workers) |
| DI | Hilt |
| Networking | Retrofit + OkHttp + Moshi |
| Secure storage | EncryptedSharedPreferences |
| Browser | Chrome Custom Tabs |
| HTML parsing | Jsoup |
| Image loading | Coil |
| Preferences | DataStore |

The Gemini integration uses `gemini-2.0-flash:generateContent` via REST. The API key is stored in `EncryptedSharedPreferences` using AES256-GCM and only read at call time—never held in memory longer than needed.

WorkManager uses a custom `NexReWorkerFactory` rather than Hilt's `@HiltWorker` annotation. The factory instantiates workers directly with their injected dependencies, and `NexReApplication` implements `Configuration.Provider` to hand the factory to WorkManager at startup. The auto-initializer is removed from the manifest so WorkManager does not try to self-initialise before the factory is registered.

## What actually made this hard

**The share sheet UX contract.** `StoreActivity` must call `finish()` immediately—any delay and Android shows the app as "launching", which breaks the invisible-save illusion. The WorkManager job handles everything asynchronously after the activity is gone. Getting the timing right took a few iterations.

**Transparent activity theming.** `SummarizeActivity` uses `android:windowIsTranslucent="true"` and a transparent background so the bottom sheet appears to float over whatever was on screen. If any theme attribute is misconfigured, you get a white flash or a full-screen background instead of a seamless popup.

**The M3 SwipeToDismiss API changed.** The original code used `SwipeToDismiss`, `DismissState`, `DismissDirection`, and `rememberDismissState`—all of which were removed in Material 3 1.3+. The replacement API is `SwipeToDismissBox`, `SwipeToDismissBoxState`, `SwipeToDismissBoxValue`, and `rememberSwipeToDismissBoxState`. The composable structure also changed: instead of separate `background` and `dismissContent` lambdas, the new API uses `backgroundContent` and a single trailing content lambda.

**Room `@Relation` with a junction table.** The `LinkWithTags` data class uses `@Relation` + `@Junction` to fetch tags for each link. This only works if the parent and entity columns match exactly what Room expects—getting the column names wrong produces a silent empty list rather than a compile error, which is maddening to debug.

**Jsoup on the IO dispatcher.** Fetching OG tags blocks on network I/O, which means it must run on `Dispatchers.IO` inside a `withContext` block. Missing this causes a `NetworkOnMainThreadException` on the first real share, not during development with a mock.

## The export format

Every link can be exported as JSON to the Downloads folder. The format includes all fields—including `tags`, `summary_source`, `read_duration_sec`, and `read_count`—so nothing is lost if you want to move to a different tool or analyse your reading habits elsewhere. The filename is `nexre_export_YYYY-MM-DD.json`. Export uses `MediaStore` on Android 10+ and `File` on older versions.

## What I would do differently

The gradient thumbnail works as a placeholder but a real OG image fetch would make the library feel significantly richer. I deliberately left it out of V1 because Jsoup's image URL extraction is unreliable—many OG images require cookies or JavaScript, and caching remote images adds meaningful complexity. Coil handles it when the URL is available; the infrastructure is there for V2.

The keyword tagger is static. A small trained classifier on the title + description would be more accurate, especially for niche topics the keyword list doesn't cover. Gemini already handles this for Summarize mode—the gap is in Store mode, where you get keyword tags only.

Read duration tracking via a snackbar is blunt. A background timer that starts when you leave the app and stops when you return would be more accurate. The snackbar approach was chosen because it does not require any background service and respects the user's own sense of whether they finished something.

## Closing

The problem I started with—links piling up unread in WhatsApp—is genuinely solved. The Save share target is now my default for anything I want to read later. The library gives me back the context I lost when the link was just a URL in a chat. The weekly chart tells me how much I'm actually reading versus just hoarding.

Building the prototype in Claude Design before touching Kotlin made the implementation session feel like execution rather than exploration. The design decisions were already made. The architecture was planned. The only job left was writing the code—which, with a clear spec, is the easy part.

NexRe is not on the Play Store yet. When it is, the link goes here.
