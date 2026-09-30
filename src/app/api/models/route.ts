import { listOllamaModels } from "@/lib/ollama";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const models = await listOllamaModels();
    return Response.json({ connected: true, models });
  } catch (error) {
    return Response.json({
      connected: false,
      models: [],
      error: error instanceof Error ? error.message : "Unable to connect to Ollama",
    });
  }
}
