"use client";

import { Trophy } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { completeWorkout } from "../actions";
import { MuscleMap } from "./muscle-map";

type ExerciseMuscle = { target?: string; sets: number };
type Summary = { durationSeconds: number; volume: number; series: number; records: number };

function durationLabel(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes} min`;
}

export function WorkoutForm({ assignmentId, exerciseIndexes, exercises, children }: { assignmentId: string; exerciseIndexes: number[]; exercises: ExerciseMuscle[]; children: React.ReactNode }) {
  const router = useRouter();
  const startedAt = useRef(0);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  useEffect(() => { startedAt.current = Date.now(); }, []);
  async function finish(formData: FormData) {
    setBusy(true);
    formData.set("assignmentId", assignmentId);
    formData.set("exerciseIndexes", JSON.stringify(exerciseIndexes));
    formData.set("startedAt", String(startedAt.current));
    try { setSummary(await completeWorkout(formData)); } finally { setBusy(false); }
  }
  return <><form action={finish}>{children}<button className="button finish-workout" type="submit" disabled={busy}>{busy ? "Guardando entrenamiento…" : "Completar y guardar sesión"}</button></form>{summary ? <div className="workout-complete-overlay" role="dialog" aria-modal="true" aria-labelledby="workout-complete-title"><section className="workout-complete-card"><Trophy className="complete-trophy" size={54} weight="duotone"/><h2 id="workout-complete-title">¡Entrenamiento completado!</h2><div className="complete-stats"><div><span>Duración</span><strong>{durationLabel(summary.durationSeconds)}</strong></div><div><span>Volumen</span><strong>{summary.volume.toLocaleString("es")} kg</strong></div><div><span>Series</span><strong>{summary.series} realizadas</strong></div><div><span>Récords</span><strong>{summary.records || "—"}</strong></div></div><p>Lo que acabas de entrenar</p><MuscleMap exercises={exercises} compact/><button className="button" type="button" onClick={() => { setSummary(null); router.push("/dashboard/progress"); router.refresh(); }}>¡Genial!</button></section></div> : null}</>;
}
