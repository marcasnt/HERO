"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

type Preferences = { units: "kg" | "lb"; restSeconds: number; restPauseSeconds: number; keepAwake: boolean; sounds: boolean; reminders: boolean; theme: "dark" | "light" | "system"; bodyDiagram: "male" | "female"; accent: string };
const defaults: Preferences = { units: "kg", restSeconds: 90, restPauseSeconds: 20, keepAwake: false, sounds: true, reminders: false, theme: "dark", bodyDiagram: "male", accent: "#9cff45" };
const accents = ["#9cff45", "#23d9d2", "#ffd43b", "#ef5cff", "#ff5353", "#ff9f1c", "#55b7ff"];

function applyPreferences(value: Preferences) {
  document.documentElement.dataset.theme = value.theme;
  document.documentElement.style.setProperty("--accent", value.accent);
}

export function SettingsPanel() {
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { const saved = localStorage.getItem("hero-preferences"); if (saved) { queueMicrotask(() => { try { const parsed = { ...defaults, ...JSON.parse(saved) }; setPreferences(parsed); applyPreferences(parsed); } catch {} }); } }, []);
  async function update(patch: Partial<Preferences>) {
    const next = { ...preferences, ...patch }; setPreferences(next); localStorage.setItem("hero-preferences", JSON.stringify(next)); applyPreferences(next);
    if (patch.keepAwake && "wakeLock" in navigator) { try { await navigator.wakeLock.request("screen"); } catch {} }
    if (patch.reminders && "Notification" in window) await Notification.requestPermission();
  }
  function exportJson() {
    const blob = new Blob([JSON.stringify({ type: "hero-preferences", version: 1, preferences }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "hero-preferencias.json"; anchor.click(); URL.revokeObjectURL(url);
  }
  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    try { const data = JSON.parse(await file.text()); const next = { ...defaults, ...(data.preferences || data) }; setPreferences(next); localStorage.setItem("hero-preferences", JSON.stringify(next)); applyPreferences(next); } catch { alert("El archivo no contiene preferencias válidas de HERO."); }
    event.target.value = "";
  }
  return <div className="settings-sections">
    <section className="panel settings-group"><div><span className="kicker">ENTRENAMIENTO</span><h2>Unidades y temporizadores</h2></div><label>Unidad de peso<select value={preferences.units} onChange={(e) => update({ units: e.target.value as Preferences["units"] })}><option value="kg">Kilogramos (kg)</option><option value="lb">Libras (lb)</option></select></label><label>Descanso entre series (segundos)<input type="number" min="10" max="600" value={preferences.restSeconds} onChange={(e) => update({ restSeconds: Number(e.target.value) })}/></label><label>Rest-pause (segundos)<input type="number" min="5" max="120" value={preferences.restPauseSeconds} onChange={(e) => update({ restPauseSeconds: Number(e.target.value) })}/></label><label className="setting-toggle"><span><b>Mantener pantalla encendida</b><small>Durante la ejecución del entrenamiento</small></span><input type="checkbox" checked={preferences.keepAwake} onChange={(e) => update({ keepAwake: e.target.checked })}/></label><label className="setting-toggle"><span><b>Sonidos</b><small>Avisos del temporizador</small></span><input type="checkbox" checked={preferences.sounds} onChange={(e) => update({ sounds: e.target.checked })}/></label><label className="setting-toggle"><span><b>Recordatorios</b><small>Solicita permiso de notificaciones del dispositivo</small></span><input type="checkbox" checked={preferences.reminders} onChange={(e) => update({ reminders: e.target.checked })}/></label></section>
    <section className="panel settings-group"><div><span className="kicker">APARIENCIA</span><h2>Personalización</h2></div><label>Tema<select value={preferences.theme} onChange={(e) => update({ theme: e.target.value as Preferences["theme"] })}><option value="dark">Oscuro</option><option value="light">Claro</option><option value="system">Sistema</option></select></label><label>Diagrama corporal<select value={preferences.bodyDiagram} onChange={(e) => update({ bodyDiagram: e.target.value as Preferences["bodyDiagram"] })}><option value="male">Masculino</option><option value="female">Femenino</option></select></label><div className="accent-picker"><span>Color de acento</span><div>{accents.map((accent) => <button aria-label={`Usar color ${accent}`} className={preferences.accent === accent ? "selected" : ""} style={{ backgroundColor: accent }} onClick={() => update({ accent })} type="button" key={accent}/>)}</div></div></section>
    <section className="panel settings-group"><div><span className="kicker">COPIA LOCAL</span><h2>Exportar e importar preferencias</h2><p>Guarda unidades, temporizadores y apariencia. Tus rutinas y progreso permanecen seguros en la nube.</p></div><div className="settings-actions"><button className="button" type="button" onClick={exportJson}>Exportar JSON</button><button className="mini-button" type="button" onClick={() => fileRef.current?.click()}>Importar JSON</button><input ref={fileRef} hidden type="file" accept="application/json" onChange={importJson}/></div></section>
  </div>;
}
