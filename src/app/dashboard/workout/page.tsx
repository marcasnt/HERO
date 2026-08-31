import Image from "next/image";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { programAssignments } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { localizedExerciseName, spanishInstructions } from "@/lib/exercise-catalog";
import { MuscleMap } from "./muscle-map";
import { WorkoutForm } from "./workout-form";

type Exercise = { id?: string; name: string; day?: string; sets: number; reps: string; series?: Array<{ reps: string; weight: number | null }>; rest?: number; rir?: number; notes?: string; gif?: string; target?: string; equipment?: string; steps?: string[] };
type Routine = { exercises?: Exercise[]; dayNames?: Record<string, string> };
const gifBase = "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/videos/";
const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function ExerciseExecution({ exercise, exerciseIndex, number, total }: { exercise: Exercise; exerciseIndex: number; number: number; total: number }) {
  const series = exercise.series?.length ? exercise.series : Array.from({ length: exercise.sets }, () => ({ reps: exercise.reps, weight: null }));
  const steps = (exercise.id && spanishInstructions[exercise.id]) || exercise.steps || [];
  const displayName = localizedExerciseName(exercise.id, exercise.name);
  return <fieldset className="execution-card"><span className="exercise-progress">Ejercicio {number} / {total}</span>{exercise.gif && <div className="exercise-media"><Image unoptimized width={520} height={360} src={gifBase + exercise.gif} alt={`Ejecución de ${displayName}`}/><span>{exercise.target}{exercise.equipment ? ` · ${exercise.equipment}` : ""}</span></div>}<legend><b>{displayName}</b><small>{series.length} series · descanso {exercise.rest || 90}s · RIR {exercise.rir ?? 2}</small></legend>{exercise.notes && <p className="exercise-note">{exercise.notes}</p>}{steps.length ? <details className="exercise-steps"><summary>Ver técnica e instrucciones</summary><ol>{steps.map((step, index) => <li key={index}>{step}</li>)}</ol></details> : null}<div className="set-table"><span>Serie</span><span>Peso kg</span><span>Reps</span><span>RPE</span>{series.map((prescribed, setIndex) => <div className="set-row" key={setIndex}><b>{setIndex + 1}<small>{prescribed.weight !== null ? `${prescribed.weight}kg` : "libre"} × {prescribed.reps}</small></b><input aria-label={`Peso serie ${setIndex + 1}`} name={`weight-${exerciseIndex}-${setIndex}`} type="number" min="0" step="0.5" placeholder={prescribed.weight !== null ? String(prescribed.weight) : "kg"}/><input aria-label={`Repeticiones serie ${setIndex + 1}`} name={`reps-${exerciseIndex}-${setIndex}`} type="number" min="0" placeholder={prescribed.reps}/><input aria-label={`RPE serie ${setIndex + 1}`} name={`rpe-${exerciseIndex}-${setIndex}`} type="number" min="1" max="10" step="0.5"/></div>)}</div></fieldset>;
}

export default async function WorkoutPage() {
  const user = await requireUser();
  if (user.role !== "client") return <main className="dashboard"><div className="empty">La ejecución corresponde al cliente.</div></main>;
  const assignments = await getDb().select().from(programAssignments).where(and(eq(programAssignments.clientId, user.id), eq(programAssignments.active, true))).orderBy(desc(programAssignments.createdAt));
  const today = days[new Date().getDay()];
  return <main className="dashboard workout-screen"><div className="page-title"><div><span className="kicker">SEGUIR</span><h1>Entrenamiento</h1><p>Registra peso, repeticiones y esfuerzo serie por serie.</p></div></div>{assignments.length ? assignments.map((assignment) => { const routine = assignment.definition as Routine; const all = routine.exercises || []; const todayExercises = all.filter((exercise) => (exercise.day || "Lunes") === today); const exercises = todayExercises.length ? todayExercises : all; const exerciseIndexes = exercises.map((exercise) => all.indexOf(exercise)); const muscleExercises = exercises.map((exercise) => ({ target: exercise.target, sets: exercise.sets })); return <section className="panel active-workout" key={assignment.id}><div className="workout-heading"><div><span className="kicker">{todayExercises.length ? "RUTINA DE HOY" : "RUTINA DISPONIBLE"}</span><h2>{routine.dayNames?.[today] || assignment.name}</h2></div><b>{exercises.length} ejercicios</b></div><MuscleMap exercises={muscleExercises}/><WorkoutForm assignmentId={assignment.id} exerciseIndexes={exerciseIndexes} exercises={muscleExercises}>{exercises.map((exercise, index) => <ExerciseExecution exercise={exercise} exerciseIndex={all.indexOf(exercise)} number={index + 1} total={exercises.length} key={`${exercise.name}-${index}`}/>)}<label>Comentario para tu entrenador<textarea name="feedback" placeholder="Sensaciones, molestias o avances…"/></label></WorkoutForm></section>; }) : <div className="empty"><b>Aún no tienes una rutina asignada</b><p>Tu entrenador debe crear el primer programa.</p></div>}</main>;
}
