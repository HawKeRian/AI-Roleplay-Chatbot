import { deleteSession, getSession } from "@/lib/store";

export const runtime = "nodejs";

type SessionRouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: SessionRouteContext) {
  const { id } = await context.params;
  const session = await getSession(id);
  if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
  return Response.json({ session });
}

export async function DELETE(_: Request, context: SessionRouteContext) {
  const { id } = await context.params;
  await deleteSession(id);
  return new Response(null, { status: 204 });
}
