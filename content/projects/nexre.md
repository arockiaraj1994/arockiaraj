---
title: "NexRe: A Read-It-Later App for Links I Never Read"
date: 2026-05-07T00:01:00+05:30
draft: false
description: "How sending links to myself on WhatsApp, and never reading them, turned into an Android read-it-later app with Gemini summaries."
tags: ["android", "kotlin", "jetpack-compose", "room", "workmanager", "hilt", "firebase", "gemini", "nexre", "claude-design"]
featureimage: "/images/nexre/app/app_home_page.png"
images: ["/images/nexre/app/app_home_page.png"]  # og:image for link previews
---

I have a habit. When I come across something interesting (a GitHub repo, an arXiv paper, a LinkedIn post, a dev.to article), I share it to myself on WhatsApp. Sometimes Telegram. The idea is always the same: I'll read it later.

I never do.

<!--more-->

The links pile up. There is no organisation. No way to know what I have already read. No tagging, no tracking, no memory. Just an endless scroll of URLs mixed in with actual conversations, collecting dust.

I looked for an app that solved this. Pocket exists. Instapaper exists. They are fine tools, but they felt like overkill for what I wanted: something lightweight, private, on-device, with no account, no sync to a server I don't control, and ideally some AI intelligence layered on top without requiring a separate subscription. Nothing fit well enough.

So I built it.

## The problem, more precisely

The core issue is not that I save too many links. It is that saving has zero friction and reading has infinite friction.

Sharing a link to WhatsApp takes two taps. Reading it later requires: remembering you saved it, scrolling back through a chat to find it, remembering why it seemed interesting, and then actually opening it. By that point, the context is gone and the motivation has evaporated.

What I needed was a system that:

1. **Makes saving completely invisible.** I share it, it's saved, done. No UI opens. No confirmation flow to tap through.
2. **Makes reading feel worth it.** Show me what the link is about before I click. Give me context, not just a URL.
3. **Tracks what I've actually read,** so I can stop saving things I've already seen.

The Android share sheet is the right entry point. It's already the universal "send this somewhere" gesture. I just needed to become a destination in it. Twice.

## The design came first

Before writing a single line of Kotlin, I used **Claude Design** to mock up the full app. I had a detailed spec in my head (two share modes, six screens, swipe gestures, source badges for GitHub, LinkedIn, arXiv, and so on), and I wanted to see it rendered before committing to code.

The conversation with the design tool was iterative. I answered questions about navigation style (bottom nav, four tabs), card density (compact default), read state treatment (coloured dot for unread, greyed-out card for read), tag layout, library filters, and whether to show a mini chart on the home screen. The AI made decisions where I had no strong opinion: the Topics screen layout, the polish extras, the summary anatomy.

What came out was a hi-fi clickable React prototype: Home, Library, Topics, Search, Detail, and Settings screens, plus an onboarding carousel and a simulated Android share sheet showing both NexRe options. The design established the accent colour (deep indigo, `#3B4ACC`), the source badge system, the gradient thumbnail approach (no real OG image fetching in V1, just a deterministic gradient from the URL hash), and the swipe-to-dismiss interaction.

Having that prototype as a reference made the implementation session much faster. I wasn't making design decisions during code. I was executing against a reference.

## Two share targets, two behaviours

The most interesting architectural decision in NexRe is having two separate entries in the Android share sheet.

**NexRe Save** is completely silent. You share a URL, the activity receives it, enqueues a WorkManager job, and immediately calls `finish()`. The app never opens. A few seconds later, a quiet notification appears: `Saved: <title>`. The WorkManager job fetches OG tags (title, description, image URL) using Jsoup, detects the source platform from the URL domain, applies keyword-based auto-tags, and writes everything to Room. That is the entire flow.

**NexRe Summarize** opens a transparent activity that hosts a modal bottom sheet over whatever app you were in. It does not feel like launching an app. It feels like a popup. The bottom sheet shows a loading state while it sends the link to a Firebase Cloud Function. The function fetches the page itself, asks **Gemini** for a summary with a structured prompt, and returns a few bullet points and suggested tags. You see the title, summary, and tag chips. You can tap Save, and it is stored with the summary attributed to Gemini. Then the sheet dismisses and you are back where you started.

The fallback chain for Summarize matters: not signed in → a prompt to sign in. No AI summaries left → an option to add more. No internet → offer to just save without summary. Gemini failure or quota hit → save with the OG description as the summary, flag `summary_source = OG_META`. Paywalled article with no extractable body → use OG description only, auto-tag as `paywalled`.

