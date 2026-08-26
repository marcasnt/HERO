import { desc, eq } from "drizzle-orm";
import Image from "next/image";
import { getDb } from "@/db";
import { mediaAssets } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { addMeasurement } from "../actions";
import { UploadForm } from "./upload-form";

export default async function ProgressPage() {
  const user = await requireUser();
  if (user.role !== "client") return <main className="dashboard"><div className="empty">Esta sección corresponde al cliente.</div></main>;
  const db = getDb();
  const photos = await db.select().from(mediaAssets).where(eq(mediaAssets.ownerId, user.id)).orderBy(desc(mediaAssets.createdAt));
  return <main className="dashboard"><div className="page-title"><div><span className="kicker">MI EVOLUCIÓN</span><h1>Progreso</h1><p>Registra datos y fotografías que solo tú y tu entrenador pueden ver.</p></div></div>
    <section className="dashboard-grid"><div className="panel"><div className="panel-head"><h2>Nueva fotografía</h2><span>Máx. 10 MB</span></div><UploadForm/></div>
      <div className="panel"><div className="panel-head"><h2>Nueva medición</h2></div><form className="form-stack" action={addMeasurement}><label>Peso (kg)<input name="weight" type="number" step="0.1" placeholder="75.5"/></label><label>Cintura (cm)<input name="waist" type="number" step="0.1" placeholder="82"/></label><label>Notas<textarea name="notes" placeholder="Condiciones de la medición"/></label><button className="button" type="submit">Guardar medición</button></form></div>
    </section>
    <section className="panel"><div className="panel-head"><h2>Galería privada</h2><span>{photos.length} archivos</span></div>{photos.length ? <div className="photo-grid">{photos.map((photo) => <a href={`/api/media/${photo.id}`} target="_blank" key={photo.id}><Image unoptimized fill sizes="(max-width: 700px) 50vw, 25vw" src={`/api/media/${photo.id}`} alt={photo.notes || "Mi progreso"}/><span>{photo.notes || photo.createdAt.toLocaleDateString("es")}</span></a>)}</div> : <div className="empty">Aún no has subido fotografías.</div>}</section>
  </main>;
}
