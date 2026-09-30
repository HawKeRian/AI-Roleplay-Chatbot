import { chatWithOllama } from "@/lib/ollama";
import { toOllamaMessages } from "@/lib/prompt";
import { addMessage, getCharacter, getSession } from "@/lib/store";
import { parseMessage } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 300;

function event(type: string, data: unknown) {
  return `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: Request) {
  try {
    const { sessionId, content } = parseMessage(await request.json());
    const session = await getSession(sessionId);
    if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
    const character = await getCharacter(session.characterId);
    if (!character) return Response.json({ error: "Character not found" }, { status: 404 });

    const userMessage = await addMessage(sessionId, "user", content);
    const history = [...session.messages, userMessage];
    const ollamaStream = await chatWithOllama({
      model: character.model,
      messages: toOllamaMessages(character, history),
      temperature: character.temperature,
      signal: request.signal,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaStream.getReader();
        let buffer = "";
        let fullText = "";
        try {
          controller.enqueue(encoder.encode(event("user", userMessage)));
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (!line.trim()) continue;
              const chunk = JSON.parse(line) as { message?: { content?: string }; error?: string };
              if (chunk.error) throw new Error(chunk.error);
              const delta = chunk.message?.content || "";
              if (delta) {
                fullText += delta;
                controller.enqueue(encoder.encode(event("delta", { text: delta })));
              }
            }
          }
          if (fullText.trim()) {
            const assistantMessage = await addMessage(sessionId, "assistant", fullText.trim());
            controller.enqueue(encoder.encode(event("done", { message: assistantMessage })));
          } else {
            controller.enqueue(encoder.encode(event("error", { error: "Model returned an empty response" })));
          }
        } catch (error) {
          controller.enqueue(encoder.encode(event("error", { error: error instanceof Error ? error.message : "Generation failed" })));
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
      cancel() {
        ollamaStream.cancel().catch(() => undefined);
      },
    });

    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate a response";
    const status = message.includes("Ollama") || message.includes("fetch") ? 502 : 400;
    return Response.json({ error: message }, { status });
  }
}
