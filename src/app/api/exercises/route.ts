import { exerciseCatalog } from "@/lib/exercise-catalog";

export function GET(request: Request) {
  const search = new URL(request.url).searchParams;
  const query = (search.get("q") || "").trim().toLowerCase();
  const bodyPart = (search.get("bodyPart") || "").trim().toLowerCase();
  const matches = exerciseCatalog.filter((exercise) => {
    if (bodyPart && exercise.bp !== bodyPart) return false;
    if (!query) return true;
    return `${exercise.n} ${exercise.tg} ${exercise.eq} ${exercise.bp}`.toLowerCase().includes(query);
  }).slice(0, 30).map((exercise) => ({ id: exercise.id, name: exercise.n, bodyPart: exercise.bp, target: exercise.tg, equipment: exercise.eq, image: exercise.img, gif: exercise.gif, steps: exercise.st }));
  return Response.json({ exercises: matches, total: exerciseCatalog.length }, { headers: { "Cache-Control": "public, s-maxage=3600" } });
}
