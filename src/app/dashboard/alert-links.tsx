"use client";

import Link from "next/link";
import { Bell, ChatCircle } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

type AlertCounts = { unreadMessages: number; unreadNotifications: number };

function Badge({ value }: { value: number }) {
  if (!value) return null;
  return <span className="alert-badge" aria-label={`${value} pendientes`}>{value > 99 ? "99+" : value}</span>;
}

export function AlertLinks({ initialCounts, compact = false }: { initialCounts: AlertCounts; compact?: boolean }) {
  const [counts, setCounts] = useState(initialCounts);
  const previousTotal = useRef(initialCounts.unreadMessages + initialCounts.unreadNotifications);

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const response = await fetch("/api/alerts", { cache: "no-store" });
        if (!response.ok || !active) return;
        const next = await response.json() as AlertCounts;
        const total = next.unreadMessages + next.unreadNotifications;
        if (total > previousTotal.current && "Notification" in window && Notification.permission === "granted") {
          new Notification("Nueva actividad en HERO", { body: "Tienes un mensaje o una actualización pendiente.", icon: "/hero-icon-192.png" });
        }
        previousTotal.current = total;
        setCounts(next);
      } catch {
        // La navegación sigue funcionando aunque la conexión temporalmente falle.
      }
    }
    const timer = window.setInterval(refresh, 15000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, []);

  return <div className={compact ? "alert-links compact" : "alert-links"} aria-live="polite">
    <Link aria-label={`Mensajes${counts.unreadMessages ? `, ${counts.unreadMessages} sin leer` : ""}`} href="/dashboard/messages">
      {compact ? <ChatCircle size={23} weight="bold"/> : <span>Mensajes</span>}<Badge value={counts.unreadMessages}/>
    </Link>
    <Link aria-label={`Notificaciones${counts.unreadNotifications ? `, ${counts.unreadNotifications} sin leer` : ""}`} href="/dashboard/notifications">
      {compact ? <Bell size={23} weight="bold"/> : <span>Notificaciones</span>}<Badge value={counts.unreadNotifications}/>
    </Link>
  </div>;
}
