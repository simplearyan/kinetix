# UX Improvements Plan

## Goal
Enhance the user experience of Kinetix Studio by adding direct canvas manipulation features and keyboard shortcuts, making the application feel more responsive and professional.

## User Review Required
> [!IMPORTANT]
> This plan focuses on "Canvas Interactivity" as the primary UX booster. Please confirm if you would also like to prioritize **Undo/Redo** or **Timeline Interactions** in this batch, or if those should be separate tasks.

## Proposed Changes

### 1. Canvas Interaction - Resize Handles
**Goal:** Allow users to resize objects by dragging the corner handles.
- **Files:** `src/utils/studio/StudioEngine.ts`
- **Changes:**
    - Update `setupInteraction` to detect clicks on handles.
    - Implement resizing logic in the `mousemove` handler.
    - Add cursor updates (change mouse cursor to `nwse-resize`, etc.) based on hover position.

### 2. Canvas Interaction - Visual Feedback
**Goal:** clearly indicate when an object is hoverable or draggable.
- **Files:** `src/utils/studio/StudioEngine.ts`, `src/pages/studio.astro`
- **Changes:**
    - Change cursor to `move` when hovering over a selectable object.
    - Change cursor to `pointer` when hovering over a handle.

### 3. Keyboard Shortcuts
**Goal:** Enable common shortcuts for faster workflow.
- **Files:** `src/utils/studio/StudioEngine.ts` (or `studio.astro` listeners)
- **Changes:**
    - `Delete` / `Backspace`: Remove selected object.
    - `Esc`: Deselect all.
    - `Space`: Toggle Play/Pause.

## Verification Plan
### Manual Verification
- **Resize:** Create a generic object (Text/Chart), click to select, drag corners. Verify size updates correctly.
- **Shortcuts:** Select an object and press `Delete`. Press `Space` to play/pause. Press `Esc` to deselect.
- **Cursors:** Hover over objects and handles to verify cursor changes.
