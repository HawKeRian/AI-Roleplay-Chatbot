import { createSession, listSessions } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const characterId = new URL(request.url).searchParams.get("characterId") || undefined;
  return Response.json({ sessions: await listSessions(characterId) });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { characterId?: unknown };
    if (typeof body.characterId !== "string" || !body.characterId) throw new Error("Character is required");
    return Response.json({ session: await createSession(body.characterId) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}
