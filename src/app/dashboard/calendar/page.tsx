import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { coachClients, programAssignments, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";

type Exercise = { name: string; day?: string; sets: number; reps: string };
const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default async function CalendarPage() {
  const user = await requireUser();
  const db = getDb();
  const assignments = user.role === "client"
    ? await db.select({ id: programAssignments.id, name: programAssignments.name, definition: programAssignments.definition, clientName: users.name }).from(programAssignments).innerJoin(users, eq(users.id, programAssignments.clientId)).where(and(eq(programAssignments.clientId, user.id), eq(programAssignments.active, true))).orderBy(desc(programAssignments.createdAt))
    : await db.select({ id: programAssignments.id, name: programAssignments.name, definition: programAssignments.definition, clientName: users.name }).from(programAssignments).innerJoin(users, eq(users.id, programAssignments.clientId)).innerJoin(coachClients, eq(coachClients.clientId, users.id)).where(and(eq(programAssignments.coachId, user.id), eq(programAssignments.active, true))).orderBy(desc(programAssignments.createdAt));
  const scheduled = assignments.flatMap((assignment) => ((assignment.definition as { exercises?: Exercise[] }).exercises || []).map((exercise) => ({ ...exercise, program: assignment.name, client: assignment.clientName })));
  return <main className="dashboard"><div className="page-title"><div><span className="kicker">PLANIFICACIÓN</span><h1>Calendario semanal</h1><p>{user.role === "coach" ? "Vista de las rutinas activas de tus clientes." : "Tu semana de entrenamiento prescrita."}</p></div></div><section className="week-grid">{days.map((day) => { const items = scheduled.filter((exercise) => (exercise.day || "Lunes") === day); return <div className="day-card" key={day}><h2>{day}</h2>{items.length ? items.map((exercise, index) => <div className="calendar-exercise" key={`${exercise.name}-${index}`}><b>{exercise.name}</b><span>{exercise.sets} × {exercise.reps}</span>{user.role === "coach" && <small>{exercise.client}</small>}</div>) : <span className="rest-day">Descanso</span>}</div>; })}</section></main>;
}
