import type { OllamaModel } from "./types";

const baseUrl = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");

export async function listOllamaModels(): Promise<OllamaModel[]> {
  const response = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(3500), cache: "no-store" });
  if (!response.ok) throw new Error(`Ollama returned ${response.status}`);
  const data = (await response.json()) as {
    models?: Array<{ name: string; model: string; size: number; modified_at: string; details?: { parameter_size?: string; quantization_level?: string } }>;
  };
  return (data.models || []).map((item) => ({
    name: item.name,
    model: item.model,
    size: item.size,
    modifiedAt: item.modified_at,
    parameterSize: item.details?.parameter_size,
    quantization: item.details?.quantization_level,
  }));
}

export async function chatWithOllama(options: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature: number;
  signal: AbortSignal;
}) {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      stream: true,
      think: false,
      options: { temperature: options.temperature },
    }),
    signal: options.signal,
  });
  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Ollama returned ${response.status}${detail ? `: ${detail}` : ""}`);
  }
  return response.body;
}
