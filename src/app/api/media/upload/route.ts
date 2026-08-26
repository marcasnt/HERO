import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { coachClients, mediaAssets, notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/http";

export const runtime = "nodejs";

const metadataSchema = z.object({
  kind: z.enum(["profile", "progress"]),
  capturedAt: z.string().datetime().optional(),
  notes: z.string().trim().max(500).optional(),
});

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);
const maxBytes = 4 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Falta la imagen" }, { status: 400 });
    if (!allowedTypes.has(file.type)) return Response.json({ error: "Formato no permitido" }, { status: 415 });
    if (file.size > maxBytes) return Response.json({ error: "La imagen supera 4 MB. Reduce su tamaño e inténtalo de nuevo." }, { status: 413 });

    const metadata = metadataSchema.safeParse({
      kind: form.get("kind"), capturedAt: form.get("capturedAt") || undefined, notes: form.get("notes") || undefined,
    });
    if (!metadata.success) return Response.json({ error: "Metadatos inválidos" }, { status: 400 });

    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const pathname = `users/${user.id}/${metadata.data.kind}/${crypto.randomUUID()}.${extension}`;
    const blob = await put(pathname, file, { access: "private", addRandomSuffix: false, contentType: file.type });

    try {
      if (metadata.data.kind === "profile") {
        const previous = await getDb().select().from(mediaAssets)
          .where(eq(mediaAssets.ownerId, user.id));
        // Old profile assets remain until the dedicated cleanup route deletes their blobs.
        void previous;
      }
      const [asset] = await getDb().insert(mediaAssets).values({
        ownerId: user.id,
        kind: metadata.data.kind,
        blobUrl: blob.url,
        pathname: blob.pathname,
        contentType: file.type,
        size: file.size,
        capturedAt: metadata.data.capturedAt ? new Date(metadata.data.capturedAt) : null,
        notes: metadata.data.notes,
      }).returning({ id: mediaAssets.id, kind: mediaAssets.kind, createdAt: mediaAssets.createdAt });
      if (metadata.data.kind === "progress") {
        const [relation] = await getDb().select({ coachId: coachClients.coachId }).from(coachClients).where(eq(coachClients.clientId, user.id)).limit(1);
        if (relation) await getDb().insert(notifications).values({ userId: relation.coachId, title: `${user.name} subió una fotografía de progreso`, href: `/dashboard/clients/${user.id}` });
      }
      return Response.json({ asset }, { status: 201 });
    } catch (error) {
      const { del } = await import("@vercel/blob");
      await del(blob.url).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    console.error("[api/media/upload] failed", { error: error instanceof Error ? error.message : String(error) });
    return apiError(error);
  }
}
