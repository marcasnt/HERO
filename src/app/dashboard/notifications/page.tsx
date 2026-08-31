import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { AutoReadNotifications } from "./auto-read-notifications";

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await getDb().select().from(notifications).where(eq(notifications.userId, user.id)).orderBy(desc(notifications.createdAt)).limit(50);
  const hasUnread = items.some((item) => !item.readAt);
  return <main className="dashboard narrow"><div className="page-title"><div><span className="kicker">ACTIVIDAD</span><h1>Notificaciones</h1><p>Se marcan como leídas automáticamente al abrir esta pantalla.</p></div>{hasUnread ? <AutoReadNotifications/> : null}</div><section className="panel"><div className="notification-list">{items.length ? items.map((item) => <a className={item.readAt ? "" : "unread"} href={item.href || "/dashboard"} key={item.id}><span className="dot"/><span><b>{item.title}</b><small>{item.body}</small><time>{item.createdAt.toLocaleString("es")}</time></span></a>) : <div className="empty">No tienes notificaciones.</div>}</div></section></main>;
}
