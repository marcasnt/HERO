"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Exercise = { id: string; name: string; originalName: string; bodyPart: string; target: string; equipment: string; image: string; gif: string; steps: string[] };
type BodyPart = { value: string; label: string };
const imageBase = "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/images/";
const gifBase = "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/videos/";

export function ExerciseLibrary() {
  const [query, setQuery] = useState(""); const [bodyPart, setBodyPart] = useState("");
  const [items, setItems] = useState<Exercise[]>([]); const [parts, setParts] = useState<BodyPart[]>([]);
  const [selected, setSelected] = useState<Exercise | null>(null); const [next, setNext] = useState<number | null>(null); const [total, setTotal] = useState(0);
  useEffect(() => { const controller = new AbortController(); const timer = setTimeout(async () => { const response = await fetch(`/api/exercises?v=2&q=${encodeURIComponent(query)}&bodyPart=${encodeURIComponent(bodyPart)}&offset=0&limit=30`, { signal: controller.signal }); if (!response.ok) return; const data = await response.json(); setItems(data.exercises || []); setParts(data.bodyParts || []); setNext(data.nextOffset); setTotal(data.filteredTotal || 0); }, 180); return () => { clearTimeout(timer); controller.abort(); }; }, [query, bodyPart]);
  async function loadMore() { if (next === null) return; const response = await fetch(`/api/exercises?v=2&q=${encodeURIComponent(query)}&bodyPart=${encodeURIComponent(bodyPart)}&offset=${next}&limit=30`); const data = await response.json(); setItems((current) => [...current, ...(data.exercises || [])]); setNext(data.nextOffset); }
  return <><div className="library-filters"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar ejercicio en español o inglés…"/><select value={bodyPart} onChange={(e) => setBodyPart(e.target.value)}><option value="">Todos los grupos musculares</option>{parts.map((part) => <option key={part.value} value={part.value}>{part.label}</option>)}</select></div><div className="library-count">{total} ejercicios encontrados</div><section className="exercise-library-grid">{items.map((exercise) => <button type="button" key={exercise.id} onClick={() => setSelected(exercise)}><Image unoptimized width={240} height={180} src={imageBase + exercise.image} alt={exercise.name}/><span><b>{exercise.name}</b><small>{exercise.bodyPart} · {exercise.equipment}</small></span></button>)}</section>{next !== null && <button type="button" className="button library-more" onClick={loadMore}>Mostrar más ejercicios</button>}{selected && <div className="exercise-dialog" role="dialog" aria-modal="true" onPointerDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}><article><button className="dialog-close" type="button" onClick={() => setSelected(null)}>Cerrar</button><Image unoptimized width={520} height={360} src={gifBase + selected.gif} alt={`Ejecución de ${selected.name}`}/><span className="kicker">{selected.bodyPart} · {selected.target}</span><h2>{selected.name}</h2><small>{selected.originalName} · {selected.equipment}</small><ol>{selected.steps.map((step, index) => <li key={index}>{step}</li>)}</ol></article></div>}</>;
}
