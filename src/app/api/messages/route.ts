import { and, asc, eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { coachClients, messages, notifications, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/http";

async function requirePartner(user: Awaited<ReturnType<typeof requireUser>>, partnerId: string) {
  const [relation] = await getDb().select({ id: coachClients.id }).from(coachClients).where(user.role === "coach"
    ? and(eq(coachClients.coachId, user.id), eq(coachClients.clientId, partnerId))
    : and(eq(coachClients.clientId, user.id), eq(coachClients.coachId, partnerId))).limit(1);
  if (!relation) throw new Error("FORBIDDEN");
}

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const partnerId = new URL(request.url).searchParams.get("with") || "";
    await requirePartner(user, partnerId);
    const db = getDb();
    await db.update(messages).set({ readAt: new Date() }).where(and(eq(messages.senderId, partnerId), eq(messages.recipientId, user.id)));
    const thread = await db.select().from(messages).where(or(
      and(eq(messages.senderId, user.id), eq(messages.recipientId, partnerId)),
      and(eq(messages.senderId, partnerId), eq(messages.recipientId, user.id)),
    )).orderBy(asc(messages.createdAt)).limit(300);
    return Response.json({ messages: thread });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const payload = await request.json() as { recipientId?: string; body?: string };
    const recipientId = payload.recipientId || "";
    const body = payload.body?.trim() || "";
    if (!body || body.length > 2000) return Response.json({ error: "El mensaje debe tener entre 1 y 2,000 caracteres." }, { status: 400 });
    await requirePartner(user, recipientId);
    const [recipient] = await getDb().select({ id: users.id }).from(users).where(eq(users.id, recipientId)).limit(1);
    if (!recipient) throw new Error("FORBIDDEN");
    const [created] = await getDb().insert(messages).values({ senderId: user.id, recipientId, body }).returning();
    await getDb().insert(notifications).values({ userId: recipientId, title: `Nuevo mensaje de ${user.name}`, body: body.slice(0, 100), href: `/dashboard/messages?with=${user.id}` });
    return Response.json({ message: created }, { status: 201 });
  } catch (error) { return apiError(error); }
}
