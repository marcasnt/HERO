// The original openGym catalogue is intentionally reused from the preserved
// frontend source so HERO stays aligned with its exercise IDs and media.
// @ts-expect-error The upstream catalogue is a generated JavaScript asset.
import { EXDB } from "../../frontend/src/lib/exercises-data.js";
// @ts-expect-error Generated Spanish instruction pack from upstream openGym.
import ES_INSTRUCTIONS from "../../frontend/src/instr/es.js";
import { spanishExerciseName } from "./exercise-spanish";

export type CatalogExercise = {
  id: string;
  n: string;
  bp: string;
  eq: string;
  tg: string;
  mg?: string;
  st: string[];
  img: string;
  gif: string;
};

export const exerciseCatalog = EXDB as CatalogExercise[];
export const exerciseById = new Map(exerciseCatalog.map((exercise) => [exercise.id, exercise]));
export function localizedExerciseName(id: string | undefined, fallback: string) {
  return spanishExerciseName((id && exerciseById.get(id)?.n) || fallback);
}
export const spanishInstructions = ES_INSTRUCTIONS as Record<string, string[]>;
export const EXERCISE_IMAGE_BASE = "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/images/";
export const EXERCISE_GIF_BASE = "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/videos/";
