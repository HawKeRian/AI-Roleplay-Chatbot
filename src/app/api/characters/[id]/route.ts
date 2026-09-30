import { deleteCharacter, updateCharacter } from "@/lib/store";
import { parseCharacterInput } from "@/lib/validation";

export const runtime = "nodejs";

type CharacterRouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: CharacterRouteContext) {
  try {
    const { id } = await context.params;
    const character = await updateCharacter(id, parseCharacterInput(await request.json()));
    if (!character) return Response.json({ error: "Character not found" }, { status: 404 });
    return Response.json({ character });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(_: Request, context: CharacterRouteContext) {
  const { id } = await context.params;
  await deleteCharacter(id);
  return new Response(null, { status: 204 });
}
