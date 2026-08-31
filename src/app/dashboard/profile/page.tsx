import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { mediaAssets, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { updateProfile } from "../actions";
import { ProfilePhotoUpload } from "./profile-photo-upload";

export default async function ProfilePage() {
  const user = await requireUser();
  const db = getDb();
  const [[profile], [photo]] = await Promise.all([
    db.select().from(users).where(eq(users.id, user.id)).limit(1),
    db.select({ id: mediaAssets.id }).from(mediaAssets).where(and(eq(mediaAssets.ownerId, user.id), eq(mediaAssets.kind, "profile"))).orderBy(desc(mediaAssets.createdAt)).limit(1),
  ]);
  return <main className="dashboard narrow"><div className="page-title"><div><span className="kicker">CUENTA</span><h1>Mi perfil</h1><p>Información visible para tu entrenador o clientes vinculados.</p></div></div><ProfilePhotoUpload currentPhoto={photo ? `/api/media/${photo.id}` : null} name={profile.name}/><section className="panel"><form className="form-stack" action={updateProfile}><label>Nombre<input name="name" defaultValue={profile.name} required/></label><label>Correo de Google<input value={profile.email || ""} disabled/></label><label>Teléfono<input name="phone" defaultValue={profile.phone || ""} placeholder="WhatsApp o contacto"/></label><label>Presentación<textarea name="bio" defaultValue={profile.bio || ""} placeholder="Objetivos, experiencia o especialidad"/></label><button className="button" type="submit">Guardar perfil</button></form></section></main>;
}
