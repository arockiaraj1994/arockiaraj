---
title: "From 3 Days per Feature to 7 Releases in 2 Days"
date: 2026-10-16T00:00:00+05:30
lastmod: 2026-10-16T00:00:00+05:30
categories: ["AI"]
tags: ["claude-code", "android", "kotlin", "testing", "remote-control"]
description: "How I went from fighting compile errors to shipping Play Store releases from my phone, with Claude Code, Android emulators and Remote Control"
draft: false
---

Last December I started building an Android app. I had one question in mind: with an AI coding
assistant, can I build an app without knowing the actual programming language?

Here is where I stood. I knew the problem. I knew what I wanted to build. But I had no idea about
Kotlin. I knew programming basics and had working experience in Java and Python, and that was it.

Ten months later the answer is yes. But the road had a few stages, and each one taught me
something.

## Act 1: Copilot and compile errors

I started with Android Studio and set up GitHub Copilot. Since it was all new, there were
compile errors everywhere. I spent around 100 dollars just to bring the app into shape.

Of course there were many design changes along the way. It took **3 days to make one usable
feature** ready for release.

## Act 2: Switching models, then switching tools

As the days went on, things slowly got better. Then came the shocking moment: **when I switched
to Claude models, the number of compile errors dropped a lot.** Same app, same me, a different
model.

There were other tools too, like Cursor, and I switched to Cursor. The release cycle got shorter,
but not by much.

The next breakthrough was Claude Code. Again, the compile errors dropped.

This matches something I wrote earlier: [the tools around a model matter as much as the model
itself](/posts/why-chasing-the-latest-ai-model-misses-the-point/). A tool that can run the build,
read the error and fix it on its own is a very different thing from a tool that only suggests
code.

## Act 3: It builds, but it doesn't ship

Even then, all I had was an APK. No Play Store, no proper releases. Days were moving on and
there were lots of improvements, but the app never left my phone.

The reason was simple: the tools were not mature enough yet. Building an app is one thing.
Testing it on different screens, signing it, meeting the Play Store rules and doing all of that
again for every release is a lot more work.

## Act 4: Giving Claude a phone and a tablet

The change came when I let Claude Code drive Android emulators on my PC: a Pixel 7 phone and a
tablet.

Now Claude does not stop at "it compiles". It builds the app, installs it on both emulators,
uses it, takes screenshots and checks them in light and dark mode.

It found real bugs just by using the app:

- On the tablet, the reader text ran across the whole screen width, about 30 words per line.
- Saving a YouTube link stored another video's description.
- Turning on cloud backup did nothing when the server couldn't be reached. No message, no error.

There was a side win too. I asked Claude to use the app the way a normal user would, and measure
how much each user really costs me in Firebase and AI calls. The answer, roughly ₹0.5, ₹2 and
₹13 per user per month for light, normal and heavy users, is what I used to set my pricing.

## Act 5: Tests I can rerun

Before this, my release checks were taps on fixed screen positions, judged from screenshots by
eye. They worked once and could never be rerun.

So Claude built a proper regression suite:

- **7 Maestro flows** that use the real release APK: onboarding, add and delete a link, the
  reader, highlights, Topics, the phone back button and the tablet two-pane layout. They find
  buttons by their text, not by screen position, so the same flow runs on a phone and a tablet.
- **12 screenshot tests** with Roborazzi, on phone and tablet, light and dark.

One command runs everything on both emulators:

```bash
scripts/regression.sh --build --dark emulator-5554 emulator-5556
```

My favourite part: to prove the tests actually catch something, Claude undid a real fix I had
shipped earlier and ran them again. 4 screenshots failed. With the fix back, all 12 passed. A test
that has never failed doesn't tell you much.

## Act 6: Coding from my phone

This is the part that still feels new to me. Claude Code runs on my PC, next to the emulators. I
talk to it from my phone using Claude Code's **Remote Control** feature.

[![Flow: from my phone I brainstorm, plan and approve over Remote Control; Claude Code on my PC writes the code, builds, tests on phone and tablet emulators, runs the regression suite, opens the PR and releases; I upload to Play Console](/images/nexre/android-release-flow.svg)](/images/nexre/android-release-flow.svg)

From the phone I brainstorm, shape the feature and agree the plan with Claude. Claude does
the work on the PC. I read the pull request and the test
results, and I approve. Then it releases.

In one line: **do a release while you are having your coffee.**

## Act 7: From APK to real releases

Every release now follows the same steps:

1. Bump the version and write the changelog.
2. Tag the release and build a signed APK and AAB from the tag.
3. Check the signing key and the version.
4. Install it over the previous version on both emulators, to be sure an update keeps the data and
   the app still opens.
5. Publish a GitHub release with checksums.

The Play Store did push back once. Play Console rejected an upload because the app targeted
Android API 35, and it now needs 36. Claude moved the app to API 36, and the next upload went
through.

The numbers: **from v1.13.0 to v2.2.0, 7 releases and 23 pull requests in about 2 days.** Back in
December, one feature took me 3 days.

## What I kept in my hands

Fast doesn't mean hands-off. A few things stay with me:

- Claude can't merge a pull request until I've reviewed it.
- Claude can't deploy to production. I do that.
- The Play Console upload is mine.
- Every step is written down in my Redmine tracker: what was planned, what was done, what was
  tested.

It wasn't perfect. Once, while moving a test file, Claude deleted it by mistake. It said so in the
ticket, rewrote the file and ran the checks again. I'd rather have a tool that tells me about its
mistakes than one that hides them.

## Wrapping Up

So, can you build an app without knowing the language?

For me, yes. I can finally release to the Android Play Store, following all the Play Store
rules, without being a Kotlin developer. What I brought was knowing the problem, knowing what I
wanted, and checking the work. The tools did the rest.

The world is moving fast. Really fast. Get your hands wet and be part of the race.
