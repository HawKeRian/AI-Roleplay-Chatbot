import { createCharacter, listCharacters } from "@/lib/store";
import { parseCharacterInput } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ characters: await listCharacters() });
}

export async function POST(request: Request) {
  try {
    const input = parseCharacterInput(await request.json());
    const character = await createCharacter(input);
    return Response.json({ character }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}
