"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markNotificationsRead } from "../actions";

export function AutoReadNotifications() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    void markNotificationsRead().then(() => {
      if (active) router.refresh();
    });
    return () => { active = false; };
  }, [router]);

  return <span className="notification-seen-note" role="status">Actualizando notificaciones…</span>;
}
