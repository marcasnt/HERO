import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { programAssignments } from "@/db/schema";
import { requireUser } from "@/lib/auth";

type Exercise = { name: string; day?: string; sets: number; reps: string; series?: Array<{ reps: string; weight: number | null }> };
type Routine = { exercises?: Exercise[]; dayNames?: Record<string, string> };
const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default async function PlanPage() {
  const user = await requireUser();
  if (user.role !== "client") return <main className="dashboard"><div className="empty">Esta sección corresponde al cliente.</div></main>;
  const assignments = await getDb().select().from(programAssignments).where(and(eq(programAssignments.clientId, user.id), eq(programAssignments.active, true))).orderBy(desc(programAssignments.createdAt));
  const routines = assignments.map((assignment) => ({ assignment, routine: assignment.definition as Routine }));
  return <main className="dashboard"><div className="page-title"><div><span className="kicker">TU RUTINA SEMANAL</span><h1>Plan</h1><p>Consulta cada sesión y abre sus ejercicios antes de entrenar.</p></div></div><section className="weekly-plan">{days.map((day) => { const entries = routines.flatMap(({ assignment, routine }) => { const exercises = (routine.exercises || []).filter((exercise) => (exercise.day || "Lunes") === day); return exercises.length ? [{ assignment, routine, exercises }] : []; }); return <details className="plan-day" key={day}><summary><span><b>{day}</b><small>{entries.length ? entries.map(({ routine }) => routine.dayNames?.[day]).filter(Boolean).join(" · ") || entries[0].assignment.name : "Descanso"}</small></span><i>{entries.reduce((total, item) => total + item.exercises.length, 0)} ejercicios</i></summary>{entries.length ? <div className="plan-exercises">{entries.flatMap(({ exercises }) => exercises).map((exercise, index) => <div key={`${exercise.name}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><b>{exercise.name}</b><small>{exercise.series?.length || exercise.sets} series · {exercise.series?.map((set) => set.reps).join(" / ") || exercise.reps} reps</small></div>)}</div> : <div className="rest-plan">Día de recuperación</div>}</details>; })}</section></main>;
}
