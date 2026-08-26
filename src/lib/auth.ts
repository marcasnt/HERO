import { createHash } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/db";
import { sessions, users } from "@/db/schema";

export type AppUser = { id: string; name: string; role: "coach" | "client" };

export async function requireUser(): Promise<AppUser> {
  const token = (await cookies()).get("gym_session")?.value;
  if (!token) throw new Error("UNAUTHORIZED");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const [row] = await getDb()
    .select({ id: users.id, name: users.name, role: users.role, disabled: users.disabled })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);
  if (!row || row.disabled) throw new Error("UNAUTHORIZED");
  return { id: row.id, name: row.name, role: row.role };
}

export async function requireCoach() {
  const user = await requireUser();
  if (user.role !== "coach") throw new Error("FORBIDDEN");
  return user;
}