This two-target design came directly from a real UX observation: most of the time I just want to save something quickly and not think about it. But occasionally I want to understand something before I commit to reading it. Having both modes without having to configure anything per-save is the right default.

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin: 24px 0;">
  <div style="flex: 1; min-width: 200px; text-align: center;">
    <img src="/images/nexre/app/share_sheet.webp" alt="NexRe: Android share sheet showing both Save and Summarize targets" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
    <p class="img-caption">Android share sheet with both NexRe targets visible</p>
  </div>
  <div style="flex: 1; min-width: 200px; text-align: center;">
    <img src="/images/nexre/app/app_share_summary.webp" alt="NexRe: Summarize bottom sheet over the calling app" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
    <p class="img-caption">The Summarize bottom sheet floats over the calling app</p>
  </div>
</div>

## The data model

The `links` table captures everything that matters for reading behaviour:

- The usual metadata: `url`, `title`, `description`, `thumbnail_url`, `source_platform`
- Status lifecycle: `UNREAD` → `READ` → `ARCHIVED`
- AI provenance: `summary` and `summary_source` (`NONE`, `OG_META`, or `GEMINI`)
- Reading analytics: `opened_at`, `read_duration_sec`, `read_count`
- Personal layer: `personal_note`, `is_favourite`

Tags live in their own normalised tables (`tags` and a `link_tags` junction) with a `source` column tracking whether a tag came from keyword matching or Gemini. This matters for knowing whether to trust a tag or treat it as a suggestion.

Source platform detection is just URL domain matching: `github.com` → `GITHUB`, `linkedin.com` → `LINKEDIN`, `twitter.com` / `x.com` → `TWITTER`, `arxiv.org` → `RESEARCH`, and so on. Nothing clever, entirely reliable.

Keyword auto-tagging applies when Gemini is not involved. A predefined map checks the title and description for terms like "Android", "Kotlin", "Compose" → tag `Android`, or "AI", "LLM", "GPT" → tag `AI`. Lowercase stored, title-case displayed.

## The six screens

**Home** is newest-first: unread and recently read links, a weekly bar chart showing reads per day, and a badge on the bottom nav showing the unread count. Swipe right to mark read (green reveal), swipe left to archive (orange reveal). The share sheet is the main way in, but there is also an add button with a Paste option for links you copied.

**Library** has a filter tab bar: All, Unread, Read, Archived, Favourites. A sort toggle switches between date saved and recently opened. Same card layout throughout.

**Topics** lists every tag with its unread count and total count, sorted by unread descending. Tap a tag to see a filtered Library view. Long press gives options to rename, merge, or delete the tag.

**Search** is a full-screen overlay with a SearchBar. It queries across title, description, personal note, URL, and tag names. All local, no server. Recent searches are stored in DataStore.

**Detail** is where the reading context lives: hero thumbnail, source badge, full summary with its provenance label ("Summary by Gemini" or "Auto-summary"), editable tag chips, a personal note text field, favourite toggle, and a stats row showing saved date, open count, and total read time. The primary action is **Read article**, which opens the built-in reader (more on that below). When you return to the app, a snackbar asks "Did you finish reading?" Tap Yes to mark it read, or ignore it to leave it unread. This is the only read-tracking mechanism. No browser hooks, no background timers.

**Settings** covers your account and cloud backup, AI summaries, appearance (light, dark or follow the system), reader theme and text size, daily reminder and weekly digest notifications, JSON export to Downloads, and a danger zone at the bottom for the actions that delete data.

The **onboarding carousel** is three screens shown only on first launch, tracked via DataStore. Once you tap Get Started, it never appears again.

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin: 24px 0;">
  <div style="flex: 1; min-width: 160px; text-align: center;">
    <img src="/images/nexre/app/app_home_page.webp" alt="NexRe home screen" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
    <p class="img-caption">Home</p>
  </div>
  <div style="flex: 1; min-width: 160px; text-align: center;">
    <img src="/images/nexre/app/app_library.webp" alt="NexRe library screen" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
    <p class="img-caption">Library</p>
  </div>
  <div style="flex: 1; min-width: 160px; text-align: center;">
    <img src="/images/nexre/app/app_topics.webp" alt="NexRe topics screen" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
    <p class="img-caption">Topics</p>
  </div>
  <div style="flex: 1; min-width: 160px; text-align: center;">
    <img src="/images/nexre/app/app_setting.webp" alt="NexRe settings screen" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" decoding="async" />
    <p class="img-caption">Settings</p>
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
| Tablets | Compose adaptive layouts (two-pane) |
| JSON | Moshi |
| Browser | Chrome Custom Tabs, for videos and pages the reader can't show |
| HTML parsing | Jsoup, Readability4J for the reader |
| Image loading | Coil |
| Preferences | DataStore |
| Account and sync | Firebase Auth (Google Sign-In) + Firestore |
| AI summaries | Python Cloud Functions calling Gemini 2.5 Flash-Lite on Vertex AI |
| Screenshot tests | Roborazzi |

