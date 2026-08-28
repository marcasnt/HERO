"use client";

import { useState } from "react";
import { createRoutine, updateRoutine } from "../actions";
import { ExercisePicker, type PickedExercise } from "./exercise-picker";

type Exercise = { id?: string; name: string; day: string; sets: number; reps: string; rest: number; rir: number; notes: string; gif?: string; image?: string; target?: string; equipment?: string; steps?: string[] };
const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const blank = (): Exercise => ({ name: "", day: "Lunes", sets: 3, reps: "10", rest: 90, rir: 2, notes: "" });

export function RoutineBuilder({ clients, initial, assignmentId, initialName, clientId }: { clients: Array<{ id: string; name: string }>; initial?: Exercise[]; assignmentId?: string; initialName?: string; clientId?: string }) {
  const [exercises, setExercises] = useState<Exercise[]>(initial?.length ? initial : [blank()]);
  function update(index: number, field: keyof Exercise, raw: string) {
    setExercises((current) => current.map((exercise, i) => i === index ? { ...exercise, [field]: ["sets", "rest", "rir"].includes(field) ? Number(raw) : raw } : exercise));
  }
  function selectExercise(index: number, selected: PickedExercise) {
    setExercises((current) => current.map((exercise, i) => i === index ? { ...exercise, id: selected.id, name: selected.name, gif: selected.gif, image: selected.image, target: selected.target, equipment: selected.equipment, steps: selected.steps } : exercise));
  }
  return <form className="form-stack" action={assignmentId ? updateRoutine : createRoutine}>
    {assignmentId && <input type="hidden" name="assignmentId" value={assignmentId}/>}<div className="form-row"><label>Cliente<select name="clientId" required defaultValue={clientId || ""} disabled={Boolean(assignmentId)}><option value="">Seleccionar</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label><label>Nombre del programa<input name="name" required defaultValue={initialName} placeholder="Fuerza · Bloque 1"/></label></div>
    <input type="hidden" name="definition" value={JSON.stringify(exercises.filter((exercise) => exercise.name.trim()))}/>
    <div className="builder-head"><h3>Ejercicios</h3><button className="mini-button" type="button" onClick={() => setExercises((current) => [...current, blank()])}>+ Agregar ejercicio</button></div>
    <div className="exercise-editor">{exercises.map((exercise, index) => <article key={index}><div className="exercise-number">{String(index + 1).padStart(2, "0")}</div><div className="exercise-fields"><label className="exercise-choice">Ejercicio<ExercisePicker value={exercise.name} onSelect={(selected) => selectExercise(index, selected)}/>{exercise.target && <small>{exercise.target} · {exercise.equipment}</small>}</label><label>Día<select value={exercise.day} onChange={(event) => update(index, "day", event.target.value)}>{days.map((day) => <option key={day}>{day}</option>)}</select></label><label>Series<input type="number" min="1" max="10" value={exercise.sets} onChange={(event) => update(index, "sets", event.target.value)}/></label><label>Reps<input value={exercise.reps} onChange={(event) => update(index, "reps", event.target.value)} placeholder="8-10"/></label><label>Descanso (s)<input type="number" min="0" value={exercise.rest} onChange={(event) => update(index, "rest", event.target.value)}/></label><label>RIR objetivo<input type="number" min="0" max="10" value={exercise.rir} onChange={(event) => update(index, "rir", event.target.value)}/></label><label className="wide">Indicaciones<input value={exercise.notes} onChange={(event) => update(index, "notes", event.target.value)} placeholder="Tempo, técnica, rango..."/></label></div>{exercises.length > 1 && <button className="remove-exercise" type="button" onClick={() => setExercises((current) => current.filter((_, i) => i !== index))}>Eliminar</button>}</article>)}</div>
    <button className="button" type="submit" disabled={!clients.length}>{assignmentId ? "Guardar cambios" : "Guardar y asignar programa"}</button>
  </form>;
}
