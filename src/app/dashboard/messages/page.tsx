import Link from "next/link";
import { and, asc, eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { coachClients, messages, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { PrivateChat } from "./private-chat";

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ with?: string }> }) {
  const user = await requireUser();
  const db = getDb();
  const partners = user.role === "coach"
    ? await db.select({ id: users.id, name: users.name }).from(coachClients).innerJoin(users, eq(users.id, coachClients.clientId)).where(eq(coachClients.coachId, user.id))
    : await db.select({ id: users.id, name: users.name }).from(coachClients).innerJoin(users, eq(users.id, coachClients.coachId)).where(eq(coachClients.clientId, user.id));
  const requested = (await searchParams).with;
  const selected = partners.find((partner) => partner.id === requested) || partners[0];
  const thread = selected ? await db.select().from(messages).where(or(
    and(eq(messages.senderId, user.id), eq(messages.recipientId, selected.id)),
    and(eq(messages.senderId, selected.id), eq(messages.recipientId, user.id)),
  )).orderBy(asc(messages.createdAt)).limit(100) : [];
  return <main className="dashboard"><div className="page-title"><div><span className="kicker">COMUNICACIÓN</span><h1>Mensajes</h1><p>Un canal privado para cada relación entrenador–cliente.</p></div></div><section className="message-layout"><aside className="panel conversation-list"><div><span className="kicker">CONVERSACIONES</span><h2>{user.role === "coach" ? "Tus clientes" : "Tu entrenador"}</h2></div>{partners.map((partner) => <Link className={selected?.id === partner.id ? "active" : ""} href={`/dashboard/messages?with=${partner.id}`} key={partner.id}><span className="avatar">{partner.name.slice(0, 2).toUpperCase()}</span><span><b>{partner.name}</b><small>Abrir canal privado</small></span></Link>)}</aside>{selected ? <PrivateChat userId={user.id} partnerId={selected.id} partnerName={selected.name} initialMessages={thread.map((message) => ({ ...message, createdAt: message.createdAt.toISOString(), readAt: message.readAt?.toISOString() || null }))}/> : <div className="panel empty">Acepta o invita un cliente para empezar.</div>}</section></main>;
}
