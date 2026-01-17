---
title: "How to Get Sponsored: Analyzing Remotion & MediaBunny"
description: "The Commercial Open Source Playbook for Kinetix"
pubDate: 2026-01-20
tags: ["tutorial", "open-source", "react", "svelte", "video-engine"]
---


To understand this, we analyzed **Remotion** (a Platform) and **MediaBunny** (a Library). They have completely different models.

---

## 1. The Remotion Model (The "Platform" Play)

Remotion is a multi-million dollar business. They do **not** run on "Sponsorships" (Donations). They run on **Licensing**.

### Why Companies Pay Remotion
Companies don't pay because "they like open source". They pay because **Remotion makes them money**.
-   **Use Case**: A company like Uber wants to send 10 million personalized "Year in Review" videos.
-   **The Pain**: Building a rendering engine costs $200k in engineering salaries.
-   **The Solution**: Pay Remotion $500/month for a license. It's cheaper than hiring an engineer.

### How They Monetize
1.  **Dual Licensing** (The key to their success):
    -   **Free**: For individuals, OSS projects, and small startups (<3 employees).
    -   **Paid**: Companies with >3 employees **MUST** buy a "Company License".
2.  **Infrastructure (Remotion Lambda)**:
    -   They built a service to render videos on AWS Lambda.
    -   They charge a markup or require a license to use this efficient tech.

**Takeway**: You won't get "Sponsors". You will get **Customers** who pay for a "Commercial License" to use Kinetix in their SaaS.

---

## 2. The MediaBunny Model (The "Component" Play)

MediaBunny (by Vanilagy) is a technical marvel—"FFmpeg for the Web".

### Why People Sponsor It
-   **Technical Gratitude**: Developers use it, realize how hard it was to build (MUXing bits manually), and donate $5-$50/month as a "Thank You".
-   **Influence**: Sponsors might want to influence the roadmap ("Please add MP3 support").

**The Reality**: This model rarely builds a large company. It pays for servers and coffee, but not a team.

---

## 3. Your Strategy for Kinetix

If you want to build a business, **Copy Remotion**, don't copy MediaBunny.

### Step 1: The License (The "Fair Source" Model)
Change your license from MIT to a **limit-based license**.
-   "Free for personal use & startups under $50k revenue."
-   "$99/mo for commercial SaaS products."

### Step 2: Solve a "Money Problem"
Don't just sell "Text Animation". Sell **"Automated Marketing"**.
-   If a Real Estate company uses Kinetix to auto-generate video tours from photos, they will happily pay you $500/mo.
-   **Pitch**: "Kinetix is the engine for your AI Video SaaS."

### Step 3: Sell "The Hard Stuff" (Cloud Rendering)
Your "Headless CLI" (from our previous Roadmap) is your product.
-   Give the *Canvas SDK* away for free (MIT).
-   Sell the *Cloud Renderer* (API) that converts that JSON to MP4 on a server.
-   **Why?** Browsers crash. Servers scale. Startups will pay you to handle the crashing.

## Conclusion

**Don't ask for Sponsorships.**
Startups don't sponsor; they buy tools.
Position Kinetix as **"The Enterprise Video Engine"**, make it free for hackers, and charge the companies who build businesses on top of you.
