# Frame Authoring Player (2PC Starter)

Static React + Vite site for authoring step-by-step explainer frames as **real web elements** (React + Tailwind utilities), while the player handles navigation, transitions, and URL state.

This repo is now structured as a **generic frame player** with a **2PC-specific story package**.

## What You Customize

Write each frame individually as a React component.

- Story content: `src/stories/2pc/story.tsx`
- Reusable frame layout/template: `src/stories/2pc/FrameTemplate.tsx`
- Visual primitives/styles: `src/styles.css`
- Motion helpers for in-frame animation timelines: `src/lib/motion.ts`

The player shell handles:

- `scene` + `step` URL deep linking
- scene-local clip ranges (`clip=sceneId:start-end`)
- cross-scene ranges (`from=scene:step&to=scene:step`)
- autoplay (`autoplay=1`) and `speed`
- browser back/forward sync
- keyboard navigation (`←`, `→`, `Space`)
- reduced motion timing

The frame renderer passes a per-frame `progress` value (`0..1`) so you can animate arbitrary visuals inside a frame (e.g. moving a ball/message between nodes).

## Architecture

- Generic player engine: `src/lib/player.ts`
- Generic frame/scene types: `src/types.ts`
- Active story scenes export: `src/data/scenes.ts`
- Minimal stage renderer: `src/components/Stage.tsx`

## Authoring a New Frame

In `src/stories/2pc/story.tsx`, add a new `frame({...})` entry with a custom `visual` function.

Example pattern (Tailwind + animated visual using `progress`):

```tsx
frame({
  id: 'my-frame',
  label: 'My Frame',
  narration: 'Optional caption text shown at the bottom.',
  durationMs: 2400,
  visual: ({ progress, reducedMotion }) => (
    <>
      <div className="absolute left-[30%] top-[22%] w-[20%] aspect-square rounded-full bg-fuchsia-600" />
      <div className="absolute left-[60%] top-[24%] w-[7%] aspect-square rounded-full bg-teal-600" />
      {!reducedMotion ? (
        <div
          className="absolute h-3 w-3 rounded-full bg-teal-600"
          style={{ left: `${45 + progress * 12}%`, top: '30%' }}
        />
      ) : null}
    </>
  ),
})
```

You can also bypass the provided visual primitives and render any custom Tailwind/HTML structure you want.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## URL Parameters

- `scene`: scene id (example: `prepare`)
- `step`: 0-based frame index in scene
- `t`: optional `0..1` frame transition progress (accepted, but generated links now omit it)
- `clip`: `sceneId:start-end` (example: `clip=prepare:0-0`)
- `from` / `to`: cross-scene range bounds (example: `from=prepare:0&to=commit:0`)
- `autoplay=1`: enable autoplay
- `speed=1.25`: playback speed multiplier (clamped)

Examples:

- `/index.html`
- `/index.html?scene=prepare&step=0`
- `/index.html?scene=blocking&step=0&autoplay=1`
- `/index.html?clip=partition:0-0`
- `/index.html?from=prepare:0&to=commit:0`

## Notes

- The current story is **2PC-specific starter content**.
- The engine is generic and can support other topics by swapping `src/data/scenes.ts` to export a different story package.
- Tailwind is currently provided via the CDN script in `index.html` for fast authoring. You can migrate to the Tailwind Vite/PostCSS setup later if you want a production build pipeline.
