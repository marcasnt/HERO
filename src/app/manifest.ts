import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HERO · Entrenamiento online",
    short_name: "HERO",
    description: "Rutinas, progreso y comunicación privada con tu entrenador.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0b0d0c",
    theme_color: "#9cff57",
    orientation: "portrait-primary",
    categories: ["fitness", "health", "lifestyle"],
    icons: [
      { src: "/hero-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/hero-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/hero-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
