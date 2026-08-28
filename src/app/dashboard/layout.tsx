import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <div className="app-shell">
    <aside className="sidebar">
      <Link className="brand" href="/dashboard">HERO</Link>
      <nav>
        <Link href="/dashboard">Resumen</Link>
        {user.role === "coach" ? <><Link href="/dashboard/invitations">Invitar clientes</Link><Link href="/dashboard/routines">Crear rutina</Link></> : <Link href="/dashboard/progress">Mi progreso</Link>}
        <Link href="/dashboard/calendar">Calendario</Link>
        <Link href="/dashboard/messages">Mensajes</Link>
        <Link href="/dashboard/notifications">Notificaciones</Link>
        <Link href="/dashboard/profile">Mi perfil</Link>
      </nav>
      <div className="user-chip"><UserButton /><span><b>{user.name}</b><small>{user.role === "coach" ? "Entrenador" : "Cliente"}</small></span></div>
    </aside>
    <div className="app-content"><header className="mobile-head"><Link className="brand" href="/dashboard">HERO</Link><UserButton /></header>{children}<nav className="mobile-nav"><Link href="/dashboard">Resumen</Link>{user.role === "client" && <Link href="/dashboard/progress">Progreso</Link>}<Link href="/dashboard/calendar">Calendario</Link><Link href="/dashboard/messages">Mensajes</Link><Link href="/dashboard/profile">Perfil</Link></nav></div>
  </div>;
}
