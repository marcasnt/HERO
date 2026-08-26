import Link from "next/link";
import { and, asc, eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { coachClients, messages, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { sendMessage } from "../actions";

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
  return <main className="dashboard"><div className="page-title"><div><span className="kicker">COMUNICACIÓN</span><h1>Mensajes</h1><p>Conversaciones directas entre entrenador y cliente.</p></div></div><section className="message-layout"><aside className="panel conversation-list"><h2>Contactos</h2>{partners.map((partner) => <Link className={selected?.id === partner.id ? "active" : ""} href={`/dashboard/messages?with=${partner.id}`} key={partner.id}><span className="avatar">{partner.name.slice(0, 2).toUpperCase()}</span>{partner.name}</Link>)}</aside><div className="panel conversation"><div className="panel-head"><h2>{selected?.name || "Sin contacto"}</h2></div>{selected ? <><div className="message-thread">{thread.length ? thread.map((message) => <div className={message.senderId === user.id ? "message mine" : "message"} key={message.id}><p>{message.body}</p><small>{message.createdAt.toLocaleString("es")}</small></div>) : <div className="empty">Inicia la conversación.</div>}</div><form className="message-form" action={sendMessage}><input type="hidden" name="recipientId" value={selected.id}/><textarea name="body" required placeholder="Escribe un mensaje..."/><button className="button" type="submit">Enviar</button></form></> : <div className="empty">Acepta o invita un cliente para empezar.</div>}</div></section></main>;
}
