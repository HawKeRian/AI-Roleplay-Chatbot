import test from "node:test";
import assert from "node:assert/strict";
import { buildSystemPrompt, toOllamaMessages } from "../src/lib/prompt.ts";
import type { Character, ChatMessage } from "../src/lib/types.ts";
import { parseCharacterInput } from "../src/lib/validation.ts";

const character: Character = {
  id: "test", name: "Mira", tagline: "", description: "A cartographer",
  personality: "Careful and witty", scenario: "An abandoned station", greeting: "Hello",
  exampleDialogue: "", avatarImage: "", age: "29", pronouns: "she/her",
  occupation: "Cartographer", world: "A world of forgotten cities", goals: "Find the lost city",
  notes: "Carries a brass compass", model: "qwen3:8b", temperature: 0.8, color: "#c96642",
  createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
};

test("system prompt includes roleplay boundaries and character context", () => {
  const prompt = buildSystemPrompt(character);
  assert.match(prompt, /Mira/);
  assert.match(prompt, /abandoned station/i);
  assert.match(prompt, /Do not narrate or decide the user's/);
  assert.match(prompt, /Reply exclusively in the language used by the user/);
  assert.match(prompt, /Cartographer/);
});

test("Ollama messages prepend the system prompt and preserve history", () => {
  const history: ChatMessage[] = [{
    id: "1", sessionId: "s1", role: "user", content: "ไปกันเถอะ", createdAt: "2026-01-01T00:00:00.000Z",
  }];
  const messages = toOllamaMessages(character, history);
  assert.equal(messages[0].role, "system");
  assert.equal(messages[1].content, "ไปกันเถอะ");
});

test("character validation accepts local uploads and rejects external image URLs", () => {
  const local = parseCharacterInput({ name: "Mira", avatarImage: "/api/uploads/123e4567-e89b-12d3-a456-426614174000.webp" });
  const external = parseCharacterInput({ name: "Mira", avatarImage: "https://example.com/tracker.png" });
  assert.equal(local.avatarImage, "/api/uploads/123e4567-e89b-12d3-a456-426614174000.webp");
  assert.equal(external.avatarImage, "");
});
