import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { coachClients, users } from "@/db/schema";
import { requireCoach } from "@/lib/auth";
import { RoutineBuilder } from "./routine-builder";

export default async function RoutinesPage() {
  const coach = await requireCoach();
  const clients = await getDb().select({ id: users.id, name: users.name }).from(coachClients)
    .innerJoin(users, eq(users.id, coachClients.clientId)).where(eq(coachClients.coachId, coach.id));
  return <main className="dashboard narrow"><div className="page-title"><div><span className="kicker">PROGRAMACIÓN</span><h1>Nueva rutina</h1><p>Crea una prescripción simple, clara y medible.</p></div></div>
    <section className="panel form-panel"><RoutineBuilder clients={clients}/>{!clients.length && <p className="warning">Invita al menos un cliente antes de crear su programa.</p>}</section>
  </main>;
}
