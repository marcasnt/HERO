import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  buildCommand: "npm run build",
  // Hobby-compatible: 13:00 UTC = 07:00 in Nicaragua (UTC-6).
  crons: [{ path: "/api/cron/reminders", schedule: "0 13 * * *" }],
};
