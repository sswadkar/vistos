import type { ComponentType } from "react";

export type StoryStepRef = {
  sceneId: string;
  stepIndex: number;
};

export type ClipRange = {
  from: StoryStepRef;
  to: StoryStepRef;
};

export type UrlState = {
  sceneId: string;
  stepIndex: number;
  t: number;
  clip?: ClipRange;
  autoplay: boolean;
  speed: number;
};

export type FrameRenderProps = {
  progress: number;
  reducedMotion: boolean;
};

export type FrameDefinition = {
  id: string;
  label: string;
  narration?: string;
  durationMs?: number;
  loop?: boolean;
  Render: ComponentType<FrameRenderProps>;
};

export type SceneScript = {
  id: string;
  title: string;
  description?: string;
  steps: FrameDefinition[];
};
