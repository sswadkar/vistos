import { ScaledCanvas } from './ScaledCanvas';
import type { FrameDefinition, SceneScript } from '../types';

export function Stage({
  scene,
  frame,
  progress,
  reducedMotion,
}: {
  scene: SceneScript;
  frame: FrameDefinition;
  progress: number;
  reducedMotion: boolean;
}) {
  const Render = frame.Render;
  return (
    <section className="grid w-full max-w-[1280px] place-items-center" aria-label={`${scene.title}: ${frame.label}`}>
      <div
        className="w-full max-w-full aspect-[1512/982]"
        style={{
          width:
            "min(100%, calc((var(--app-viewport-h) - var(--app-chrome-reserve) - var(--app-safe-top) - var(--app-safe-bottom)) * (1512 / 982)))",
        }}
      >
        <ScaledCanvas width={1512} height={982}>
          <Render progress={progress} reducedMotion={reducedMotion} />
        </ScaledCanvas>
      </div>
    </section>
  );
}
