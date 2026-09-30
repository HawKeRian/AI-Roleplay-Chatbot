import type { Character } from "./types";

export type CharacterInput = Pick<
  Character,
  | "name"
  | "tagline"
  | "description"
  | "personality"
  | "scenario"
  | "greeting"
  | "exampleDialogue"
  | "model"
  | "temperature"
  | "color"
>;

function text(value: unknown, max: number, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, max) : fallback;
}

export function parseCharacterInput(value: unknown): CharacterInput {
  if (!value || typeof value !== "object") throw new Error("Invalid character payload");
  const body = value as Record<string, unknown>;
  const name = text(body.name, 80);
  if (!name) throw new Error("Character name is required");

  const temperatureValue = Number(body.temperature);
  return {
    name,
    tagline: text(body.tagline, 140),
    description: text(body.description, 3000),
    personality: text(body.personality, 5000),
    scenario: text(body.scenario, 5000),
    greeting: text(body.greeting, 3000),
    exampleDialogue: text(body.exampleDialogue, 5000),
    model: text(body.model, 160, process.env.OLLAMA_MODEL || "qwen3:8b"),
    temperature: Number.isFinite(temperatureValue)
      ? Math.min(2, Math.max(0, temperatureValue))
      : 0.8,
    color: /^#[0-9a-f]{6}$/i.test(text(body.color, 7)) ? text(body.color, 7) : "#d26b45",
  };
}

export function parseMessage(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("Invalid message payload");
  const body = value as Record<string, unknown>;
  const sessionId = text(body.sessionId, 100);
  const content = text(body.content, 12000);
  if (!sessionId || !content) throw new Error("Session and message are required");
  return { sessionId, content };
}
