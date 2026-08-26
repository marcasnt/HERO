const features = [
  ["Rutinas", "Asigna planes versionados y revisa cada sesión."],
  ["Ejecución", "Compara lo prescrito con las series realizadas."],
  ["Progreso", "Centraliza medidas, fotografías privadas y check-ins."],
  ["Analíticas", "Adherencia, volumen, esfuerzo y evolución de fuerza."],
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <span className="eyebrow">OPEN GYM COACH</span>
        <h1>Tu entrenamiento.<br />Tus clientes. Una sola vista.</h1>
        <p>Base preparada para Vercel, PostgreSQL y almacenamiento privado de fotografías.</p>
        <div className="actions"><a href="#modules">Ver arquitectura</a><button type="button" disabled>Acceso próximamente</button></div>
      </section>
      <section id="modules" className="grid">
        {features.map(([title, body]) => <article key={title}><span>0{features.findIndex(([item]) => item === title) + 1}</span><h2>{title}</h2><p>{body}</p></article>)}
      </section>
      <footer>Infraestructura inicial configurada · Los archivos privados nunca exponen una URL pública.</footer>
    </main>
  );
}
