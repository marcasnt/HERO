"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type PickedExercise = { id: string; name: string; bodyPart: string; target: string; equipment: string; image: string; gif: string; steps: string[] };
const imageBase = "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/images/";

export function ExercisePicker({ value, onSelect }: { value: string; onSelect: (exercise: PickedExercise) => void }) {
  const [open, setOpen] = useState(!value);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PickedExercise[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/exercises?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const data = await response.json();
        setItems(data.exercises || []);
      } finally { setLoading(false); }
    }, 180);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, open]);
  if (!open) return <button className="exercise-selected" type="button" onClick={() => setOpen(true)}><b>{value}</b><span>Cambiar ejercicio</span></button>;
  return <div className="exercise-picker"><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ejercicio, músculo o equipo..."/><div className="exercise-results">{loading ? <span className="picker-status">Buscando…</span> : items.map((exercise) => <button type="button" key={exercise.id} onClick={() => { onSelect(exercise); setOpen(false); }}><Image unoptimized width={58} height={58} src={imageBase + exercise.image} alt=""/><span><b>{exercise.name}</b><small>{exercise.target} · {exercise.equipment}</small></span></button>)}</div>{value && <button className="link-button" type="button" onClick={() => setOpen(false)}>Cancelar</button>}</div>;
}
