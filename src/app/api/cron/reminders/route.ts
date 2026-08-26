import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { coachClients, notifications } from "@/db/schema";

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const clients = await getDb().select({ id: coachClients.clientId }).from(coachClients).where(eq(coachClients.status, "active"));
  if (clients.length) await getDb().insert(notifications).values(clients.map((client) => ({ userId: client.id, title: "Tu progreso se construye hoy", body: "Revisa tu calendario y registra tu entrenamiento o check-in.", href: "/dashboard/calendar" })));
  return Response.json({ ok: true, reminders: clients.length, checkedAt: new Date().toISOString() });
}
