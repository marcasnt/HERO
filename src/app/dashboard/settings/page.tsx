import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { SettingsPanel } from "./settings-panel";

export default async function SettingsPage() {
  await requireUser();
  return <main className="dashboard narrow"><div className="page-title"><div><span className="kicker">PREFERENCIAS</span><h1>Ajustes</h1><p>Adapta HERO a tu forma de entrenar y a tu dispositivo.</p></div><Link className="mini-button" href="/dashboard/profile">Editar perfil</Link></div><SettingsPanel/></main>;
}
