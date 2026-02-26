export function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * clamp01(t);
}

export function segment(progress: number, start: number, end: number) {
  if (end <= start) return progress >= end ? 1 : 0;
  return clamp01((progress - start) / (end - start));
}

export function pointBetween(
  from: { x: number; y: number },
  to: { x: number; y: number },
  t: number,
) {
  return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) };
}
