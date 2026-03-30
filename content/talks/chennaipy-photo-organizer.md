---
title: "Lightning Talk at Chennaipy - Building a Photo Organizer with Python"
date: 2025-11-01T10:00:00+05:30
draft: false
author: "Arockiaraj"
description: "A recap of my lightning talk at the Chennaipy November 2025 meetup - how I built a Python GUI tool to organize 10,000+ photos spread across 930 GB."
tags: ["python", "chennaipy", "open-source", "chatgpt", "github-copilot", "talk"]
categories: ["Talks"]
featuredImage: ""
---

I gave y lightning talk at the Chennaipy November 2025 meetup. Ten minutes on stage, presenting a Python tool I built to solve a personal problem - organizing 15 years of photos scattered across 3 hard disks.

<!--more-->

## The Problem I Presented

Over the last 15 years, I've clicked over 10,000 photos across 22 devices - from basic phones to DSLRs. All of that data was spread across 3 hard disks, taking up 930 GB.

The mess was real. Duplicate files everywhere. Folders named things like "New Folder (3)" and "Camera Upload - Copy". No consistent naming. No way to quickly find a specific photo from a specific trip or year. Every time I needed an old photo, it turned into a 30-minute search through multiple drives.

I tried a few existing tools, but none handled the full problem - deduplication, organization by date, and easy visual comparison - in a single workflow.

## What I Built

Instead of living with the chaos, I built a **Photo/Media Organizer** in Python with a GUI.

The tool does three things well:

- **Duplicate detection** - scans files using metadata and EXIF information to find exact and near-duplicates across drives, without relying on file names alone
- **Date-based organization** - reads the capture date from EXIF data and reorganizes files into a clean year/month folder structure
- **Side-by-side preview** - lets you visually compare two photos before deciding which to keep, which to delete

I built it using ChatGPT and GitHub Copilot. The AI tools helped me move fast - from the EXIF parsing logic to the GUI layout in Tkinter. What would have been a multi-weekend project came together in days.

## The Chennaipy Experience

Chennaipy is Chennai's local Python user group. They run monthly meetups where developers present projects, libraries, and ideas to the community. The format includes both full talks and lightning talks.

I signed up for a lightning talk - 10 minutes, live demo included. Standing up in front of a room full of Python developers and walking through something I built was a different experience from writing code alone. You have to explain not just what the tool does, but why it matters and what choices you made.

The audience asked good questions - about handling RAW files, performance on large directories, and whether the tool could work with cloud storage. That kind of feedback is hard to get any other way.

If you have a side project and a local meetup near you, I'd recommend presenting it. The bar is lower than you think, and the value is higher than you expect.

## Links

- **Source code**: <a href="https://lnkd.in/gSEja8kb" target="_blank">GitHub Repository</a>
- **Community**: <a href="https://chennaipy.org" target="_blank">Chennaipy</a>
