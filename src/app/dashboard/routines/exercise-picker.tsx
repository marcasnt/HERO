"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type PickedExercise = { id: string; name: string; originalName: string; bodyPart: string; target: string; equipment: string; image: string; gif: string; steps: string[] };
const imageBase = "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/images/";

export function ExercisePicker({ value, onSelect }: { value: string; onSelect: (exercise: PickedExercise) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(!value);
  const [query, setQuery] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const [items, setItems] = useState<PickedExercise[]>([]);
  const [bodyParts, setBodyParts] = useState<Array<{ value: string; label: string }>>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const closeEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", closeEscape); };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/exercises?q=${encodeURIComponent(query)}&bodyPart=${encodeURIComponent(bodyPart)}&offset=0&limit=30`, { signal: controller.signal });
        const data = await response.json();
        setItems(data.exercises || []);
        setBodyParts(data.bodyParts || []);
        setNextOffset(data.nextOffset);
        setTotal(data.filteredTotal || 0);
      } finally { setLoading(false); }
    }, 180);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, bodyPart, open]);
  async function loadMore() {
    if (nextOffset === null) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/exercises?q=${encodeURIComponent(query)}&bodyPart=${encodeURIComponent(bodyPart)}&offset=${nextOffset}&limit=30`);
      const data = await response.json();
      setItems((current) => [...current, ...(data.exercises || [])]);
      setNextOffset(data.nextOffset);
    } finally { setLoading(false); }
  }
  if (!open) return <button className="exercise-selected" type="button" onClick={() => setOpen(true)}><b>{value}</b><span>Cambiar ejercicio</span></button>;
  return <div className="exercise-picker" ref={rootRef}><div className="picker-filters"><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en español o inglés..."/><select value={bodyPart} onChange={(event) => setBodyPart(event.target.value)}><option value="">Todos los grupos musculares</option>{bodyParts.map((part) => <option value={part.value} key={part.value}>{part.label}</option>)}</select></div><div className="exercise-results"><div className="picker-count">{items.length} de {total} ejercicios</div>{items.map((exercise) => <button type="button" key={exercise.id} onClick={() => { onSelect(exercise); setOpen(false); }}><Image unoptimized width={58} height={58} src={imageBase + exercise.image} alt=""/><span><b>{exercise.name}</b><small>{exercise.originalName} · {exercise.bodyPart} · {exercise.target} · {exercise.equipment}</small></span></button>)}{loading && <span className="picker-status">Cargando…</span>}{nextOffset !== null && !loading && <button className="load-more" type="button" onClick={loadMore}>Mostrar 30 más</button>}{!items.length && !loading && <span className="picker-status">No hay coincidencias.</span>}</div>{value && <button className="link-button" type="button" onClick={() => setOpen(false)}>Cancelar</button>}</div>;
}
