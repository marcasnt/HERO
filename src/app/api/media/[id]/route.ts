import { del, get } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { coachClients, mediaAssets } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/http";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

async function authorizedAsset(id: string) {
  const user = await requireUser();
  const [asset] = await getDb().select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
  if (!asset) return null;
  if (asset.ownerId === user.id) return asset;
  if (user.role === "coach") {
    const [relation] = await getDb().select({ id: coachClients.id }).from(coachClients)
      .where(and(eq(coachClients.coachId, user.id), eq(coachClients.clientId, asset.ownerId))).limit(1);
    if (relation) return asset;
  }
  throw new Error("FORBIDDEN");
}

export async function GET(_request: Request, context: Context) {
  try {
    const asset = await authorizedAsset((await context.params).id);
    if (!asset) return Response.json({ error: "Imagen no encontrada" }, { status: 404 });
    const blob = await get(asset.blobUrl, { access: "private" });
    if (!blob || blob.statusCode !== 200) return Response.json({ error: "Archivo no encontrado" }, { status: 404 });
    return new Response(blob.stream, {
      headers: {
        "Content-Type": asset.contentType,
        "Cache-Control": "private, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const user = await requireUser();
    const id = (await context.params).id;
    const [asset] = await getDb().select().from(mediaAssets)
      .where(and(eq(mediaAssets.id, id), eq(mediaAssets.ownerId, user.id))).limit(1);
    if (!asset) return Response.json({ error: "Imagen no encontrada" }, { status: 404 });
    await del(asset.blobUrl);
    await getDb().delete(mediaAssets).where(eq(mediaAssets.id, asset.id));
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
