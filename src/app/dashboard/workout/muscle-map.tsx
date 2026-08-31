"use client";

import { useEffect, useMemo, useState } from "react";

type MuscleLoad = Record<string, number>;
type BodyView = { vb: string; p: Record<string, string[]> };
type BodyGeometry = Record<"male" | "female", { front: BodyView; back: BodyView }>;
type ExerciseMuscle = { target?: string; sets: number };

const muscles = ["trapezius", "deltoids", "chest", "upper-back", "serratus", "biceps", "triceps", "forearm", "abs", "obliques", "lower-back", "gluteal", "quadriceps", "hamstring", "adductors", "hip-flexors", "calves", "tibialis"];
const inert = ["head", "hair", "neck", "hands", "feet", "knees", "ankles"];
const labels: Record<string, string> = { trapezius: "Trapecios", deltoids: "Hombros", chest: "Pectorales", "upper-back": "Espalda", serratus: "Serrato", biceps: "Bíceps", triceps: "Tríceps", forearm: "Antebrazos", abs: "Abdominales", obliques: "Oblicuos", "lower-back": "Zona lumbar", gluteal: "Glúteos", quadriceps: "Cuádriceps", hamstring: "Isquiotibiales", adductors: "Aductores", "hip-flexors": "Flexores de cadera", calves: "Pantorrillas", tibialis: "Tibial" };
const aliases: Array<[RegExp, string[]]> = [
  [/pectoral|chest|pecho/i, ["chest"]], [/delt|shoulder|hombro/i, ["deltoids"]], [/tr[ií]cep/i, ["triceps"]], [/b[ií]cep|braquial/i, ["biceps"]],
  [/lat|dorsal|rhomboid|espalda superior|upper back/i, ["upper-back"]], [/trapec|trap/i, ["trapezius"]], [/antebrazo|forearm|grip|agarre/i, ["forearm"]],
  [/abdominal|\babs\b|core/i, ["abs"]], [/oblic/i, ["obliques"]], [/lumbar|lower back|spine/i, ["lower-back"]],
  [/gl[uú]te|glute/i, ["gluteal"]], [/cu[aá]dr|quad/i, ["quadriceps"]], [/isquio|hamstring/i, ["hamstring"]], [/aductor|adductor|inner thigh/i, ["adductors"]],
  [/flexor.*cadera|hip flexor/i, ["hip-flexors"]], [/pantorr|gemelo|calf|calves/i, ["calves"]], [/tibial|shin/i, ["tibialis"]],
];

export function muscleLoadOf(exercises: ExerciseMuscle[]) {
  const load: MuscleLoad = {};
  for (const exercise of exercises) {
    const match = aliases.find(([pattern]) => pattern.test(exercise.target || ""));
    for (const muscle of match?.[1] || []) load[muscle] = (load[muscle] || 0) + Math.max(1, exercise.sets || 1);
  }
  return load;
}

function BodyViewSvg({ view, load }: { view: BodyView; load: MuscleLoad }) {
  const max = Math.max(0, ...Object.values(load));
  return <svg className="hero-body-view" viewBox={view.vb} role="img" aria-label="Mapa de músculos trabajados">
    {inert.flatMap((slug) => (view.p[slug] || []).map((d, index) => <path className="body-inert" d={d} key={`${slug}-${index}`}/>))}
    {muscles.flatMap((slug) => { const level = load[slug] ? Math.max(1, Math.min(4, Math.ceil(load[slug] / max * 4))) : 0; return (view.p[slug] || []).map((d, index) => <path className={`body-muscle level-${level}`} d={d} key={`${slug}-${index}`}><title>{labels[slug]}</title></path>); })}
  </svg>;
}

export function MuscleMap({ exercises, compact = false }: { exercises: ExerciseMuscle[]; compact?: boolean }) {
  const [geometry, setGeometry] = useState<BodyGeometry | null>(null);
  const [body, setBody] = useState<"male" | "female">("male");
  const load = useMemo(() => muscleLoadOf(exercises), [exercises]);
  const worked = muscles.filter((muscle) => load[muscle]).sort((a, b) => load[b] - load[a]);
  useEffect(() => {
    let active = true;
    try { const saved = JSON.parse(localStorage.getItem("hero-preferences") || "{}"); if (saved.bodyDiagram === "female") queueMicrotask(() => setBody("female")); } catch {}
    // Geometría original de openGym/MuscleMap, cargada solo cuando el mapa es visible.
    // @ts-expect-error El módulo original es JavaScript y conserva intactos los paths MIT.
    void import("../../../../frontend/src/lib/body-paths.js").then((module) => { if (active) setGeometry(module.default as BodyGeometry); });
    return () => { active = false; };
  }, []);
  const selected = geometry?.[body] || geometry?.male;
  return <div className={compact ? "muscle-summary compact" : "muscle-summary"}>
    <div className="muscle-summary-copy"><span className="kicker">MÚSCULOS IMPLICADOS</span><h3>{worked.length ? "Tu enfoque de hoy" : "Entrenamiento general"}</h3><div className="muscle-chips">{worked.map((muscle) => <span key={muscle}>{labels[muscle]}</span>)}</div></div>
    <div className="hero-body-map">{selected ? <><BodyViewSvg view={selected.front} load={load}/><BodyViewSvg view={selected.back} load={load}/></> : <div className="body-map-loading">Preparando mapa corporal…</div>}</div>
  </div>;
}
