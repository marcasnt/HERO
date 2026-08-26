"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { coachClients, measurements, programAssignments, weeklyCheckins, workoutSessions } from "@/db/schema";
import { requireCoach, requireUser } from "@/lib/auth";

function value(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

export async function createRoutine(form: FormData) {
  const coach = await requireCoach();
  const clientId = value(form, "clientId");
  const [relation] = await getDb().select({ id: coachClients.id }).from(coachClients)
    .where(and(eq(coachClients.coachId, coach.id), eq(coachClients.clientId, clientId))).limit(1);
  if (!relation) throw new Error("FORBIDDEN");
  const exercises = value(form, "exercises").split("\n").map((line) => {
    const [name, sets = "3", reps = "10"] = line.split("|").map((part) => part.trim());
    return { name, sets: Number(sets) || 3, reps: reps || "10" };
  }).filter((item) => item.name);
  if (!exercises.length) throw new Error("Agrega al menos un ejercicio");
  await getDb().insert(programAssignments).values({
    coachId: coach.id,
    clientId,
    name: value(form, "name") || "Rutina HERO",
    definition: { exercises },
    startsOn: new Date(),
  });
  revalidatePath("/dashboard");
  redirect(`/dashboard/clients/${clientId}`);
}

export async function completeWorkout(form: FormData) {
  const user = await requireUser();
  if (user.role !== "client") throw new Error("FORBIDDEN");
  const assignmentId = value(form, "assignmentId");
  const [assignment] = await getDb().select().from(programAssignments)
    .where(and(eq(programAssignments.id, assignmentId), eq(programAssignments.clientId, user.id))).limit(1);
  if (!assignment) throw new Error("FORBIDDEN");
  const now = new Date();
  await getDb().insert(workoutSessions).values({
    clientId: user.id,
    assignmentId,
    status: "completed",
    startedAt: now,
    completedAt: now,
    execution: assignment.definition,
    clientFeedback: value(form, "feedback"),
  });
  revalidatePath("/dashboard");
}

export async function addMeasurement(form: FormData) {
  const user = await requireUser();
  if (user.role !== "client") throw new Error("FORBIDDEN");
  const weight = Number(value(form, "weight"));
  const waist = Number(value(form, "waist"));
  await getDb().insert(measurements).values({
    clientId: user.id,
    values: { weight: Number.isFinite(weight) ? weight : null, waist: Number.isFinite(waist) ? waist : null },
    notes: value(form, "notes"),
  });
  revalidatePath("/dashboard/progress");
}

export async function submitCheckin(form: FormData) {
  const user = await requireUser();
  if (user.role !== "client") throw new Error("FORBIDDEN");
  await getDb().insert(weeklyCheckins).values({
    clientId: user.id,
    answers: { energy: value(form, "energy"), sleep: value(form, "sleep"), notes: value(form, "notes") },
  });
  revalidatePath("/dashboard");
}
