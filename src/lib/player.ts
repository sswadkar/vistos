import type { ClipRange, SceneScript, StoryStepRef, UrlState } from '../types';

const DEFAULT_SPEED = 1;
const DEFAULT_T = 0;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function toInt(raw: string | null): number | null {
  if (raw == null) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

function toFloat(raw: string | null): number | null {
  if (raw == null) return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

export function createPlayerHelpers(allScenes: SceneScript[]) {
  const sceneById = new Map(allScenes.map((scene) => [scene.id, scene]));
  const fallbackScene = allScenes[0]!;

  const getScene = (sceneId: string) => sceneById.get(sceneId) ?? fallbackScene;
  const sceneIndex = (sceneId: string) => Math.max(0, allScenes.findIndex((s) => s.id === sceneId));

  const normalizeRef = (ref: StoryStepRef): StoryStepRef => {
    const scene = getScene(ref.sceneId);
    return { sceneId: scene.id, stepIndex: clamp(ref.stepIndex, 0, scene.steps.length - 1) };
  };

  const compareRefs = (a: StoryStepRef, b: StoryStepRef) => {
    const aScene = sceneIndex(a.sceneId);
    const bScene = sceneIndex(b.sceneId);
    if (aScene !== bScene) return aScene - bScene;
    return a.stepIndex - b.stepIndex;
  };

  const normalizeRange = (range: ClipRange): ClipRange => {
    const from = normalizeRef(range.from);
    const to = normalizeRef(range.to);
    return compareRefs(from, to) <= 0 ? { from, to } : { from: to, to: from };
  };

  const getFrame = (sceneId: string, stepIndex: number) => {
    const scene = getScene(sceneId);
    return scene.steps[clamp(stepIndex, 0, scene.steps.length - 1)]!;
  };

  const parseStepRef = (raw: string | null): StoryStepRef | undefined => {
    if (!raw) return undefined;
    const match = raw.match(/^([a-zA-Z0-9_-]+):(\d+)$/);
    if (!match) return undefined;
    const [, sceneId, stepRaw] = match;
    if (!sceneById.has(sceneId)) return undefined;
    return normalizeRef({ sceneId, stepIndex: Number.parseInt(stepRaw, 10) });
  };

  const parseLegacyClip = (raw: string | null): ClipRange | undefined => {
    if (!raw) return undefined;
    const match = raw.match(/^([a-zA-Z0-9_-]+):(\d+)-(\d+)$/);
    if (!match) return undefined;
    const [, sceneId, startRaw, endRaw] = match;
    if (!sceneById.has(sceneId)) return undefined;
    return normalizeRange({
      from: { sceneId, stepIndex: Number.parseInt(startRaw, 10) },
      to: { sceneId, stepIndex: Number.parseInt(endRaw, 10) },
    });
  };

  const parseRange = (params: URLSearchParams): ClipRange | undefined => {
    const legacy = parseLegacyClip(params.get('clip'));
    const from = parseStepRef(params.get('from'));
    const to = parseStepRef(params.get('to'));
    if (from && to) return normalizeRange({ from, to });
    return legacy;
  };

  const refInRange = (ref: StoryStepRef, range: ClipRange) =>
    compareRefs(ref, range.from) >= 0 && compareRefs(ref, range.to) <= 0;

  const clampToClip = (sceneId: string, stepIndex: number, clip?: ClipRange) => {
    const ref = normalizeRef({ sceneId, stepIndex });
    if (!clip) return ref;
    const range = normalizeRange(clip);
    if (compareRefs(ref, range.from) < 0) return range.from;
    if (compareRefs(ref, range.to) > 0) return range.to;
    return ref;
  };

  const unclippedNext = (sceneId: string, stepIndex: number): StoryStepRef => {
    const idx = sceneIndex(sceneId);
    const scene = allScenes[idx]!;
    if (stepIndex + 1 < scene.steps.length) return { sceneId, stepIndex: stepIndex + 1 };
    const nextScene = allScenes[idx + 1];
    return nextScene ? { sceneId: nextScene.id, stepIndex: 0 } : { sceneId, stepIndex };
  };

  const unclippedPrev = (sceneId: string, stepIndex: number): StoryStepRef => {
    if (stepIndex > 0) return { sceneId, stepIndex: stepIndex - 1 };
    const idx = sceneIndex(sceneId);
    const prevScene = allScenes[idx - 1];
    return prevScene ? { sceneId: prevScene.id, stepIndex: prevScene.steps.length - 1 } : { sceneId, stepIndex };
  };

  const nextPosition = (sceneId: string, stepIndex: number, clip?: ClipRange) => {
    if (!clip) return unclippedNext(sceneId, stepIndex);
    const range = normalizeRange(clip);
    const current = normalizeRef({ sceneId, stepIndex });
    if (compareRefs(current, range.to) >= 0) return range.to;
    const next = unclippedNext(current.sceneId, current.stepIndex);
    return clampToClip(next.sceneId, next.stepIndex, range);
  };

  const prevPosition = (sceneId: string, stepIndex: number, clip?: ClipRange) => {
    if (!clip) return unclippedPrev(sceneId, stepIndex);
    const range = normalizeRange(clip);
    const current = normalizeRef({ sceneId, stepIndex });
    if (compareRefs(current, range.from) <= 0) return range.from;
    const prev = unclippedPrev(current.sceneId, current.stepIndex);
    return clampToClip(prev.sceneId, prev.stepIndex, range);
  };

  const parseUrlState = (search: string): UrlState => {
    const params = new URLSearchParams(search);
    const clip = parseRange(params);

    const requestedSceneId = params.get('scene') ?? fallbackScene.id;
    const sceneId = sceneById.has(requestedSceneId) ? requestedSceneId : fallbackScene.id;
    const scene = getScene(sceneId);
    const rawStep = clamp(toInt(params.get('step')) ?? 0, 0, scene.steps.length - 1);
    const clipped = clampToClip(sceneId, rawStep, clip);

    return {
      sceneId: clipped.sceneId,
      stepIndex: clipped.stepIndex,
      t: clamp(toFloat(params.get('t')) ?? DEFAULT_T, 0, 1),
      clip,
      autoplay: params.get('autoplay') === '1',
      speed: clamp(toFloat(params.get('speed')) ?? DEFAULT_SPEED, 0.25, 4),
    };
  };

  const buildSearch = (state: Pick<UrlState, 'sceneId' | 'stepIndex' | 't' | 'clip' | 'autoplay' | 'speed'>) => {
    const params = new URLSearchParams();
    params.set('scene', state.sceneId);
    params.set('step', String(state.stepIndex));
    if (state.clip) {
      const range = normalizeRange(state.clip);
      if (range.from.sceneId === range.to.sceneId) {
        params.set('clip', `${range.from.sceneId}:${range.from.stepIndex}-${range.to.stepIndex}`);
      } else {
        params.set('from', `${range.from.sceneId}:${range.from.stepIndex}`);
        params.set('to', `${range.to.sceneId}:${range.to.stepIndex}`);
      }
    }
    if (state.autoplay) params.set('autoplay', '1');
    if (Math.abs(state.speed - DEFAULT_SPEED) > 0.001) params.set('speed', state.speed.toFixed(2));
    return `?${params.toString()}`;
  };

  const canAdvance = (sceneId: string, stepIndex: number, clip?: ClipRange) => {
    const next = nextPosition(sceneId, stepIndex, clip);
    return !(next.sceneId === sceneId && next.stepIndex === stepIndex);
  };

  const canRetreat = (sceneId: string, stepIndex: number, clip?: ClipRange) => {
    const prev = prevPosition(sceneId, stepIndex, clip);
    return !(prev.sceneId === sceneId && prev.stepIndex === stepIndex);
  };

  const getStepDurationMs = (sceneId: string, stepIndex: number, reducedMotion: boolean, speed: number) => {
    const base = getFrame(sceneId, stepIndex).durationMs ?? 2200;
    const adjusted = base / Math.max(speed, 0.25);
    return reducedMotion ? Math.min(220, adjusted) : adjusted;
  };

  const formatRef = (ref: StoryStepRef) => `${ref.sceneId}:${ref.stepIndex}`;
  const currentRef = (sceneId: string, stepIndex: number) => normalizeRef({ sceneId, stepIndex });

  return {
    scenes: allScenes,
    getScene,
    getFrame,
    parseUrlState,
    buildSearch,
    clampToClip,
    nextPosition,
    prevPosition,
    canAdvance,
    canRetreat,
    getStepDurationMs,
    normalizeRange,
    currentRef,
    formatRef,
    refInRange,
  };
}
