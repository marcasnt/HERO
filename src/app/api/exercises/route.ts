import { exerciseCatalog, spanishInstructions } from "@/lib/exercise-catalog";
import { bodyPartSpanish, spanishExerciseName, translateExerciseTerm } from "@/lib/exercise-spanish";

export function GET(request: Request) {
  const search = new URL(request.url).searchParams;
  const query = (search.get("q") || "").trim().toLowerCase();
  const bodyPart = (search.get("bodyPart") || "").trim().toLowerCase();
  const offset = Math.max(0, Number(search.get("offset")) || 0);
  const limit = Math.min(60, Math.max(10, Number(search.get("limit")) || 30));
  const filtered = exerciseCatalog.filter((exercise) => {
    if (bodyPart && exercise.bp !== bodyPart) return false;
    if (!query) return true;
    return `${exercise.n} ${spanishExerciseName(exercise.n)} ${exercise.tg} ${translateExerciseTerm(exercise.tg)} ${exercise.eq} ${translateExerciseTerm(exercise.eq)} ${exercise.bp} ${translateExerciseTerm(exercise.bp)}`.toLowerCase().includes(query);
  });
  const matches = filtered.slice(offset, offset + limit).map((exercise) => ({ id: exercise.id, name: spanishExerciseName(exercise.n), originalName: exercise.n, bodyPart: translateExerciseTerm(exercise.bp), target: translateExerciseTerm(exercise.tg), equipment: translateExerciseTerm(exercise.eq), image: exercise.img, gif: exercise.gif, steps: spanishInstructions[exercise.id] || exercise.st }));
  const bodyParts = [...new Set(exerciseCatalog.map((exercise) => exercise.bp))].sort().map((value) => ({ value, label: bodyPartSpanish[value] || value }));
  return Response.json({ exercises: matches, total: exerciseCatalog.length, filteredTotal: filtered.length, bodyParts, nextOffset: offset + matches.length < filtered.length ? offset + matches.length : null }, { headers: { "Cache-Control": "no-store" } });
}
