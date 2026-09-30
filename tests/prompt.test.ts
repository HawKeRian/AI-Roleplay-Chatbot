import test from "node:test";
import assert from "node:assert/strict";
import { buildSystemPrompt, toOllamaMessages } from "../src/lib/prompt.ts";
import type { Character, ChatMessage } from "../src/lib/types.ts";

const character: Character = {
  id: "test", name: "Mira", tagline: "", description: "A cartographer",
  personality: "Careful and witty", scenario: "An abandoned station", greeting: "Hello",
  exampleDialogue: "", model: "qwen3:8b", temperature: 0.8, color: "#c96642",
  createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
};

test("system prompt includes roleplay boundaries and character context", () => {
  const prompt = buildSystemPrompt(character);
  assert.match(prompt, /Mira/);
  assert.match(prompt, /abandoned station/i);
  assert.match(prompt, /Do not narrate or decide the user's/);
  assert.match(prompt, /Reply exclusively in the language used by the user/);
});

test("Ollama messages prepend the system prompt and preserve history", () => {
  const history: ChatMessage[] = [{
    id: "1", sessionId: "s1", role: "user", content: "ไปกันเถอะ", createdAt: "2026-01-01T00:00:00.000Z",
  }];
  const messages = toOllamaMessages(character, history);
  assert.equal(messages[0].role, "system");
  assert.equal(messages[1].content, "ไปกันเถอะ");
});
