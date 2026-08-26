"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { clientInvites, coachClients, measurements, messages, notifications, programAssignments, users, weeklyCheckins, workoutSessions } from "@/db/schema";
import { requireCoach, requireUser } from "@/lib/auth";
import { estimateBodyFat, type BodyFormula } from "@/lib/body-fat";

function value(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

export async function createRoutine(form: FormData) {
  const coach = await requireCoach();
  const clientId = value(form, "clientId");
  const [relation] = await getDb().select({ id: coachClients.id }).from(coachClients)
    .where(and(eq(coachClients.coachId, coach.id), eq(coachClients.clientId, clientId))).limit(1);
  if (!relation) throw new Error("FORBIDDEN");
  let exercises: Array<{ name: string; day: string; sets: number; reps: string; rest: number; rir: number; notes?: string }> = [];
  try { exercises = JSON.parse(value(form, "definition")); } catch { throw new Error("Rutina inválida"); }
  if (!exercises.length) throw new Error("Agrega al menos un ejercicio");
  await getDb().insert(programAssignments).values({
    coachId: coach.id,
    clientId,
    name: value(form, "name") || "Rutina HERO",
    definition: { exercises },
    startsOn: new Date(),
  });
  await getDb().insert(notifications).values({ userId: clientId, title: "Nueva rutina asignada", body: value(form, "name") || "Rutina HERO", href: "/dashboard" });
  revalidatePath("/dashboard");
  redirect(`/dashboard/clients/${clientId}`);
}

export async function updateRoutine(form: FormData) {
  const coach = await requireCoach();
  const assignmentId = value(form, "assignmentId");
  let exercises: Array<{ name: string; day: string; sets: number; reps: string; rest: number; rir: number; notes?: string }> = [];
  try { exercises = JSON.parse(value(form, "definition")); } catch { throw new Error("Rutina inválida"); }
  if (!exercises.length) throw new Error("Agrega al menos un ejercicio");
  await getDb().update(programAssignments).set({ name: value(form, "name"), definition: { exercises }, version: 2 })
    .where(and(eq(programAssignments.id, assignmentId), eq(programAssignments.coachId, coach.id)));
  revalidatePath(`/dashboard/routines/${assignmentId}`);
  revalidatePath("/dashboard");
}

export async function completeWorkout(form: FormData) {
  const user = await requireUser();
  if (user.role !== "client") throw new Error("FORBIDDEN");
  const assignmentId = value(form, "assignmentId");
  const [assignment] = await getDb().select().from(programAssignments)
    .where(and(eq(programAssignments.id, assignmentId), eq(programAssignments.clientId, user.id))).limit(1);
  if (!assignment) throw new Error("FORBIDDEN");
  const now = new Date();
  const prescribed = assignment.definition as { exercises?: Array<{ name: string; sets: number }> };
  const exercises = (prescribed.exercises || []).map((exercise, exerciseIndex) => ({
    name: exercise.name,
    sets: Array.from({ length: exercise.sets }, (_, setIndex) => ({
      weight: Number(value(form, `weight-${exerciseIndex}-${setIndex}`)) || 0,
      reps: Number(value(form, `reps-${exerciseIndex}-${setIndex}`)) || 0,
      rpe: Number(value(form, `rpe-${exerciseIndex}-${setIndex}`)) || null,
    })),
  }));
  await getDb().insert(workoutSessions).values({
    clientId: user.id,
    assignmentId,
    status: "completed",
    startedAt: now,
    completedAt: now,
    execution: { exercises },
    clientFeedback: value(form, "feedback"),
  });
  await getDb().insert(notifications).values({ userId: assignment.coachId, title: `${user.name} completó una rutina`, href: `/dashboard/clients/${user.id}` });
  revalidatePath("/dashboard");
}

export async function createInvite(form: FormData) {
  const coach = await requireCoach();
  const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  await getDb().insert(clientInvites).values({
    coachId: coach.id,
    token,
    email: value(form, "email").toLowerCase() || null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  revalidatePath("/dashboard/invitations");
}

export async function revokeInvite(form: FormData) {
  const coach = await requireCoach();
  await getDb().update(clientInvites).set({ status: "revoked" })
    .where(and(eq(clientInvites.id, value(form, "id")), eq(clientInvites.coachId, coach.id)));
  revalidatePath("/dashboard/invitations");
}

export async function acceptInvite(form: FormData) {
  const user = await requireUser();
  const token = value(form, "token");
  const [invite] = await getDb().select().from(clientInvites)
    .where(and(eq(clientInvites.token, token), eq(clientInvites.status, "pending"))).limit(1);
  if (!invite || invite.expiresAt < new Date()) throw new Error("Esta invitación ya no es válida");
  const [appUser] = await getDb().select().from(users).where(eq(users.id, user.id)).limit(1);
  if (invite.email && invite.email !== appUser?.email?.toLowerCase()) throw new Error("La invitación pertenece a otro correo");
  await getDb().insert(coachClients).values({ coachId: invite.coachId, clientId: user.id }).onConflictDoNothing();
  await getDb().update(users).set({ role: "client" }).where(eq(users.id, user.id));
  await getDb().update(clientInvites).set({ status: "accepted", acceptedBy: user.id, acceptedAt: new Date() }).where(eq(clientInvites.id, invite.id));
  await getDb().insert(notifications).values({ userId: invite.coachId, title: `${user.name} aceptó tu invitación`, href: `/dashboard/clients/${user.id}` });
  redirect("/dashboard");
}

export async function sendMessage(form: FormData) {
  const user = await requireUser();
  const recipientId = value(form, "recipientId");
  const body = value(form, "body");
  if (!body || body.length > 2000) throw new Error("Mensaje inválido");
  const [relation] = await getDb().select().from(coachClients).where(user.role === "coach"
    ? and(eq(coachClients.coachId, user.id), eq(coachClients.clientId, recipientId))
    : and(eq(coachClients.clientId, user.id), eq(coachClients.coachId, recipientId))).limit(1);
  if (!relation) throw new Error("FORBIDDEN");
  await getDb().insert(messages).values({ senderId: user.id, recipientId, body });
  await getDb().insert(notifications).values({ userId: recipientId, title: `Nuevo mensaje de ${user.name}`, body: body.slice(0, 100), href: `/dashboard/messages?with=${user.id}` });
  revalidatePath("/dashboard/messages");
}

export async function updateProfile(form: FormData) {
  const user = await requireUser();
  await getDb().update(users).set({ name: value(form, "name") || user.name, phone: value(form, "phone") || null, bio: value(form, "bio") || null }).where(eq(users.id, user.id));
  revalidatePath("/dashboard/profile");
}

export async function updateClientGoals(form: FormData) {
  const coach = await requireCoach();
  await getDb().update(coachClients).set({ objective: value(form, "objective"), privateNotes: value(form, "privateNotes") })
    .where(and(eq(coachClients.coachId, coach.id), eq(coachClients.clientId, value(form, "clientId"))));
  revalidatePath(`/dashboard/clients/${value(form, "clientId")}`);
}

export async function markNotificationsRead() {
  const user = await requireUser();
  await getDb().update(notifications).set({ readAt: new Date() }).where(eq(notifications.userId, user.id));
  revalidatePath("/dashboard/notifications");
}

export async function addMeasurement(form: FormData) {
  const user = await requireUser();
  if (user.role !== "client") throw new Error("FORBIDDEN");
  const number = (key: string) => Number(value(form, key));
  const formula = value(form, "formula") as BodyFormula;
  const heightCm = number("heightCm");
  const neckCm = number("neckCm");
  const waistCm = number("waistCm");
  const hipCm = number("hipCm");
  const bodyFat = estimateBodyFat({ formula, heightCm, neckCm, waistCm, hipCm });
  if (!bodyFat) throw new Error("Revisa estatura, cuello, cintura y cadera");
  await getDb().insert(measurements).values({
    clientId: user.id,
    values: {
      formula,
      weight: number("weight"),
      heightCm,
      neckCm,
      waistCm,
      hipCm,
      leftArmCm: number("leftArmCm"),
      rightArmCm: number("rightArmCm"),
      leftThighCm: number("leftThighCm"),
      rightThighCm: number("rightThighCm"),
      bodyFat,
    },
    notes: value(form, "notes"),
  });
  const [relation] = await getDb().select({ coachId: coachClients.coachId }).from(coachClients).where(eq(coachClients.clientId, user.id)).limit(1);
  if (relation) await getDb().insert(notifications).values({ userId: relation.coachId, title: `${user.name} registró nuevas medidas`, href: `/dashboard/clients/${user.id}` });
  revalidatePath("/dashboard/progress");
}

export async function submitCheckin(form: FormData) {
  const user = await requireUser();
  if (user.role !== "client") throw new Error("FORBIDDEN");
  await getDb().insert(weeklyCheckins).values({
    clientId: user.id,
    answers: { energy: value(form, "energy"), sleep: value(form, "sleep"), notes: value(form, "notes") },
  });
  const [relation] = await getDb().select({ coachId: coachClients.coachId }).from(coachClients).where(eq(coachClients.clientId, user.id)).limit(1);
  if (relation) await getDb().insert(notifications).values({ userId: relation.coachId, title: `${user.name} envió su check-in semanal`, href: `/dashboard/clients/${user.id}` });
  revalidatePath("/dashboard");
}
