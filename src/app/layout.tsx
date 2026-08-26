import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./styles.css";

export const metadata: Metadata = {
  title: "HERO",
  description: "Entrenamiento, seguimiento y progreso para coach y clientes",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ClerkProvider><html lang="es"><body>{children}</body></html></ClerkProvider>;
}
