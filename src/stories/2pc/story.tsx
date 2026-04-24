import type { SceneScript } from "../../types";
import { motivationScene } from "./scenes/motivation";
import { partitionToleranceScene } from "./scenes/partitionTolerance";
import { twoPhaseCommitScene } from "./scenes/twoPhaseCommit";

export const twoPcScenes: SceneScript[] = [
  motivationScene,
  twoPhaseCommitScene,
  partitionToleranceScene,
];
