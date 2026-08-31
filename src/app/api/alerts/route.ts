import { and, count, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { messages, notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/http";

export async function GET() {
  try {
    const user = await requireUser();
    const db = getDb();
    const [messageResult, notificationResult] = await Promise.all([
      db.select({ total: count() }).from(messages).where(and(eq(messages.recipientId, user.id), isNull(messages.readAt))),
      db.select({ total: count() }).from(notifications).where(and(eq(notifications.userId, user.id), isNull(notifications.readAt))),
    ]);
    return Response.json({
      unreadMessages: Number(messageResult[0]?.total || 0),
      unreadNotifications: Number(notificationResult[0]?.total || 0),
    });
  } catch (error) {
    return apiError(error);
  }
}
