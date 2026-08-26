"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UploadForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function upload(formData: FormData) {
    setBusy(true); setMessage("");
    const capturedAt = String(formData.get("capturedAt") || "");
    if (capturedAt) formData.set("capturedAt", new Date(capturedAt).toISOString());
    const response = await fetch("/api/media/upload", { method: "POST", body: formData });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) return setMessage(result.error || "No se pudo subir la fotografía");
    setMessage("Fotografía guardada de forma privada.");
    router.refresh();
  }
  return <form className="form-stack" action={upload}>
    <label>Tipo<select name="kind"><option value="progress">Progreso</option><option value="profile">Perfil</option></select></label>
    <label>Fotografía<input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/heic" required /></label>
    <label>Fecha de captura<input name="capturedAt" type="datetime-local" /></label>
    <label>Notas<textarea name="notes" placeholder="Frente, perfil, semana 4..." maxLength={500}/></label>
    <button className="button" type="submit" disabled={busy}>{busy ? "Subiendo…" : "Guardar fotografía"}</button>
    {message && <p className="form-message">{message}</p>}
  </form>;
}
