export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Future: query due workout/check-in reminders and dispatch Web Push.
  return Response.json({ ok: true, checkedAt: new Date().toISOString() });
}
