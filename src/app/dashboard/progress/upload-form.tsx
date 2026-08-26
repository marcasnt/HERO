"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UploadForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function upload(formData: FormData) {
    setBusy(true); setMessage("");
    const file = formData.get("file");
    if (!(file instanceof File)) { setBusy(false); return setMessage("Selecciona una fotografía."); }
    if (file.size > 4 * 1024 * 1024) { setBusy(false); return setMessage("La fotografía supera 4 MB. Reduce su tamaño antes de subirla."); }
    const capturedAt = String(formData.get("capturedAt") || "");
    if (capturedAt) formData.set("capturedAt", new Date(capturedAt).toISOString());
    try {
      const response = await fetch("/api/media/upload", { method: "POST", body: formData });
      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json") ? await response.json() : null;
      if (!response.ok) return setMessage(result?.error || `No se pudo subir la fotografía (${response.status}).`);
      setMessage("Fotografía guardada de forma privada.");
      router.refresh();
    } catch {
      setMessage("La conexión se interrumpió. Inténtalo nuevamente.");
    } finally {
      setBusy(false);
    }
  }
  return <form className="form-stack" action={upload}>
    <label>Tipo<select name="kind"><option value="progress">Progreso</option><option value="profile">Perfil</option></select></label>
    <label>Fotografía<input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/heic" required /></label><p className="hint">JPG, PNG, WebP o HEIC · máximo 4 MB.</p>
    <label>Fecha de captura<input name="capturedAt" type="datetime-local" /></label>
    <label>Notas<textarea name="notes" placeholder="Frente, perfil, semana 4..." maxLength={500}/></label>
    <button className="button" type="submit" disabled={busy}>{busy ? "Subiendo…" : "Guardar fotografía"}</button>
    {message && <p className="form-message">{message}</p>}
  </form>;
}
