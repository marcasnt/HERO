import { exerciseCatalog, spanishInstructions } from "@/lib/exercise-catalog";

export function GET(request: Request) {
  const search = new URL(request.url).searchParams;
  const query = (search.get("q") || "").trim().toLowerCase();
  const bodyPart = (search.get("bodyPart") || "").trim().toLowerCase();
  const offset = Math.max(0, Number(search.get("offset")) || 0);
  const limit = Math.min(60, Math.max(10, Number(search.get("limit")) || 30));
  const filtered = exerciseCatalog.filter((exercise) => {
    if (bodyPart && exercise.bp !== bodyPart) return false;
    if (!query) return true;
    return `${exercise.n} ${exercise.tg} ${exercise.eq} ${exercise.bp}`.toLowerCase().includes(query);
  });
  const matches = filtered.slice(offset, offset + limit).map((exercise) => ({ id: exercise.id, name: exercise.n, bodyPart: exercise.bp, target: exercise.tg, equipment: exercise.eq, image: exercise.img, gif: exercise.gif, steps: spanishInstructions[exercise.id] || exercise.st }));
  const bodyParts = [...new Set(exerciseCatalog.map((exercise) => exercise.bp))].sort();
  return Response.json({ exercises: matches, total: exerciseCatalog.length, filteredTotal: filtered.length, bodyParts, nextOffset: offset + matches.length < filtered.length ? offset + matches.length : null }, { headers: { "Cache-Control": "public, s-maxage=3600" } });
}
