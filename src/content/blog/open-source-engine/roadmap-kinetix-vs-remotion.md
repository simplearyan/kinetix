---
title: "Roadmap: Kinetix as the Remotion Killer"
description: "The Commercial Open Source Playbook for Kinetix"
pubDate: 2026-01-20
tags: ["tutorial", "open-source", "react", "svelte", "video-engine"]
--- 

**Mission**: Transform Kinetix from a "Canvas Engine" into the world's best **AI-Native Video Framework**.

Remotion wins on "Code-as-Video". Kinetix will win on **"JSON-as-Video"** (Serialization) and **"Client-Side Performance"**.

## The Gap Analysis

| Feature | Remotion | Kinetix (Current) | The Fix |
| :--- | :--- | :--- | :--- |
| **API Style** | Declarative (`<Sequence>`) | Imperative (`scene.add()`) | Build `@kinetix/react` |
| **Layout** | CSS Flexbox/Grid | Absolute (`x, y`) | Build `FlexLayout` Objects |
| **Rendering** | Headless (Node/Chrome) | Reference Browser | Build `@kinetix/cli` |
| **Data** | Code-driven | JSON-driven | **This is our Moat** |

---

## Phase 1: The React Bridge (Month 1-2)
*Goal: Make Kinetix feel like React code.*

We need a wrapper library that syncs React Component trees to the Canvas Scene Graph.

- [ ] **`@kinetix/react` Package**:
    ```tsx
    <Engine width={1920} height={1080}>
      <Sequence from={0} duration={100}>
        <Text text="Hello" animation="fade" />
      </Sequence>
    </Engine>
    ```
- [ ] **Reconciler**: When React updates props, efficiently update the underlying [KinetixObject](file:///d:/Code/Antigravity/design_concepts/kinetix/src/open-source-engine/src/objects/Object.ts#3-128) without destroying it.

## Phase 2: The Layout Engine (Month 3)
*Goal: Stop calculating partial pixel coordinates manually.*

Remotion uses HTML/CSS, so it gets Flexbox for free. We are on Canvas, so we need to process layout ourselves.

- [ ] **Integrate Yoga Layout**: Use the WASM port of Yoga (the layout engine behind React Native) to calculate positions.
- [ ] **[FlexContainer](file:///d:/Code/Antigravity/design_concepts/kinetix/src/open-source-engine/src/objects/FlexContainer.ts#6-139) Object**:
    ```typescript
    const container = new FlexLayout({
      direction: 'column',
      gap: 20,
      alignItems: 'center'
    });
    container.add(text1);
    container.add(text2); // Automatically stacks below text1
    ```

## Phase 3: The Headless CLI (Month 4)
*Goal: "Release Engineering" for Video.*

Startups need to generate videos via API (e.g., "User signed up -> Generate Welcome Video").

- [ ] **`@kinetix/cli`**: A CLI tool that spins up a headless browser (Puppeteer), loads a project JSON, and dumps an MP4.
    -   `kinetix render project.json --out video.mp4`
- [ ] **Serverless Handler**: A template for deploying this to AWS Lambda or Vercel Functions.

## Phase 4: The "AI-Native" Advantage (Differentiation)
*Goal: Do what Remotion cannot easily do.*

Remotion is code-heavy. It's hard for LLMs to "edit" a React file reliably.
Kinetix is JSON-heavy. LLMs love JSON.

- [ ] **Prompt-to-Video**:
    -   `User Prompt` -> `LLM` -> `Standardized Kinetix JSON` -> [Video](file:///d:/Code/Antigravity/design_concepts/kinetix/src/engine/Core.ts#296-692).
    -   Since our state is fully serializable, we can build the world's best **Text-to-Edit** workflow.

## Summary Checklist

1.  [ ] **Refactor**: Complete the "Smart Scaling" moves (Done).
2.  [ ] **UI Library**: Build the React Components for the Inspector (Inspector is generic, but the wrapper is needed).
3.  [ ] **Layout**: Implement [FlexContainer](file:///d:/Code/Antigravity/design_concepts/kinetix/src/open-source-engine/src/objects/FlexContainer.ts#6-139) (High Priority).
4.  [ ] **Documentation**: Write "Kinetix for Remotion Users" guide.
