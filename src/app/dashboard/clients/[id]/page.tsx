import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { coachClients, measurements, mediaAssets, programAssignments, users, weeklyCheckins, workoutSessions } from "@/db/schema";
import { requireCoach } from "@/lib/auth";
import { updateClientGoals } from "../../actions";
import { MiniChart } from "./mini-chart";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const coach = await requireCoach();
  const { id } = await params;
  const db = getDb();
  const [client] = await db.select({ id: users.id, name: users.name, email: users.email, objective: coachClients.objective, privateNotes: coachClients.privateNotes })
    .from(coachClients).innerJoin(users, eq(users.id, coachClients.clientId))
    .where(and(eq(coachClients.coachId, coach.id), eq(coachClients.clientId, id))).limit(1);
  if (!client) notFound();
  const [sessions, measures, photos, assignments, checkins] = await Promise.all([
    db.select().from(workoutSessions).where(eq(workoutSessions.clientId, id)).orderBy(desc(workoutSessions.completedAt)).limit(10),
    db.select().from(measurements).where(eq(measurements.clientId, id)).orderBy(desc(measurements.measuredAt)).limit(10),
    db.select().from(mediaAssets).where(eq(mediaAssets.ownerId, id)).orderBy(desc(mediaAssets.createdAt)).limit(12),
    db.select().from(programAssignments).where(eq(programAssignments.clientId, id)).orderBy(desc(programAssignments.createdAt)).limit(5),
    db.select().from(weeklyCheckins).where(eq(weeklyCheckins.clientId, id)).orderBy(desc(weeklyCheckins.submittedAt)).limit(5),
  ]);
  const weights = measures.slice().reverse().map((measure) => Number((measure.values as { weight?: number }).weight)).filter(Number.isFinite);
  const volumes = sessions.slice().reverse().map((session) => {
    const execution = session.execution as { exercises?: Array<{ sets?: Array<{ weight?: number; reps?: number }> }> };
    return Math.round((execution.exercises || []).flatMap((exercise) => exercise.sets || []).reduce((total, set) => total + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0));
  });
  return <main className="dashboard"><div className="page-title"><div><span className="kicker">EXPEDIENTE DEL CLIENTE</span><h1>{client.name}</h1><p>{client.email}</p></div><Link className="button" href="/dashboard/routines">Asignar rutina</Link></div>
    <section className="stats"><div><span>Sesiones</span><strong>{sessions.length}</strong></div><div><span>Rutinas</span><strong>{assignments.length}</strong></div><div><span>Check-ins</span><strong>{checkins.length}</strong></div></section>
    <section className="analytics-grid"><MiniChart values={weights} label="Peso corporal" suffix=" kg"/><MiniChart values={volumes} label="Volumen por sesión" suffix=" kg"/><div className="chart metric"><div><span>Adherencia registrada</span><strong>{assignments.length ? Math.min(100, Math.round((sessions.length / Math.max(assignments.length * 4, 1)) * 100)) : 0}%</strong></div><p>{sessions.length} sesiones completadas</p></div></section>
    <section className="dashboard-grid"><div className="panel"><div className="panel-head"><h2>Actividad reciente</h2></div>{sessions.length ? <div className="timeline">{sessions.map((session) => <div key={session.id}><span className="dot"/><span><b>Rutina completada</b><small>{session.completedAt?.toLocaleDateString("es")}{session.clientFeedback ? ` · ${session.clientFeedback}` : ""}</small></span></div>)}</div> : <div className="empty">Sin sesiones registradas.</div>}</div>
      <div className="panel"><div className="panel-head"><h2>Mediciones</h2></div>{measures.length ? <div className="timeline">{measures.map((measure) => { const values = measure.values as { weight?: number; waist?: number }; return <div key={measure.id}><span className="dot"/><span><b>{values.weight || "—"} kg · {values.waist || "—"} cm cintura</b><small>{measure.measuredAt.toLocaleDateString("es")}</small></span></div>; })}</div> : <div className="empty">Sin mediciones.</div>}</div>
    </section>
    <section className="panel"><div className="panel-head"><h2>Programas asignados</h2><span>{assignments.length}</span></div>{assignments.length ? <div className="program-list">{assignments.map((assignment) => <Link href={`/dashboard/routines/${assignment.id}`} key={assignment.id}><span><b>{assignment.name}</b><small>Versión {assignment.version} · {assignment.active ? "Activa" : "Finalizada"}</small></span><i>Editar →</i></Link>)}</div> : <div className="empty">No hay programas asignados.</div>}</section>
    <section className="panel"><div className="panel-head"><h2>Objetivos y notas</h2><span>Las notas privadas solo las ves tú</span></div><form className="form-stack" action={updateClientGoals}><input type="hidden" name="clientId" value={client.id}/><label>Objetivo del cliente<textarea name="objective" defaultValue={client.objective || ""} placeholder="Objetivo principal, plazo, contexto..."/></label><label>Notas privadas<textarea name="privateNotes" defaultValue={client.privateNotes || ""} placeholder="Observaciones del entrenador"/></label><button className="button" type="submit">Guardar seguimiento</button></form></section>
    <section className="panel"><div className="panel-head"><h2>Fotografías de progreso</h2><span>Privadas</span></div>{photos.length ? <div className="photo-grid">{photos.map((photo) => <a href={`/api/media/${photo.id}`} target="_blank" key={photo.id}><Image unoptimized fill sizes="(max-width: 700px) 50vw, 25vw" src={`/api/media/${photo.id}`} alt={photo.notes || "Progreso del cliente"}/><span>{photo.capturedAt?.toLocaleDateString("es") || photo.createdAt.toLocaleDateString("es")}</span></a>)}</div> : <div className="empty">El cliente aún no ha subido fotografías.</div>}</section>
  </main>;
}
