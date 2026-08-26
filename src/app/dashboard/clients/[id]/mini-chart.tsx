export function MiniChart({ values, label, suffix = "" }: { values: number[]; label: string; suffix?: string }) {
  if (!values.length) return <div className="empty chart-empty">Sin datos para {label.toLowerCase()}.</div>;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => `${values.length === 1 ? 50 : (index / (values.length - 1)) * 100},${90 - ((value - min) / range) * 72}`).join(" ");
  return <div className="chart"><div><span>{label}</span><strong>{values.at(-1)}{suffix}</strong></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label={`Gráfica de ${label}`}><polyline points={points} fill="none" vectorEffect="non-scaling-stroke"/></svg><small>{min}{suffix} — {max}{suffix}</small></div>;
}
