export type Role = "user" | "assistant";

export type Character = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  personality: string;
  scenario: string;
  greeting: string;
  exampleDialogue: string;
  avatarImage: string;
  age: string;
  pronouns: string;
  occupation: string;
  world: string;
  goals: string;
  notes: string;
  model: string;
  temperature: number;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  sessionId: string;
  role: Role;
  content: string;
  createdAt: string;
};

export type ChatSession = {
  id: string;
  characterId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type Store = {
  version: 1;
  characters: Character[];
  sessions: ChatSession[];
  messages: ChatMessage[];
};

export type SessionWithMessages = ChatSession & { messages: ChatMessage[] };

export type OllamaModel = {
  name: string;
  model: string;
  size: number;
  modifiedAt: string;
  parameterSize?: string;
  quantization?: string;
};
