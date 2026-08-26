import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { clientInvites, users } from "@/db/schema";
import { acceptInvite } from "@/app/dashboard/actions";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [invite] = await getDb().select({ status: clientInvites.status, expiresAt: clientInvites.expiresAt, coachName: users.name })
    .from(clientInvites).innerJoin(users, eq(users.id, clientInvites.coachId))
    .where(and(eq(clientInvites.token, token), eq(clientInvites.status, "pending"))).limit(1);
  const valid = invite && invite.expiresAt > new Date();
  const { userId } = await auth();
  return <main className="invite-page"><Link className="brand" href="/">HERO</Link><section className="invite-card"><span className="kicker">INVITACIÓN PRIVADA</span><h1>{valid ? `${invite.coachName} te invita a entrenar` : "Invitación no disponible"}</h1>{valid ? <><p>Accede con tu cuenta de Google para conectar tu perfil, recibir rutinas y registrar tu progreso.</p>{userId ? <form action={acceptInvite}><input type="hidden" name="token" value={token}/><button className="button" type="submit">Aceptar y entrar a HERO</button></form> : <div className="actions"><Link href={`/sign-up?redirect_url=${encodeURIComponent(`/invite/${token}`)}`}>Continuar con Google</Link><Link className="secondary" href={`/sign-in?redirect_url=${encodeURIComponent(`/invite/${token}`)}`}>Ya tengo cuenta</Link></div>}</> : <p>El enlace expiró, fue utilizado o revocado. Solicita uno nuevo a tu entrenador.</p>}</section></main>;
}
