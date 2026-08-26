import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { mediaAssets } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/http";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const kind = new URL(request.url).searchParams.get("kind");
    const filter = kind === "profile" || kind === "progress"
      ? and(eq(mediaAssets.ownerId, user.id), eq(mediaAssets.kind, kind))
      : eq(mediaAssets.ownerId, user.id);
    const assets = await getDb().select({
      id: mediaAssets.id, kind: mediaAssets.kind, capturedAt: mediaAssets.capturedAt,
      notes: mediaAssets.notes, createdAt: mediaAssets.createdAt,
    }).from(mediaAssets).where(filter).orderBy(desc(mediaAssets.createdAt));
    return Response.json({ assets });
  } catch (error) {
    return apiError(error);
  }
}
