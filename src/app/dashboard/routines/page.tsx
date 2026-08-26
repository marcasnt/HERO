import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { coachClients, users } from "@/db/schema";
import { requireCoach } from "@/lib/auth";
import { createRoutine } from "../actions";

export default async function RoutinesPage() {
  const coach = await requireCoach();
  const clients = await getDb().select({ id: users.id, name: users.name }).from(coachClients)
    .innerJoin(users, eq(users.id, coachClients.clientId)).where(eq(coachClients.coachId, coach.id));
  return <main className="dashboard narrow"><div className="page-title"><div><span className="kicker">PROGRAMACIÓN</span><h1>Nueva rutina</h1><p>Crea una prescripción simple, clara y medible.</p></div></div>
    <section className="panel form-panel"><form className="form-stack" action={createRoutine}>
      <label>Cliente<select name="clientId" required><option value="">Seleccionar cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
      <label>Nombre de la rutina<input name="name" required placeholder="Ej. Fuerza · Bloque 1" /></label>
      <label>Ejercicios<textarea className="code-area" name="exercises" required rows={10} placeholder={'Sentadilla | 4 | 8\nPress banca | 3 | 10\nRemo con mancuerna | 3 | 12'} /></label>
      <p className="hint">Usa una línea por ejercicio: nombre | series | repeticiones.</p>
      <button className="button" type="submit" disabled={!clients.length}>Asignar rutina</button>
      {!clients.length && <p className="warning">Necesitas que al menos un cliente cree su cuenta primero.</p>}
    </form></section>
  </main>;
}
