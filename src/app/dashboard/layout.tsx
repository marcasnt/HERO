import Link from "next/link";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { CalendarBlank, ChartLineUp, ChatCircle, GearSix, House, ListBullets, Play } from "@phosphor-icons/react/dist/ssr";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/db";
import { mediaAssets, messages, notifications } from "@/db/schema";
import { AlertLinks } from "./alert-links";
import { ProfileUserButton } from "./profile-user-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const db = getDb();
  const [messageCount, notificationCount, profilePhotos] = await Promise.all([
    db.select({ total: count() }).from(messages).where(and(eq(messages.recipientId, user.id), isNull(messages.readAt))),
    db.select({ total: count() }).from(notifications).where(and(eq(notifications.userId, user.id), isNull(notifications.readAt))),
    db.select({ id: mediaAssets.id }).from(mediaAssets).where(and(eq(mediaAssets.ownerId, user.id), eq(mediaAssets.kind, "profile"))).orderBy(desc(mediaAssets.createdAt)).limit(1),
  ]);
  const alertCounts = { unreadMessages: Number(messageCount[0]?.total || 0), unreadNotifications: Number(notificationCount[0]?.total || 0) };
  const profilePhotoUrl = profilePhotos[0] ? `/api/media/${profilePhotos[0].id}` : null;
  return <div className="app-shell">
    <aside className="sidebar">
      <Link className="brand" href="/dashboard">HERO</Link>
      <nav>
        <Link href="/dashboard">Resumen</Link>
        {user.role === "coach" ? <><Link href="/dashboard/invitations">Invitar clientes</Link><Link href="/dashboard/routines">Crear rutina</Link><Link href="/dashboard/calendar">Calendario</Link></> : <><Link href="/dashboard/plan">Mi plan</Link><Link href="/dashboard/workout">Seguir entrenamiento</Link><Link href="/dashboard/progress">Mi progreso</Link><Link href="/dashboard/exercises">Ejercicios</Link></>}
        <AlertLinks initialCounts={alertCounts}/>
        <Link href="/dashboard/profile">Mi perfil</Link>
        <Link href="/dashboard/settings">Ajustes</Link>
      </nav>
      <div className="user-chip"><ProfileUserButton photoUrl={profilePhotoUrl} large/><span><b>{user.name}</b><small>{user.role === "coach" ? "Entrenador" : "Cliente"}</small></span></div>
    </aside>
    <div className="app-content"><header className="mobile-head"><Link className="brand" href="/dashboard">HERO</Link><div className="mobile-tools"><AlertLinks initialCounts={alertCounts} compact/><Link aria-label="Ajustes" href="/dashboard/settings"><GearSix size={23} weight="bold"/></Link><ProfileUserButton photoUrl={profilePhotoUrl}/></div></header>{children}{user.role === "client" ? <nav className="mobile-nav client-tabs" aria-label="Navegación de entrenamiento"><Link href="/dashboard"><House size={22} weight="bold"/><span>Inicio</span></Link><Link href="/dashboard/plan"><CalendarBlank size={22} weight="bold"/><span>Plan</span></Link><Link className="follow-tab" href="/dashboard/workout"><span className="play-orb"><Play size={28} weight="fill"/></span><span>Seguir</span></Link><Link href="/dashboard/progress"><ChartLineUp size={22} weight="bold"/><span>Progreso</span></Link><Link href="/dashboard/exercises"><ListBullets size={22} weight="bold"/><span>Ejercicios</span></Link></nav> : <nav className="mobile-nav" aria-label="Navegación principal"><Link href="/dashboard"><House size={22} weight="bold"/><span>Resumen</span></Link><Link href="/dashboard/calendar"><CalendarBlank size={22} weight="bold"/><span>Calendario</span></Link><Link href="/dashboard/messages"><ChatCircle size={22} weight="bold"/><span>Mensajes</span></Link><Link href="/dashboard/settings"><GearSix size={22} weight="bold"/><span>Ajustes</span></Link></nav>}</div>
  </div>;
}
