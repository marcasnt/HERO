import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const features = [
  ["Rutinas", "Asigna planes versionados y revisa cada sesión."],
  ["Ejecución", "Compara lo prescrito con las series realizadas."],
  ["Progreso", "Centraliza medidas, fotografías privadas y check-ins."],
  ["Analíticas", "Adherencia, volumen, esfuerzo y evolución de fuerza."],
];

export default async function Home() {
  const { userId } = await auth();
  return (
    <main>
      <section className="hero">
        <span className="eyebrow">HERO</span>
        <h1>Tu entrenamiento.<br />Tus clientes. Una sola vista.</h1>
        <p>Base preparada para Vercel, PostgreSQL y almacenamiento privado de fotografías.</p>
        <div className="actions">
          {userId ? <Link href="/dashboard">Ir a mi panel</Link> : <><Link href="/sign-in">Entrar a HERO</Link><Link className="secondary" href="/sign-up">Crear cuenta</Link></>}
        </div>
      </section>
      <section id="modules" className="grid">
        {features.map(([title, body]) => <article key={title}><span>0{features.findIndex(([item]) => item === title) + 1}</span><h2>{title}</h2><p>{body}</p></article>)}
      </section>
      <footer>Infraestructura inicial configurada · Los archivos privados nunca exponen una URL pública.</footer>
    </main>
  );
}
