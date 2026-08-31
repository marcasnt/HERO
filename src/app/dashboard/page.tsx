import Link from "next/link";
import Image from "next/image";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { coachClients, measurements, mediaAssets, programAssignments, users, weeklyCheckins, workoutSessions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { submitCheckin } from "./actions";

type RoutineExercise = { name: string; day?: string };
type Routine = { exercises?: RoutineExercise[]; dayNames?: Record<string, string> };

export default async function Dashboard() {
  const user = await requireUser();
  const db = getDb();
  if (user.role === "coach") {
    const clients = await db.select({ id: users.id, name: users.name, email: users.email, startedAt: coachClients.startedAt })
      .from(coachClients).innerJoin(users, eq(users.id, coachClients.clientId))
      .where(eq(coachClients.coachId, user.id)).orderBy(desc(coachClients.startedAt));
    const photos = clients.length ? await db.select({ id: mediaAssets.id, ownerId: mediaAssets.ownerId }).from(mediaAssets)
      .where(and(eq(mediaAssets.kind, "profile"), inArray(mediaAssets.ownerId, clients.map((client) => client.id))))
      .orderBy(desc(mediaAssets.createdAt)) : [];
    const photoByClient = new Map<string, string>();
    for (const photo of photos) if (!photoByClient.has(photo.ownerId)) photoByClient.set(photo.ownerId, photo.id);
    const [{ workouts }] = await db.select({ workouts: count() }).from(workoutSessions);
    const [{ checkins }] = await db.select({ checkins: count() }).from(weeklyCheckins);
    return <main className="dashboard"><div className="page-title"><div><span className="kicker">PANEL DEL ENTRENADOR</span><h1>Hola, {user.name.split(" ")[0]}</h1><p>Tu equipo y su ejecución, sin perder el pulso.</p></div><Link className="button" href="/dashboard/routines">+ Nueva rutina</Link></div>
      <section className="stats"><div><span>Clientes activos</span><strong>{clients.length}</strong></div><div><span>Sesiones completadas</span><strong>{Number(workouts)}</strong></div><div><span>Check-ins recibidos</span><strong>{Number(checkins)}</strong></div></section>
      <section className="panel"><div className="panel-head"><h2>Clientes</h2><span>{clients.length} en seguimiento</span></div>
        {clients.length ? <div className="client-list">{clients.map((client) => { const photoId = photoByClient.get(client.id); return <Link key={client.id} href={`/dashboard/clients/${client.id}`}><span className="avatar">{photoId ? <Image src={`/api/media/${photoId}`} alt="" width={42} height={42} unoptimized/> : client.name.slice(0, 2).toUpperCase()}</span><span><b>{client.name}</b><small>{client.email || "Sin correo"}</small></span><i>Ver progreso →</i></Link>; })}</div> : <div className="empty"><b>Aún no hay clientes vinculados</b><p>Genera una invitación privada y envíasela a tu primer cliente.</p><Link className="button" href="/dashboard/invitations">Crear invitación</Link></div>}
      </section>
    </main>;
  }

  const [assignments, sessions, recentMeasures] = await Promise.all([
    db.select().from(programAssignments).where(and(eq(programAssignments.clientId, user.id), eq(programAssignments.active, true))).orderBy(desc(programAssignments.createdAt)),
    db.select().from(workoutSessions).where(eq(workoutSessions.clientId, user.id)).orderBy(desc(workoutSessions.completedAt)).limit(100),
    db.select().from(measurements).where(eq(measurements.clientId, user.id)).orderBy(desc(measurements.measuredAt)).limit(12),
  ]);
  const now = new Date();
  const today = now.toLocaleDateString("es-NI", { weekday: "long", timeZone: "America/Managua" });
  const todayName = today[0].toUpperCase() + today.slice(1);
  const firstRoutine = assignments[0]?.definition as Routine | undefined;
  const todayExercises = (firstRoutine?.exercises || []).filter((exercise) => (exercise.day || "Lunes") === todayName);
  const sessionName = firstRoutine?.dayNames?.[todayName] || (todayExercises.length ? assignments[0].name : "Descanso y recuperación");
  const latest = recentMeasures[0]?.values as Record<string, number> | undefined;
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)); weekStart.setHours(0, 0, 0, 0);
  const weekSessions = sessions.filter((session) => session.completedAt && session.completedAt >= weekStart).length;
  const weekDates = Array.from({ length: 7 }, (_, index) => { const date = new Date(weekStart); date.setDate(weekStart.getDate() + index); return date; });
  return <main className="dashboard client-home"><div className="client-home-head"><div><span className="kicker">{now.toLocaleDateString("es-NI", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Managua" })}</span><h1>Vamos, {user.name.split(" ")[0]}</h1></div><Link className="mini-button" href="/dashboard/settings">Ajustes</Link></div><section className="panel home-week"><div className="week-label"><b>Esta semana</b><span>{weekSessions} sesiones completadas</span></div><div className="week-strip">{weekDates.map((date) => { const day = date.toLocaleDateString("es", { weekday: "short" }).slice(0, 2); const done = sessions.some((session) => session.completedAt?.toDateString() === date.toDateString()); const isToday = date.toDateString() === now.toDateString(); return <div className={isToday ? "today" : done ? "done" : ""} key={date.toISOString()}><small>{day}</small><b>{date.getDate()}</b><i/></div>; })}</div><div className="today-workout"><span><small>HOY</small><b>{sessionName}</b><em>{todayExercises.length ? `${todayExercises.length} ejercicios asignados` : "Sin entrenamiento programado"}</em></span>{todayExercises.length ? <Link className="button" href="/dashboard/workout">Seguir</Link> : <Link className="mini-button" href="/dashboard/plan">Ver plan</Link>}</div></section><section className="home-cards"><div className="panel weight-summary"><div><span>Peso corporal</span><Link href="/dashboard/progress">Registrar +</Link></div><strong>{latest?.weight ? `${latest.weight} kg` : "—"}</strong><small>{latest?.bodyFat ? `${latest.bodyFat}% de grasa estimada` : "Registra tu primera medición"}</small><div className="weight-points">{recentMeasures.slice().reverse().map((measure) => { const data = measure.values as Record<string, number>; return <i style={{ height: `${Math.max(12, Math.min(100, (data.weight || 0) / 1.2))}%` }} key={measure.id}/>; })}</div></div><div className="panel streak-card"><span className="kicker">CONSTANCIA</span><h2>Racha de {weekSessions ? 1 : 0} semanas</h2><p>{weekSessions} esta semana · {sessions.length} entrenamientos registrados</p><Link href="/dashboard/progress">Ver progreso →</Link></div></section><section className="panel home-checkin"><div className="panel-head"><h2>Check-in semanal</h2><span>Comparte cómo vas con tu entrenador</span></div><form className="quick-checkin" action={submitCheckin}><label>Energía<select name="energy"><option>Alta</option><option>Media</option><option>Baja</option></select></label><label>Sueño<select name="sleep"><option>Excelente</option><option>Bueno</option><option>Regular</option><option>Malo</option></select></label><label>Notas<textarea name="notes" placeholder="Dolores, avances o dificultades"/></label><button className="button" type="submit">Enviar check-in</button></form></section></main>;
}
