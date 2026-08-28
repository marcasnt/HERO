import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { CalendarBlank, ChartLineUp, ChatCircle, GearSix, House, ListBullets, Play } from "@phosphor-icons/react/dist/ssr";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <div className="app-shell">
    <aside className="sidebar">
      <Link className="brand" href="/dashboard">HERO</Link>
      <nav>
        <Link href="/dashboard">Resumen</Link>
        {user.role === "coach" ? <><Link href="/dashboard/invitations">Invitar clientes</Link><Link href="/dashboard/routines">Crear rutina</Link><Link href="/dashboard/calendar">Calendario</Link></> : <><Link href="/dashboard/plan">Mi plan</Link><Link href="/dashboard/workout">Seguir entrenamiento</Link><Link href="/dashboard/progress">Mi progreso</Link><Link href="/dashboard/exercises">Ejercicios</Link></>}
        <Link href="/dashboard/messages">Mensajes</Link>
        <Link href="/dashboard/notifications">Notificaciones</Link>
        <Link href="/dashboard/profile">Mi perfil</Link>
        <Link href="/dashboard/settings">Ajustes</Link>
      </nav>
      <div className="user-chip"><UserButton /><span><b>{user.name}</b><small>{user.role === "coach" ? "Entrenador" : "Cliente"}</small></span></div>
    </aside>
    <div className="app-content"><header className="mobile-head"><Link className="brand" href="/dashboard">HERO</Link><div className="mobile-tools"><Link aria-label="Mensajes" href="/dashboard/messages"><ChatCircle size={23} weight="bold"/></Link><Link aria-label="Ajustes" href="/dashboard/settings"><GearSix size={23} weight="bold"/></Link><UserButton /></div></header>{children}{user.role === "client" ? <nav className="mobile-nav client-tabs" aria-label="Navegación de entrenamiento"><Link href="/dashboard"><House size={22} weight="bold"/><span>Inicio</span></Link><Link href="/dashboard/plan"><CalendarBlank size={22} weight="bold"/><span>Plan</span></Link><Link className="follow-tab" href="/dashboard/workout"><span className="play-orb"><Play size={28} weight="fill"/></span><span>Seguir</span></Link><Link href="/dashboard/progress"><ChartLineUp size={22} weight="bold"/><span>Progreso</span></Link><Link href="/dashboard/exercises"><ListBullets size={22} weight="bold"/><span>Ejercicios</span></Link></nav> : <nav className="mobile-nav" aria-label="Navegación principal"><Link href="/dashboard"><House size={22} weight="bold"/><span>Resumen</span></Link><Link href="/dashboard/calendar"><CalendarBlank size={22} weight="bold"/><span>Calendario</span></Link><Link href="/dashboard/messages"><ChatCircle size={22} weight="bold"/><span>Mensajes</span></Link><Link href="/dashboard/settings"><GearSix size={22} weight="bold"/><span>Ajustes</span></Link></nav>}</div>
  </div>;
}
