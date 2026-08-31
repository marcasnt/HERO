"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { optimizeImage } from "@/lib/client-image";

export function ProfilePhotoUpload({ currentPhoto, name }: { currentPhoto: string | null; name: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentPhoto);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function selectPhoto(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setMessage("Selecciona una imagen válida.");
    if (file.size > 30 * 1024 * 1024) return setMessage("La imagen supera el límite de 30 MB.");
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setBusy(true);
    setMessage("Preparando fotografía…");
    try {
      const optimized = await optimizeImage(file, {
        maxWidth: 512,
        maxHeight: 512,
        targetBytes: 250 * 1024,
        cropSquare: true,
        fileName: "perfil-hero.jpg",
      });
      const form = new FormData();
      form.set("file", optimized);
      form.set("kind", "profile");
      form.set("notes", "Fotografía de perfil");
      const response = await fetch("/api/media/upload", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "No se pudo guardar la fotografía.");
      setMessage("Fotografía de perfil actualizada.");
      router.refresh();
    } catch (error) {
      setPreview(currentPhoto);
      setMessage(error instanceof Error ? error.message : "No se pudo subir la fotografía.");
    } finally {
      URL.revokeObjectURL(localPreview);
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return <section className="profile-photo-card">
    <div className="profile-photo">
      {preview ? <Image src={preview} alt={`Fotografía de ${name}`} fill sizes="112px" unoptimized/> : <span>{name.slice(0, 2).toUpperCase()}</span>}
    </div>
    <div><span className="kicker">FOTO DE PERFIL</span><h2>Personaliza tu cuenta</h2><p>Esta imagen será visible para tu entrenador o tus clientes vinculados.</p>
      <input ref={inputRef} className="sr-only" id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp,image/heic" onChange={(event) => void selectPhoto(event.target.files?.[0])}/>
      <button className="mini-button" type="button" disabled={busy} onClick={() => inputRef.current?.click()}>{busy ? "Subiendo…" : preview ? "Cambiar fotografía" : "Agregar fotografía"}</button>
      {message ? <p className="form-message" role="status">{message}</p> : null}
    </div>
  </section>;
}
