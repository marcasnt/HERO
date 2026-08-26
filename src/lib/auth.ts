import { auth, currentUser } from "@clerk/nextjs/server";
import { count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";

export type AppUser = { id: string; name: string; role: "coach" | "client" };

export async function requireUser(): Promise<AppUser> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHORIZED");
  const db = getDb();
  let [row] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (!row) {
    const clerk = await currentUser();
    if (!clerk) throw new Error("UNAUTHORIZED");
    const [{ total }] = await db.select({ total: count() }).from(users);
    const role = Number(total) === 0 ? "coach" : "client";
    [row] = await db.insert(users).values({
      clerkId: userId,
      name: clerk.fullName || clerk.firstName || "Usuario HERO",
      email: clerk.primaryEmailAddress?.emailAddress,
      role,
    }).onConflictDoNothing().returning();
    if (!row) [row] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  }
  if (!row || row.disabled) throw new Error("UNAUTHORIZED");
  return { id: row.id, name: row.name, role: row.role };
}

export async function requireCoach() {
  const user = await requireUser();
  if (user.role !== "coach") throw new Error("FORBIDDEN");
  return user;
}
