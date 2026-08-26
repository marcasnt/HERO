import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { clientInvites } from "@/db/schema";
import { requireCoach } from "@/lib/auth";
import { createInvite, revokeInvite } from "../actions";
import { CopyButton } from "./copy-button";

export default async function InvitationsPage() {
  const coach = await requireCoach();
  const invites = await getDb().select().from(clientInvites).where(eq(clientInvites.coachId, coach.id)).orderBy(desc(clientInvites.createdAt));
  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://hero-train-v2.vercel.app";
  return <main className="dashboard"><div className="page-title"><div><span className="kicker">ACCESO PRIVADO</span><h1>Invitar clientes</h1><p>Genera un enlace personal, envíalo y el cliente quedará vinculado contigo al entrar con Google.</p></div></div>
    <section className="dashboard-grid"><div className="panel"><div className="panel-head"><h2>Nueva invitación</h2><span>Válida 7 días</span></div><form className="form-stack" action={createInvite}><label>Correo del cliente (opcional)<input name="email" type="email" placeholder="cliente@gmail.com"/></label><p className="hint">Si indicas un correo, solo esa cuenta de Google podrá aceptar el enlace.</p><button className="button" type="submit">Generar enlace privado</button></form></div>
      <div className="panel"><div className="panel-head"><h2>Cómo funciona</h2></div><ol className="steps"><li>Genera y copia el enlace.</li><li>Envíalo por WhatsApp o correo.</li><li>El cliente entra con Google.</li><li>Aparece automáticamente en tu panel.</li></ol></div></section>
    <section className="panel"><div className="panel-head"><h2>Invitaciones</h2><span>{invites.length} generadas</span></div>{invites.length ? <div className="invite-list">{invites.map((invite) => { const url = `${origin}/invite/${invite.token}`; const expired = invite.expiresAt < new Date(); return <div key={invite.id}><span><b>{invite.email || "Cualquier cuenta con el enlace"}</b><small>{invite.status === "accepted" ? "Aceptada" : invite.status === "revoked" ? "Revocada" : expired ? "Expirada" : `Vence ${invite.expiresAt.toLocaleDateString("es")}`}</small></span>{invite.status === "pending" && !expired && <><CopyButton url={url}/><form action={revokeInvite}><input type="hidden" name="id" value={invite.id}/><button className="link-danger" type="submit">Revocar</button></form></>}</div>; })}</div> : <div className="empty">Aún no has generado invitaciones.</div>}</section>
  </main>;
}
