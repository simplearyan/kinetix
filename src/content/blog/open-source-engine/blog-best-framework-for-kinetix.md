---
title: "Which Framework is Best for Kinetix? (React vs. Svelte vs. Vue)"
description: "The Commercial Open Source Playbook for Kinetix"
pubDate: 2026-01-20
tags: ["tutorial", "open-source", "react", "svelte", "video-engine"]
---

**Subtitle: Choosing the Right Stack for Your Next Video Startup**

We get asked this a lot: *"Kinetix is vanilla JS, so which framework should I use to build my Video Editor?"*

While Kinetix works with anything (even jQuery!), for a startup trying to build a product fast, the choice matters.

Here is our analysis of the top contenders.

---

## 1. React (The Recommended Choice)

We frankly recommend **React** for 90% of startups.

### Why?
1.  **Velocity**: You are building a *Video Editor*. You need sliders, color pickers, timelines, and modals. React has the richest ecosystem of these components (Radix UI, Shadcn, MUI). You don't want to build a Color Picker from scratch.
2.  **The `useRef` Pattern**: React's `useRef` creates a perfect boundary between the "Declarative UI" and the "Imperative Engine".
    ```tsx
    // It's clean and predictable
    const engineRef = useRef<Engine>(null);
    useEffect(() => { engineRef.current = new Engine(...) }, []);
    ```
3.  **Talent**: It is easiest to hire React developers.

### The Gotcha
React re-renders. If you trigger a React render every time the video timeline progresses (60fps), your UI will lag.
**Fix**: Don't store the "Current Time" in React State. Store it in the Engine, and only update React when the user *pauses*.

---

## 2. Svelte (The Performance Choice)

If you are obsessed with performance or targeting low-end devices, **Svelte** is a compelling alternative.

### Why?
1.  **No Virtual DOM**: Svelte updates the DOM directly. This overhead reduction is noticeable when you have a timeline with 1,000 clips.
2.  **Reactivity**: Svelte's stores (`$store`) map incredibly well to Engine properties.
    ```javascript
    // Svelte
    $: if (engine) engine.scene.getObject('text').text = $inputValue;
    ```

### The Cons
The ecosystem is smaller. You might have to build your own Timeline component.

---

## 3. Vue 3 (The Balanced Choice)

Vue's Composition API ([setup()](file:///d:/Code/Antigravity/design_concepts/kinetix/src/open-source-engine/src/core/InteractionManager.ts#23-34)) is very similar to React, and its Reactivity system (Proxies) is more performant than React's `useState`.

It is a great middle ground, but we find most teams are either "React Experts" or "Svelte Enthusiasts".

---

## Conclusion: Start with React

For a startup, **Speed to Market** is the only metric.
-   Use **React**.
-   Use **Shadcn UI** for the interface.
-   Use **Kinetix** for the canvas.

You will have a working MVP in days, not weeks.
