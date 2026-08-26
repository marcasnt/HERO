import { desc, eq } from "drizzle-orm";
import Image from "next/image";
import { getDb } from "@/db";
import { measurements, mediaAssets } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { addMeasurement } from "../actions";
import { UploadForm } from "./upload-form";
import { DeletePhoto } from "./delete-photo";

export default async function ProgressPage() {
  const user = await requireUser();
  if (user.role !== "client") return <main className="dashboard"><div className="empty">Esta sección corresponde al cliente.</div></main>;
  const db = getDb();
  const [photos, measures] = await Promise.all([
    db.select().from(mediaAssets).where(eq(mediaAssets.ownerId, user.id)).orderBy(desc(mediaAssets.createdAt)),
    db.select().from(measurements).where(eq(measurements.clientId, user.id)).orderBy(desc(measurements.measuredAt)).limit(20),
  ]);
  return <main className="dashboard"><div className="page-title"><div><span className="kicker">MI EVOLUCIÓN</span><h1>Progreso</h1><p>Registra datos y fotografías que solo tú y tu entrenador pueden ver.</p></div></div>
    <section className="dashboard-grid"><div className="panel"><div className="panel-head"><h2>Nueva fotografía</h2><span>Máx. 10 MB</span></div><UploadForm/></div>
      <div className="panel"><div className="panel-head"><h2>Nueva medición corporal</h2></div><form className="form-stack" action={addMeasurement}><label>Fórmula antropométrica<select name="formula" required><option value="male">Hombre</option><option value="female">Mujer</option></select></label><div className="measure-grid"><label>Peso (kg)<input name="weight" type="number" min="25" max="350" step="0.1" required/></label><label>Estatura (cm)<input name="heightCm" type="number" min="100" max="250" step="0.1" required/></label><label>Cuello (cm)<input name="neckCm" type="number" min="20" max="80" step="0.1" required/></label><label>Cintura / abdomen (cm)<input name="waistCm" type="number" min="40" max="250" step="0.1" required/></label><label>Cadera (cm)<input name="hipCm" type="number" min="40" max="250" step="0.1" required/></label><label>Brazo izquierdo (cm)<input name="leftArmCm" type="number" min="10" max="100" step="0.1" required/></label><label>Brazo derecho (cm)<input name="rightArmCm" type="number" min="10" max="100" step="0.1" required/></label><label>Pierna izquierda (cm)<input name="leftThighCm" type="number" min="20" max="150" step="0.1" required/></label><label>Pierna derecha (cm)<input name="rightThighCm" type="number" min="20" max="150" step="0.1" required/></label></div><label>Notas<textarea name="notes" placeholder="Hora, ayuno, condiciones de medición..."/></label><p className="formula-note">La grasa corporal es una estimación orientativa por circunferencias. No sustituye DEXA, evaluación médica ni diagnóstico nutricional.</p><button className="button" type="submit">Calcular y guardar</button></form></div>
    </section>
    <section className="panel"><div className="panel-head"><h2>Historial corporal</h2><span>{measures.length} registros</span></div>{measures.length ? <div className="measurement-table"><div className="measurement-row header"><span>Fecha</span><span>Peso</span><span>Grasa est.</span><span>Cuello</span><span>Cintura</span><span>Cadera</span><span>Brazos I/D</span><span>Piernas I/D</span></div>{measures.map((measure) => { const data = measure.values as Record<string, number>; return <div className="measurement-row" key={measure.id}><span>{measure.measuredAt.toLocaleDateString("es")}</span><b>{data.weight} kg</b><strong>{data.bodyFat ? `${data.bodyFat}%` : "—"}</strong><span>{data.neckCm || "—"}</span><span>{data.waistCm || data.waist || "—"}</span><span>{data.hipCm || "—"}</span><span>{data.leftArmCm || "—"} / {data.rightArmCm || "—"}</span><span>{data.leftThighCm || "—"} / {data.rightThighCm || "—"}</span></div>; })}</div> : <div className="empty">Aún no hay mediciones corporales.</div>}</section>
    <section className="panel"><div className="panel-head"><h2>Galería privada</h2><span>{photos.length} archivos</span></div>{photos.length ? <div className="photo-grid">{photos.map((photo) => <div className="photo-item" key={photo.id}><a href={`/api/media/${photo.id}`} target="_blank"><Image unoptimized fill sizes="(max-width: 700px) 50vw, 25vw" src={`/api/media/${photo.id}`} alt={photo.notes || "Mi progreso"}/><span>{photo.notes || photo.createdAt.toLocaleDateString("es")}</span></a><DeletePhoto id={photo.id}/></div>)}</div> : <div className="empty">Aún no has subido fotografías.</div>}</section>
  </main>;
}
