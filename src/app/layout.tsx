import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./styles.css";
import { PwaRegister } from "./pwa-register";

export const metadata: Metadata = {
  title: "HERO",
  description: "Entrenamiento, seguimiento y progreso para coach y clientes",
  applicationName: "HERO",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "HERO" },
  icons: { icon: "/hero-icon-192.png", apple: "/hero-icon-192.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ClerkProvider><html lang="es"><body>{children}<PwaRegister /></body></html></ClerkProvider>;
}
