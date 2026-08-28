import Link from "next/link";
import Image from "next/image";
import { and, count, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { coachClients, programAssignments, users, weeklyCheckins, workoutSessions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { completeWorkout, submitCheckin } from "./actions";

type Routine = { exercises?: Array<{ name: string; day?: string; sets: number; reps: string; rest?: number; rir?: number; notes?: string; gif?: string; target?: string; equipment?: string; steps?: string[] }> };
const exerciseGifBase = "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/videos/";

export default async function Dashboard() {
  const user = await requireUser();
  const db = getDb();
  if (user.role === "coach") {
    const clients = await db.select({ id: users.id, name: users.name, email: users.email, startedAt: coachClients.startedAt })
      .from(coachClients).innerJoin(users, eq(users.id, coachClients.clientId))
      .where(eq(coachClients.coachId, user.id)).orderBy(desc(coachClients.startedAt));
    const [{ workouts }] = await db.select({ workouts: count() }).from(workoutSessions);
    const [{ checkins }] = await db.select({ checkins: count() }).from(weeklyCheckins);
    return <main className="dashboard"><div className="page-title"><div><span className="kicker">PANEL DEL ENTRENADOR</span><h1>Hola, {user.name.split(" ")[0]}</h1><p>Tu equipo y su ejecución, sin perder el pulso.</p></div><Link className="button" href="/dashboard/routines">+ Nueva rutina</Link></div>
      <section className="stats"><div><span>Clientes activos</span><strong>{clients.length}</strong></div><div><span>Sesiones completadas</span><strong>{Number(workouts)}</strong></div><div><span>Check-ins recibidos</span><strong>{Number(checkins)}</strong></div></section>
      <section className="panel"><div className="panel-head"><h2>Clientes</h2><span>{clients.length} en seguimiento</span></div>
        {clients.length ? <div className="client-list">{clients.map((client) => <Link key={client.id} href={`/dashboard/clients/${client.id}`}><span className="avatar">{client.name.slice(0, 2).toUpperCase()}</span><span><b>{client.name}</b><small>{client.email || "Sin correo"}</small></span><i>Ver progreso →</i></Link>)}</div> : <div className="empty"><b>Aún no hay clientes vinculados</b><p>Genera una invitación privada y envíasela a tu primer cliente.</p><Link className="button" href="/dashboard/invitations">Crear invitación</Link></div>}
      </section>
    </main>;
  }

  const assignments = await db.select().from(programAssignments).where(and(eq(programAssignments.clientId, user.id), eq(programAssignments.active, true))).orderBy(desc(programAssignments.createdAt));
  const sessions = await db.select().from(workoutSessions).where(eq(workoutSessions.clientId, user.id)).orderBy(desc(workoutSessions.completedAt)).limit(5);
  return <main className="dashboard"><div className="page-title"><div><span className="kicker">MI ENTRENAMIENTO</span><h1>Vamos, {user.name.split(" ")[0]}</h1><p>Registra cada sesión y construye evidencia de tu progreso.</p></div><Link className="button" href="/dashboard/progress">Subir progreso</Link></div>
    <section className="stats"><div><span>Rutinas activas</span><strong>{assignments.length}</strong></div><div><span>Sesiones completadas</span><strong>{sessions.length}</strong></div><div><span>Estado</span><strong className="status-good">Activo</strong></div></section>
    <section className="dashboard-grid"><div className="panel"><div className="panel-head"><h2>Rutina y registro</h2></div>{assignments.length ? assignments.map((assignment) => { const routine = assignment.definition as Routine; return <div className="routine workout-log" key={assignment.id}><h3>{assignment.name}</h3><form action={completeWorkout}><input type="hidden" name="assignmentId" value={assignment.id}/>{routine.exercises?.map((exercise, exerciseIndex) => <fieldset key={`${exercise.name}-${exerciseIndex}`}><legend><span>{exercise.day || "Entrenamiento"}</span><b>{exercise.name}</b><small>{exercise.sets} × {exercise.reps} · {exercise.rest || 90}s · RIR {exercise.rir ?? 2}</small></legend>{exercise.gif && <div className="exercise-media"><Image unoptimized width={420} height={280} src={exerciseGifBase + exercise.gif} alt={`Ejecución de ${exercise.name}`}/><span>{exercise.target}{exercise.equipment ? ` · ${exercise.equipment}` : ""}</span></div>}{exercise.notes && <p className="exercise-note">{exercise.notes}</p>}{exercise.steps?.length ? <details className="exercise-steps"><summary>Ver instrucciones</summary><ol>{exercise.steps.map((step, index) => <li key={index}>{step}</li>)}</ol></details> : null}<div className="set-table"><span>Serie</span><span>Peso kg</span><span>Reps</span><span>RPE</span>{Array.from({ length: exercise.sets }, (_, setIndex) => <div className="set-row" key={setIndex}><b>{setIndex + 1}</b><input aria-label={`Peso serie ${setIndex + 1}`} name={`weight-${exerciseIndex}-${setIndex}`} type="number" min="0" step="0.5"/><input aria-label={`Repeticiones serie ${setIndex + 1}`} name={`reps-${exerciseIndex}-${setIndex}`} type="number" min="0"/><input aria-label={`RPE serie ${setIndex + 1}`} name={`rpe-${exerciseIndex}-${setIndex}`} type="number" min="1" max="10" step="0.5"/></div>)}</div></fieldset>)}<textarea name="feedback" placeholder="¿Cómo te sentiste? (opcional)"/><button className="button" type="submit">Completar y guardar sesión</button></form></div>; }) : <div className="empty"><b>Tu entrenador aún no asignó una rutina</b></div>}</div>
      <div className="panel"><div className="panel-head"><h2>Check-in semanal</h2></div><form className="form-stack" action={submitCheckin}><label>Energía<select name="energy"><option>Alta</option><option>Media</option><option>Baja</option></select></label><label>Sueño<select name="sleep"><option>Excelente</option><option>Bueno</option><option>Regular</option><option>Malo</option></select></label><label>Notas<textarea name="notes" placeholder="Dolores, avances o dificultades"/></label><button className="button" type="submit">Enviar check-in</button></form></div>
    </section>
  </main>;
}
