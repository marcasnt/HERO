export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  if (message === "UNAUTHORIZED") return Response.json({ error: "No autenticado" }, { status: 401 });
  if (message === "FORBIDDEN") return Response.json({ error: "Sin permiso" }, { status: 403 });
  console.error(error);
  return Response.json({ error: "Error interno" }, { status: 500 });
}
