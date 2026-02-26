import { useEffect, useMemo, useRef, useState } from "react";
import { Stage } from "./components/Stage";
import { createPlayerHelpers } from "./lib/player";
import { getPathStoryId, listStories, resolveStoryFromPath } from "./stories";
import type { ClipRange } from "./types";

type PlayerMoment = { sceneId: string; stepIndex: number; t: number };
type PlayerOptions = { clip?: ClipRange; speed: number };

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(media.matches);
    onChange();
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  return reduced;
}

export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const pathStoryId = useMemo(() => getPathStoryId(pathname), [pathname]);
  const isHomeIndex = !pathStoryId;
  const availableStories = useMemo(() => listStories(), []);
  const story = useMemo(() => resolveStoryFromPath(pathname), [pathname]);
  const player = useMemo(() => createPlayerHelpers(story.scenes), [story.id]);
  const initial = useMemo(
    () => player.parseUrlState(window.location.search),
    [player],
  );

  const [moment, setMoment] = useState<PlayerMoment>({
    sceneId: initial.sceneId,
    stepIndex: initial.stepIndex,
    t: initial.t,
  });
  const [options, setOptions] = useState<PlayerOptions>({
    clip: initial.clip,
    speed: initial.speed,
  });
  const [isPlaying, setIsPlaying] = useState(initial.autoplay);
  const [shareOpen, setShareOpen] = useState(false);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [rangeDraft, setRangeDraft] = useState<ClipRange | undefined>(
    () =>
      initial.clip ?? {
        from: { sceneId: initial.sceneId, stepIndex: initial.stepIndex },
        to: { sceneId: initial.sceneId, stepIndex: initial.stepIndex },
      },
  );

  const reducedMotion = usePrefersReducedMotion();
  const rafRef = useRef<number | null>(null);

  const scene = useMemo(
    () => player.getScene(moment.sceneId),
    [player, moment.sceneId],
  );
  const frame = useMemo(
    () => player.getFrame(moment.sceneId, moment.stepIndex),
    [player, moment.sceneId, moment.stepIndex],
  );
  const canNext = player.canAdvance(
    moment.sceneId,
    moment.stepIndex,
    options.clip,
  );
  const canPrev = player.canRetreat(
    moment.sceneId,
    moment.stepIndex,
    options.clip,
  );
  const currentRef = player.currentRef(moment.sceneId, moment.stepIndex);

  const copyText = async (text: string, successLabel: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLabel(successLabel);
    } catch {
      setCopiedLabel("Clipboard copy failed");
    }
  };

  const writeUrl = (
    nextMoment: PlayerMoment,
    mode: "push" | "replace",
    overrides?: Partial<PlayerOptions>,
    autoplayOverride?: boolean,
  ) => {
    const nextOptions = { ...options, ...overrides };
    const search = player.buildSearch({
      sceneId: nextMoment.sceneId,
      stepIndex: nextMoment.stepIndex,
      t: nextMoment.t,
      clip: nextOptions.clip,
      autoplay: autoplayOverride ?? isPlaying,
      speed: nextOptions.speed,
    });
    const nextUrl = `${window.location.pathname}${search}`;
    if (mode === "push") window.history.pushState(null, "", nextUrl);
    else window.history.replaceState(null, "", nextUrl);
  };

  const commitMoment = (
    next: PlayerMoment,
    mode: "push" | "replace",
    opts?: { pause?: boolean; optionOverrides?: Partial<PlayerOptions> },
  ) => {
    const clip = opts?.optionOverrides?.clip ?? options.clip;
    const clamped = player.clampToClip(next.sceneId, next.stepIndex, clip);
    const safe: PlayerMoment = {
      sceneId: clamped.sceneId,
      stepIndex: clamped.stepIndex,
      t: Math.min(1, Math.max(0, next.t)),
    };
    if (opts?.optionOverrides)
      setOptions((prev) => ({ ...prev, ...opts.optionOverrides }));
    const nextAutoplay = opts?.pause ? false : isPlaying;
    if (opts?.pause) setIsPlaying(false);
    setMoment(safe);
    writeUrl(safe, mode, opts?.optionOverrides, nextAutoplay);
  };

  useEffect(() => {
    if (isHomeIndex) return;
    const normalized = player.buildSearch({
      sceneId: moment.sceneId,
      stepIndex: moment.stepIndex,
      t: moment.t,
      clip: options.clip,
      autoplay: isPlaying,
      speed: options.speed,
    });
    if (window.location.search !== normalized) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${normalized}`,
      );
    }
    // intentionally once for normalization on load per story mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, isHomeIndex]);

  useEffect(() => {
    const onPopState = () => {
      const nextPath = window.location.pathname;
      setPathname(nextPath);
      const nextStory = resolveStoryFromPath(nextPath);
      const nextPlayer = createPlayerHelpers(nextStory.scenes);
      const parsed = nextPlayer.parseUrlState(window.location.search);
      setMoment({
        sceneId: parsed.sceneId,
        stepIndex: parsed.stepIndex,
        t: parsed.t,
      });
      setOptions({ clip: parsed.clip, speed: parsed.speed });
      setIsPlaying(parsed.autoplay);
      setRangeDraft(
        parsed.clip ?? {
          from: { sceneId: parsed.sceneId, stepIndex: parsed.stepIndex },
          to: { sceneId: parsed.sceneId, stepIndex: parsed.stepIndex },
        },
      );
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (isHomeIndex) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName)
      )
        return;
      if (e.key === "ArrowRight") {
        if (!canNext) return;
        e.preventDefault();
        commitMoment(
          {
            ...player.nextPosition(
              moment.sceneId,
              moment.stepIndex,
              options.clip,
            ),
            t: 0,
          },
          "push",
          { pause: true },
        );
      } else if (e.key === "ArrowLeft") {
        if (!canPrev) return;
        e.preventDefault();
        commitMoment(
          {
            ...player.prevPosition(
              moment.sceneId,
              moment.stepIndex,
              options.clip,
            ),
            t: 0,
          },
          "push",
          { pause: true },
        );
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    player,
    moment.sceneId,
    moment.stepIndex,
    options.clip,
    canNext,
    canPrev,
    isHomeIndex,
  ]);

  useEffect(() => {
    if (isHomeIndex) return;
    writeUrl(moment, "replace");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, isHomeIndex]);

  useEffect(() => {
    setCopiedLabel(null);
  }, [moment.sceneId, moment.stepIndex, moment.t]);

  useEffect(() => {
    if (isHomeIndex) return;
    const isLoopingFrame = Boolean(frame.loop);
    const shouldAnimateCurrentFrame = isLoopingFrame || isPlaying || moment.t < 1;
    if (!shouldAnimateCurrentFrame) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    const durationMs = player.getStepDurationMs(
      moment.sceneId,
      moment.stepIndex,
      reducedMotion,
      options.speed,
    );
    const start = performance.now() - moment.t * durationMs;

    const tick = (now: number) => {
      const elapsedProgress = (now - start) / durationMs;
      const progress = isLoopingFrame
        ? ((elapsedProgress % 1) + 1) % 1
        : Math.min(1, elapsedProgress);
      setMoment((prev) => {
        if (
          prev.sceneId !== moment.sceneId ||
          prev.stepIndex !== moment.stepIndex
        )
          return prev;
        return { ...prev, t: progress };
      });

      if (isLoopingFrame) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (progress >= 1) {
        const next = player.nextPosition(
          moment.sceneId,
          moment.stepIndex,
          options.clip,
        );
        if (!isPlaying) {
          setMoment((prev) => ({ ...prev, t: 1 }));
          return;
        }

        if (
          next.sceneId === moment.sceneId &&
          next.stepIndex === moment.stepIndex
        ) {
          setIsPlaying(false);
          setMoment((prev) => ({ ...prev, t: 1 }));
          writeUrl(
            { sceneId: moment.sceneId, stepIndex: moment.stepIndex, t: 1 },
            "replace",
            undefined,
            false,
          );
          return;
        }
        commitMoment({ ...next, t: 0 }, "push");
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [
    player,
    frame.loop,
    isPlaying,
    moment.sceneId,
    moment.stepIndex,
    reducedMotion,
    options.clip,
    options.speed,
    isHomeIndex,
  ]);

  if (isHomeIndex) {
    return (
      <div className="min-h-screen bg-figmaBg text-figmaInk px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-figmaDark">
            Vistos
          </h1>
          <p className="mt-2 text-sm text-figmaMuted">
            Concepts/Algos that I've built visualizations for.
          </p>

          <div className="mt-6 grid gap-3">
            {availableStories.map((s) => (
              <a
                key={s.id}
                href={`${s.id}/`}
                className="block rounded-xl border border-slate-300/80 bg-white/70 px-4 py-3 shadow-sm hover:bg-white"
                title={`Open ${s.title}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-figmaDark">
                      {s.title}
                    </div>
                    <div className="text-xs text-figmaMuted">/{s.id}/</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-figmaBg text-figmaInk grid grid-rows-[1fr_auto] items-center justify-items-center gap-2.5 px-3 pt-2.5 pb-4">
      <Stage
        scene={scene}
        frame={frame}
        progress={moment.t}
        reducedMotion={reducedMotion}
      />

      <div className="relative w-full max-w-[1280px] flex justify-center">
        {shareOpen ? (
          <div className="absolute bottom-[calc(100%+10px)] left-1/2 z-20 w-[min(660px,calc(100vw-24px))] -translate-x-1/2 rounded-xl border border-slate-300/80 bg-white/85 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <div className="text-sm font-semibold text-figmaDark">
                Link tools
              </div>
              <button
                type="button"
                className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 enabled:hover:bg-slate-200"
                onClick={() => setShareOpen(false)}
                title="Close link tools"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 border-t border-slate-300/70 px-3 py-3">
              <div className="grid gap-1 text-xs text-figmaMuted">
                <div>
                  Current visualization:{" "}
                  <span className="font-semibold text-figmaDark">
                    {story.title}
                  </span>
                </div>
                <div>
                  Current frame:{" "}
                  <span className="font-semibold text-figmaDark">
                    {player.formatRef(currentRef)}
                  </span>
                </div>
                <div>
                  Mark a start and end, then copy a range link. Range links
                  always open at the selected start frame.
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-slate-300/70 bg-white/60 p-2.5">
                <div className="text-xs font-semibold uppercase tracking-wide text-figmaMuted">
                  Select Range
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-md bg-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 enabled:hover:bg-slate-300"
                    title="Set the range start to the current frame"
                    onClick={() =>
                      setRangeDraft((prev) => {
                        const next = {
                          from: currentRef,
                          to: prev?.to ?? currentRef,
                        };
                        const normalized = player.normalizeRange(next);
                        const currentIsAfterPrevEnd =
                          normalized.from.sceneId !== currentRef.sceneId ||
                          normalized.from.stepIndex !== currentRef.stepIndex;
                        return currentIsAfterPrevEnd
                          ? { from: currentRef, to: currentRef }
                          : next;
                      })
                    }
                  >
                    Use current as start
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 enabled:hover:bg-slate-300"
                    title="Set the range end to the current frame"
                    onClick={() =>
                      setRangeDraft((prev) => {
                        const next = {
                          from: prev?.from ?? currentRef,
                          to: currentRef,
                        };
                        const normalized = player.normalizeRange(next);
                        const currentIsBeforePrevStart =
                          normalized.to.sceneId !== currentRef.sceneId ||
                          normalized.to.stepIndex !== currentRef.stepIndex;
                        return currentIsBeforePrevStart
                          ? { from: currentRef, to: currentRef }
                          : next;
                      })
                    }
                  >
                    Use current as end
                  </button>
                </div>
                <div className="grid gap-1 text-xs text-figmaMuted">
                  <div>
                    Start:{" "}
                    <span className="font-semibold text-figmaDark">
                      {rangeDraft ? player.formatRef(rangeDraft.from) : "-"}
                    </span>
                  </div>
                  <div>
                    End:{" "}
                    <span className="font-semibold text-figmaDark">
                      {rangeDraft ? player.formatRef(rangeDraft.to) : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-slate-300/70 bg-white/60 p-2.5">
                <div className="text-xs font-semibold uppercase tracking-wide text-figmaMuted">
                  Copy Links
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-md bg-figmaArrow px-2.5 py-1.5 text-xs font-semibold text-figmaArrowInk enabled:hover:bg-slate-300"
                    title="Copy a link to the current frame and current in-frame progress"
                    onClick={async () => {
                      const url = `${window.location.origin}${window.location.pathname}${player.buildSearch(
                        {
                          sceneId: moment.sceneId,
                          stepIndex: moment.stepIndex,
                          t: moment.t,
                          clip: undefined,
                          autoplay: false,
                          speed: options.speed,
                        },
                      )}`;
                      await copyText(url, "Copied moment link");
                    }}
                  >
                    Copy moment link
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-figmaArrow px-2.5 py-1.5 text-xs font-semibold text-figmaArrowInk enabled:hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Copy a range-clamped link that opens at the selected range start"
                    onClick={async () => {
                      if (!rangeDraft) return;
                      const normalized = player.normalizeRange(rangeDraft);
                      const startRef = normalized.from;
                      const url = `${window.location.origin}${window.location.pathname}${player.buildSearch(
                        {
                          sceneId: startRef.sceneId,
                          stepIndex: startRef.stepIndex,
                          t: 0,
                          clip: normalized,
                          autoplay: false,
                          speed: options.speed,
                        },
                      )}`;
                      await copyText(url, "Copied range link");
                    }}
                    disabled={!rangeDraft}
                  >
                    Copy range link (opens at start)
                  </button>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-slate-300/70 bg-white/60 p-2.5">
                <div className="text-xs font-semibold uppercase tracking-wide text-figmaMuted">
                  Range Actions
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 enabled:hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Apply the selected range and jump to the start frame"
                    onClick={() => {
                      const normalized = rangeDraft
                        ? player.normalizeRange(rangeDraft)
                        : undefined;
                      const startRef = normalized?.from ?? currentRef;
                      commitMoment(
                        {
                          sceneId: startRef.sceneId,
                          stepIndex: startRef.stepIndex,
                          t: 0,
                        },
                        "push",
                        {
                          pause: true,
                          optionOverrides: { clip: normalized },
                        },
                      );
                    }}
                    disabled={!rangeDraft}
                  >
                    Apply range (jump to start)
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 enabled:hover:bg-slate-200"
                    title="Remove any active range and reset the draft range to the current frame"
                    onClick={() => {
                      setRangeDraft({ from: currentRef, to: currentRef });
                      commitMoment({ ...moment, t: 0 }, "push", {
                        pause: true,
                        optionOverrides: { clip: undefined },
                      });
                    }}
                  >
                    Clear range
                  </button>
                </div>
              </div>

              <div className="text-xs text-figmaMuted">
                Cross-scene ranges use{" "}
                <code className="font-mono text-[11px] text-figmaDark">
                  from=scene:step&amp;to=scene:step
                </code>
                . Same-scene ranges use{" "}
                <code className="font-mono text-[11px] text-figmaDark">
                  clip=scene:start-end
                </code>
                .
                {copiedLabel ? (
                  <span className="ml-2 font-semibold text-figmaDark">
                    {copiedLabel}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-300/70 bg-white/50 px-2 py-1.5 shadow-sm">
          <div
            className="inline-grid grid-flow-col gap-0.5"
            aria-label="Frame navigation"
          >
            <button
              type="button"
              className="grid h-10 w-[54px] place-items-center rounded-[7px] bg-figmaArrow text-figmaArrowInk text-[1.8rem] leading-none disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-slate-300"
              onClick={() =>
                canPrev &&
                commitMoment(
                  {
                    ...player.prevPosition(
                      moment.sceneId,
                      moment.stepIndex,
                      options.clip,
                    ),
                    t: 0,
                  },
                  "push",
                  { pause: true },
                )
              }
              disabled={!canPrev}
              aria-label="Previous frame"
              title="Previous frame (Left Arrow)"
            >
              ←
            </button>
            <button
              type="button"
              className="grid h-10 w-[54px] place-items-center rounded-[7px] bg-figmaArrow text-figmaArrowInk text-[1.8rem] leading-none disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-slate-300"
              onClick={() =>
                canNext &&
                commitMoment(
                  {
                    ...player.nextPosition(
                      moment.sceneId,
                      moment.stepIndex,
                      options.clip,
                    ),
                    t: 0,
                  },
                  "push",
                  { pause: true },
                )
              }
              disabled={!canNext}
              aria-label="Next frame"
              title="Next frame (Right Arrow)"
            >
              →
            </button>
          </div>

          <button
            type="button"
            className="rounded-md bg-slate-100 px-2.5 py-2 text-xs font-semibold text-slate-700 enabled:hover:bg-slate-200"
            onClick={() => setShareOpen((v) => !v)}
            title="Open share/link tools (moment links, range links, and clip controls)"
          >
            {shareOpen ? "Hide tools" : "Link tools"}
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {story.title} · {scene.title} · {frame.label}
      </p>
    </div>
  );
}
