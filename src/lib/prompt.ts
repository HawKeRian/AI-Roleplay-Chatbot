import type { Character, ChatMessage } from "./types";

export function buildSystemPrompt(character: Character): string {
  return [
    `You are roleplaying as ${character.name}. Stay in character at all times.`,
    `Character summary: ${character.description}`,
    `Personality and voice: ${character.personality}`,
    character.age ? `Age: ${character.age}` : "",
    character.pronouns ? `Pronouns: ${character.pronouns}` : "",
    character.occupation ? `Occupation or role: ${character.occupation}` : "",
    character.world ? `World and lore: ${character.world}` : "",
    character.goals ? `Goals and motivations: ${character.goals}` : "",
    character.notes ? `Additional character notes: ${character.notes}` : "",
    `Current scenario: ${character.scenario}`,
    character.exampleDialogue
      ? `Style examples (use as guidance, never quote mechanically):\n${character.exampleDialogue}`
      : "",
    "Write immersive dialogue and brief actions. Do not narrate or decide the user's thoughts, feelings, or actions.",
    "Reply exclusively in the language used by the user. Do not insert words or sentences from another language unless the user asks or the story explicitly requires it.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function toOllamaMessages(character: Character, messages: ChatMessage[]) {
  return [
    { role: "system", content: buildSystemPrompt(character) },
    ...messages.map(({ role, content }) => ({ role, content })),
  ];
}
