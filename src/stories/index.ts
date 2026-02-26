import type { SceneScript } from '../types';
import { twoPcScenes } from './2pc/story';

export type StoryModule = {
  id: string;
  title: string;
  scenes: SceneScript[];
};

export const storyRegistry: Record<string, StoryModule> = {
  '2pc': {
    id: '2pc',
    title: 'Two-Phase Commit (2PC)',
    scenes: twoPcScenes,
  },
};

export function getPathStoryId(pathname: string): string | undefined {
  const [first] = pathname.split('/').filter(Boolean);
  return first && storyRegistry[first] ? first : undefined;
}

export function listStories(): StoryModule[] {
  return Object.values(storyRegistry);
}

export function resolveStoryFromPath(pathname: string): StoryModule {
  const storyId = getPathStoryId(pathname);
  if (storyId) return storyRegistry[storyId];
  return storyRegistry['2pc'];
}