There is no API key in the app anymore. The first version asked you to paste your own Gemini key into Settings, which is a lot to ask of someone who just wants to save a link. Now every summary goes through a Cloud Function, `summarize_link`, which calls Gemini 2.5 Flash-Lite on Vertex AI with the function's own service account. Before calling the model it checks a cache, checks that the user has summaries left, and applies a daily limit. Article text is capped at about 6,000 tokens. So nobody needs a key, and one heavy user can't run up the bill.

WorkManager uses a custom `NexReWorkerFactory` rather than Hilt's `@HiltWorker` annotation. The factory instantiates workers directly with their injected dependencies, and `NexReApplication` implements `Configuration.Provider` to hand the factory to WorkManager at startup. The auto-initializer is removed from the manifest so WorkManager does not try to self-initialise before the factory is registered.

## What actually made this hard

**The share sheet UX contract.** `StoreActivity` must call `finish()` immediately. Any delay and Android shows the app as "launching", which breaks the invisible-save illusion. The WorkManager job handles everything asynchronously after the activity is gone. Getting the timing right took a few iterations.

**Transparent activity theming.** `SummarizeActivity` uses `android:windowIsTranslucent="true"` and a transparent background so the bottom sheet appears to float over whatever was on screen. If any theme attribute is misconfigured, you get a white flash or a full-screen background instead of a clean popup.

**The M3 SwipeToDismiss API changed.** The original code used `SwipeToDismiss`, `DismissState`, `DismissDirection`, and `rememberDismissState`, all of which were removed in Material 3 1.3+. The replacement API is `SwipeToDismissBox`, `SwipeToDismissBoxState`, `SwipeToDismissBoxValue`, and `rememberSwipeToDismissBoxState`. The composable structure also changed: instead of separate `background` and `dismissContent` lambdas, the new API uses `backgroundContent` and a single trailing content lambda.

**Room `@Relation` with a junction table.** The `LinkWithTags` data class uses `@Relation` + `@Junction` to fetch tags for each link. This only works if the parent and entity columns match exactly what Room expects. Getting the column names wrong produces a silent empty list rather than a compile error, which is maddening to debug.

**Jsoup on the IO dispatcher.** Fetching OG tags blocks on network I/O, which means it must run on `Dispatchers.IO` inside a `withContext` block. Missing this causes a `NetworkOnMainThreadException` on the first real share, not during development with a mock.

## The export format

Every link can be exported as JSON to the Downloads folder. The format includes all fields, including `tags`, `summary_source`, `read_duration_sec`, and `read_count`, so nothing is lost if you want to move to a different tool or analyse your reading habits elsewhere. The filename is `nexre_export_YYYY-MM-DD.json`. Export uses `MediaStore` on Android 10+ and `File` on older versions.

## What changed after V1

The first version was a single-phone app with your own API key. A lot has changed since then:

- **AI without a key.** Summaries run on the server, as described above. You sign in, and the AI button either summarises or tells you what you need.
- **Optional account and cloud backup.** You can use NexRe without an account. If you sign in with Google, your links are backed up to Firestore and synced across your devices. Pull down on Home or Library to fetch changes straight away.
- **A built-in reader.** **Read article** opens the article text inside the app, with Light, Sepia and Dark themes and a text-size slider. The saved text also syncs, so an article still opens if the page has gone or moved behind a paywall.
- **Highlights.** One tap saves a highlight from the reader. You can add a colour and a note, see a link's highlights on its detail screen, and search finds highlight text too.
- **Real page images.** Cards show the page's own image when there is one, and the site's first letter when there isn't, instead of the V1 gradient.
- **A new look.** Navy, coral and cream, a dark theme, and a "Shelf Pick" icon: navy books on a shelf with one coral book leaning out, which is the read NexRe picks for you next.
- **Tablets.** A two-pane layout on tablets, while onboarding and sign-in stay phone-width.
- **Tests I can rerun.** Maestro flows and Roborazzi screenshot tests on phone and tablet emulators. I wrote about that, and how releases now work, in [From 3 Days per Feature to 7 Releases in 2 Days](/posts/from-3-days-per-feature-to-7-releases-in-2-days/).

## What I would do differently

The keyword tagger is static. A small trained classifier on the title + description would be more accurate, especially for niche topics the keyword list doesn't cover. Gemini already handles this for Summarize mode. The gap is in Store mode, where you get keyword tags only.

Read duration tracking via a snackbar is blunt. A background timer that starts when you leave the app and stops when you return would be more accurate. The snackbar approach was chosen because it does not require any background service and respects the user's own sense of whether they finished something.

## Closing

The problem I started with, links piling up unread in WhatsApp, is genuinely solved. The Save share target is now my default for anything I want to read later. The library gives me back the context I lost when the link was just a URL in a chat. The weekly chart tells me how much I'm actually reading versus just hoarding.

Building the prototype in Claude Design before touching Kotlin made the implementation session feel like execution rather than exploration. The design decisions were already made. The architecture was planned. The only job left was writing the code, which is the easy part once the spec is clear.
