# Product

## What Feelo is

Feelo is a mood-first, swipe-based recommender for what to watch next. Instead of scrolling three different streaming apps and still not deciding, you tell Feelo how you feel and swipe through a deck of movies and shows curated for that mood, filtered to the platforms you actually subscribe to. Swipe right on something and Feelo shows you an "It's a match!" screen with a one-tap link into the platform that has it.

Think Tinder, but the thing you're swiping on is "what am I in the mood to watch tonight."

## Who it's for

People who subscribe to two or more streaming platforms and routinely lose 15–20 minutes to "decision fatigue" before watching anything — scrolling endlessly through rows of thumbnails that all start to look the same. Feelo is for the moment right before that scroll starts: you already know how you feel, you just don't know what matches it.

## Problem it solves

- **Choice paralysis.** Catalogs are huge; browsing by genre or "trending" doesn't map to how people actually decide what to watch.
- **Fragmentation.** What you want to watch is scattered across platforms, and each platform only recommends from its own catalog.
- **Mood-blind recommendations.** Recommendation engines optimize for watch history, not "what do I feel like right now" (wants a laugh vs. wants to cry vs. wants background noise vs. wants a thriller).
- **Passive vs. active discovery.** Swiping is a lightweight, low-commitment way to react to options one at a time, instead of evaluating a whole grid at once.

## MVP features

1. **Onboarding** — pick which streaming platforms you subscribe to (Netflix, Prime Video, Disney+, HBO Max, etc.) and swipe on a handful of popular titles to seed a first taste profile.
2. **Mood check-in** — before a swipe session, pick a mood from a fixed set (e.g. *want a laugh*, *need a cry*, *something light*, *want to think*, *need tension/adrenaline*, *feeling nostalgic*).
3. **Swipe deck** — a card stack of titles filtered by current mood + owned platforms. Swipe left (not now), right (interested → watchlist), up (loved it / strong signal).
4. **Match screen** — a "It's a match!" moment on a right/up swipe, with a direct link to open the title on its platform.
5. **Watchlist** — everything you've swiped right/up on, grouped by platform, so you can act on it later.
6. **Taste profile (basic)** — swipe history per user per mood, used to bias which titles show up next (more of what worked, less of what got rejected).

## Out of scope (for now)

- Social features: matching with friends, shared/co-op swipe sessions, group decisions.
- Watch-together / synchronized viewing.
- Real-time catalog sync via official platform APIs — v1 works off a manually seeded/static title catalog, since real-time licensing data typically requires paid partner access.
- Ratings/reviews written by users.
- Recommendations informed by actual watch history pulled from streaming accounts (no OAuth into Netflix/Prime/etc. accounts in v1).
- Multiple profiles per household/account.

## Success metrics

- **Match rate**: % of swipe sessions that end with at least one right/up swipe.
- **Match rate per mood**: which moods are well served by the catalog vs. which ones run dry.
- **Return rate**: swipe sessions per user per week.
- **Watchlist follow-through**: % of watchlist items later marked as watched (once that's tracked).
- **Time-to-decision**: proxy for whether Feelo actually beats "endless scrolling" — how long a session takes from mood check-in to first right/up swipe.
