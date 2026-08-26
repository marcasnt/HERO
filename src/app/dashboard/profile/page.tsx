import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { updateProfile } from "../actions";

export default async function ProfilePage() {
  const user = await requireUser();
  const [profile] = await getDb().select().from(users).where(eq(users.id, user.id)).limit(1);
  return <main className="dashboard narrow"><div className="page-title"><div><span className="kicker">CUENTA</span><h1>Mi perfil</h1><p>Información visible para tu entrenador o clientes vinculados.</p></div></div><section className="panel"><form className="form-stack" action={updateProfile}><label>Nombre<input name="name" defaultValue={profile.name} required/></label><label>Correo de Google<input value={profile.email || ""} disabled/></label><label>Teléfono<input name="phone" defaultValue={profile.phone || ""} placeholder="WhatsApp o contacto"/></label><label>Presentación<textarea name="bio" defaultValue={profile.bio || ""} placeholder="Objetivos, experiencia o especialidad"/></label><button className="button" type="submit">Guardar perfil</button></form></section></main>;
}
