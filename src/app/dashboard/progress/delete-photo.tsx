"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeletePhoto({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return <button className="delete-photo" disabled={busy} type="button" onClick={async () => { if (!window.confirm("¿Eliminar esta fotografía definitivamente?")) return; setBusy(true); const response = await fetch(`/api/media/${id}`, { method: "DELETE" }); setBusy(false); if (response.ok) router.refresh(); }}>{busy ? "…" : "Eliminar"}</button>;
}
