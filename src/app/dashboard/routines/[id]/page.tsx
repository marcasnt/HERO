import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { coachClients, programAssignments, users } from "@/db/schema";
import { requireCoach } from "@/lib/auth";
import { RoutineBuilder } from "../routine-builder";

type Exercise = { name: string; day: string; sets: number; reps: string; rest: number; rir: number; notes: string };
export default async function EditRoutinePage({ params }: { params: Promise<{ id: string }> }) {
  const coach = await requireCoach();
  const { id } = await params;
  const [assignment] = await getDb().select().from(programAssignments).where(and(eq(programAssignments.id, id), eq(programAssignments.coachId, coach.id))).limit(1);
  if (!assignment) notFound();
  const clients = await getDb().select({ id: users.id, name: users.name }).from(coachClients).innerJoin(users, eq(users.id, coachClients.clientId)).where(eq(coachClients.coachId, coach.id));
  const definition = assignment.definition as { exercises?: Exercise[] };
  return <main className="dashboard"><div className="page-title"><div><span className="kicker">EDITOR DE PROGRAMA</span><h1>{assignment.name}</h1><p>Actualiza ejercicios, carga prescrita y distribución semanal.</p></div></div><section className="panel"><RoutineBuilder clients={clients} assignmentId={assignment.id} clientId={assignment.clientId} initialName={assignment.name} initial={definition.exercises || []}/></section></main>;
}
