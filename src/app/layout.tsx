import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./styles.css";
import { PwaRegister } from "./pwa-register";

const bodyFont = Inter({ subsets: ["latin"], variable: "--font-body" });
const displayFont = Barlow_Condensed({ subsets: ["latin"], variable: "--font-display", weight: ["600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "HERO",
  description: "Entrenamiento, seguimiento y progreso para coach y clientes",
  applicationName: "HERO",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "HERO" },
  icons: { icon: "/hero-icon-192.png", apple: "/hero-icon-192.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ClerkProvider><html lang="es" className={`${bodyFont.variable} ${displayFont.variable}`}><body>{children}<PwaRegister /></body></html></ClerkProvider>;
}
