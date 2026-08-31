"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function compressForUpload(file: File) {
  if (file.size <= 3.5 * 1024 * 1024) return file;
  const bitmap = await createImageBitmap(file);
  const maxSide = 2200;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No fue posible procesar la fotografía");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  let quality = 0.86;
  let blob: Blob | null = null;
  do {
    blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    quality -= 0.1;
  } while (blob && blob.size > 3.8 * 1024 * 1024 && quality >= 0.45);
  if (!blob || blob.size > 4 * 1024 * 1024) throw new Error("No fue posible reducir la fotografía por debajo de 4 MB");
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + "-hero.jpg", { type: "image/jpeg", lastModified: Date.now() });
}

export function UploadForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function upload(formData: FormData) {
    setBusy(true); setMessage("");
    const file = formData.get("file");
    if (!(file instanceof File)) { setBusy(false); return setMessage("Selecciona una fotografía."); }
    if (file.size > 30 * 1024 * 1024) { setBusy(false); return setMessage("La fotografía supera 30 MB y no puede procesarse."); }
    const capturedAt = String(formData.get("capturedAt") || "");
    if (capturedAt) formData.set("capturedAt", new Date(capturedAt).toISOString());
    try {
      if (file.size > 3.5 * 1024 * 1024) setMessage("Comprimiendo fotografía…");
      const optimized = await compressForUpload(file);
      formData.set("file", optimized);
      setMessage("Subiendo fotografía privada…");
      const response = await fetch("/api/media/upload", { method: "POST", body: formData });
      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json") ? await response.json() : null;
      if (!response.ok) return setMessage(result?.error || `No se pudo subir la fotografía (${response.status}).`);
      setMessage("Fotografía guardada de forma privada.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "La conexión se interrumpió. Inténtalo nuevamente.");
    } finally {
      setBusy(false);
    }
  }
  return <form className="form-stack" action={upload}>
    <input name="kind" type="hidden" value="progress"/>
    <label>Fotografía<input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/heic" required /></label><p className="hint">JPG, PNG, WebP o HEIC · las imágenes grandes se comprimen automáticamente.</p>
    <label>Fecha de captura<input name="capturedAt" type="datetime-local" /></label>
    <label>Notas<textarea name="notes" placeholder="Frente, perfil, semana 4..." maxLength={500}/></label>
    <button className="button" type="submit" disabled={busy}>{busy ? "Subiendo…" : "Guardar fotografía"}</button>
    {message && <p className="form-message">{message}</p>}
  </form>;
}
