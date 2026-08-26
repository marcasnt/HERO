import Link from "next/link";
import { and, count, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { coachClients, programAssignments, users, weeklyCheckins, workoutSessions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { completeWorkout, submitCheckin } from "./actions";

type Routine = { exercises?: Array<{ name: string; sets: number; reps: string }> };

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
        {clients.length ? <div className="client-list">{clients.map((client) => <Link key={client.id} href={`/dashboard/clients/${client.id}`}><span className="avatar">{client.name.slice(0, 2).toUpperCase()}</span><span><b>{client.name}</b><small>{client.email || "Sin correo"}</small></span><i>Ver progreso →</i></Link>)}</div> : <div className="empty"><b>Aún no hay clientes</b><p>Cuando un cliente cree su cuenta, aparecerá aquí automáticamente.</p></div>}
      </section>
    </main>;
  }

  const assignments = await db.select().from(programAssignments).where(and(eq(programAssignments.clientId, user.id), eq(programAssignments.active, true))).orderBy(desc(programAssignments.createdAt));
  const sessions = await db.select().from(workoutSessions).where(eq(workoutSessions.clientId, user.id)).orderBy(desc(workoutSessions.completedAt)).limit(5);
  return <main className="dashboard"><div className="page-title"><div><span className="kicker">MI ENTRENAMIENTO</span><h1>Vamos, {user.name.split(" ")[0]}</h1><p>Registra cada sesión y construye evidencia de tu progreso.</p></div><Link className="button" href="/dashboard/progress">Subir progreso</Link></div>
    <section className="stats"><div><span>Rutinas activas</span><strong>{assignments.length}</strong></div><div><span>Sesiones completadas</span><strong>{sessions.length}</strong></div><div><span>Estado</span><strong className="status-good">Activo</strong></div></section>
    <section className="dashboard-grid"><div className="panel"><div className="panel-head"><h2>Rutina actual</h2></div>{assignments.length ? assignments.map((assignment) => { const routine = assignment.definition as Routine; return <div className="routine" key={assignment.id}><h3>{assignment.name}</h3><ul>{routine.exercises?.map((exercise, index) => <li key={`${exercise.name}-${index}`}><span>{exercise.name}</span><b>{exercise.sets} × {exercise.reps}</b></li>)}</ul><form action={completeWorkout}><input type="hidden" name="assignmentId" value={assignment.id}/><textarea name="feedback" placeholder="¿Cómo te sentiste? (opcional)"/><button className="button" type="submit">Marcar como completada</button></form></div>; }) : <div className="empty"><b>Tu entrenador aún no asignó una rutina</b></div>}</div>
      <div className="panel"><div className="panel-head"><h2>Check-in semanal</h2></div><form className="form-stack" action={submitCheckin}><label>Energía<select name="energy"><option>Alta</option><option>Media</option><option>Baja</option></select></label><label>Sueño<select name="sleep"><option>Excelente</option><option>Bueno</option><option>Regular</option><option>Malo</option></select></label><label>Notas<textarea name="notes" placeholder="Dolores, avances o dificultades"/></label><button className="button" type="submit">Enviar check-in</button></form></div>
    </section>
  </main>;
}
