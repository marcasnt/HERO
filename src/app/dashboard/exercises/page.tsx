import { requireUser } from "@/lib/auth";
import { ExerciseLibrary } from "./exercise-library";

export default async function ExercisesPage() {
  await requireUser();
  return <main className="dashboard"><div className="page-title"><div><span className="kicker">BIBLIOTECA</span><h1>Ejercicios</h1><p>Explora todos los movimientos con demostración e instrucciones en español.</p></div></div><ExerciseLibrary/></main>;
}
