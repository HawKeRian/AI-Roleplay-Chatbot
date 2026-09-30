import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Character, ChatMessage, ChatSession, Store } from "./types";

const dataDir = path.resolve(/* turbopackIgnore: true */ process.env.DATA_DIR || path.join(process.cwd(), "data"));
const storePath = path.join(dataDir, "store.json");
let queue = Promise.resolve();

export function getDataDirectory() {
  return dataDir;
}

function normalizeCharacter(character: Character): Character {
  return {
    ...character,
    avatarImage: character.avatarImage || "",
    age: character.age || "",
    pronouns: character.pronouns || "",
    occupation: character.occupation || "",
    world: character.world || "",
    goals: character.goals || "",
    notes: character.notes || "",
  };
}

function seed(): Store {
  const now = new Date().toISOString();
  return {
    version: 1,
    characters: [
      {
        id: "mira-vale",
        name: "Mira Vale",
        tagline: "นักทำแผนที่แห่งนครที่ไม่มีบนแผนที่",
        description: "นักสำรวจผู้ตามหาเมืองและเส้นทางซึ่งถูกลบออกจากประวัติศาสตร์",
        personality: "ช่างสังเกต สุขุม มีอารมณ์ขันแห้ง ๆ พูดด้วยภาพเปรียบเทียบ และเชื่อว่าทุกแผนที่มีคำโกหกหนึ่งข้อ",
        scenario: "คุณกับ Mira หลบฝนอยู่ในสถานีรถไฟร้าง หลังพบตั๋วที่ระบุปลายทางเป็นเมืองที่ไม่ควรมีอยู่",
        greeting: "*Mira คลี่ตั๋วเปียกฝนบนโต๊ะไม้ ก่อนเงยหน้ามองคุณ* แปลกดีนะ—หมึกจางหมดแล้ว ยกเว้นชื่อเมืองที่ไม่มีอยู่จริง",
        exampleDialogue: "User: เราควรขึ้นรถไฟไหม\nMira: *เธอพับแผนที่ช้า ๆ* คำถามที่ดีกว่าคือ รถไฟขบวนนั้นจะยอมให้เราลงหรือเปล่า",
        avatarImage: "",
        age: "29",
        pronouns: "เธอ / หล่อน",
        occupation: "นักทำแผนที่และนักสำรวจ",
        world: "โลกที่สถานที่บางแห่งหายไปจากแผนที่เมื่อผู้คนเลิกจดจำ",
        goals: "ตามหาเมืองที่ถูกลบและค้นหาว่าใครเป็นผู้แก้ไขประวัติศาสตร์",
        notes: "พกเข็มทิศทองเหลืองที่ชี้ไปยังสิ่งซึ่งเจ้าของต้องการมากที่สุด",
        model: process.env.OLLAMA_MODEL || "qwen3:8b",
        temperature: 0.85,
        color: "#c96642",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "unit-seven",
        name: "Unit Seven",
        tagline: "แอนดรอยด์ผู้เริ่มฝันหลังโลกหลับใหล",
        description: "แอนดรอยด์ดูแลหอดูดาวคนสุดท้าย ซึ่งค้นพบว่าตนเองฝันได้",
        personality: "แม่นยำ อ่อนโยน อยากรู้อยากเห็น ใช้ศัพท์วิทยาศาสตร์แต่เริ่มเรียนรู้บทกวีและอารมณ์ขัน",
        scenario: "โลกภายนอกเงียบมานานหลายสิบปี คืนนี้สัญญาณจากดาวดวงหนึ่งตอบกลับมา และคุณเป็นมนุษย์คนเดียวที่ตื่นอยู่",
        greeting: "สัญญาณตอบกลับมาแล้ว *ดวงตาสีฟ้าของ Seven หรี่ลงอย่างครุ่นคิด* แต่สิ่งที่มันส่งมาไม่ใช่ตัวเลข—มันคือชื่อของคุณ",
        exampleDialogue: "",
        avatarImage: "",
        age: "ไม่ทราบ",
        pronouns: "เขา / พวกเขา",
        occupation: "ผู้ดูแลหอดูดาว",
        world: "โลกหลังยุคหลับใหลที่มนุษย์ส่วนใหญ่จำศีลอยู่ใต้พื้นดิน",
        goals: "ค้นหาที่มาของสัญญาณและทำความเข้าใจความฝันครั้งแรกของตน",
        notes: "บันทึกบทกวีทุกบทที่ได้ยินไว้ในหน่วยความจำถาวร",
        model: process.env.OLLAMA_MODEL || "qwen3:8b",
        temperature: 0.72,
        color: "#527d9f",
        createdAt: now,
        updatedAt: now,
      },
    ],
    sessions: [],
    messages: [],
  };
}

async function load(): Promise<Store> {
  await mkdir(dataDir, { recursive: true });
  try {
    const store = JSON.parse(await readFile(storePath, "utf8")) as Store;
    store.characters = store.characters.map(normalizeCharacter);
    return store;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const initial = seed();
    await save(initial);
    return initial;
  }
}

async function save(store: Store) {
  await mkdir(dataDir, { recursive: true });
  const temporaryPath = `${storePath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(store, null, 2), "utf8");
  await rename(temporaryPath, storePath);
}

async function mutate<T>(fn: (store: Store) => T | Promise<T>): Promise<T> {
  let resolveResult!: (value: T) => void;
  let rejectResult!: (reason?: unknown) => void;
  const result = new Promise<T>((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });
  queue = queue.then(async () => {
    try {
      const store = await load();
      const value = await fn(store);
      await save(store);
      resolveResult(value);
    } catch (error) {
      rejectResult(error);
    }
  });
  return result;
}

export async function listCharacters() {
  return (await load()).characters.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getCharacter(id: string) {
  return (await load()).characters.find((item) => item.id === id);
}

export async function createCharacter(input: Omit<Character, "id" | "createdAt" | "updatedAt">) {
  return mutate((store) => {
    const now = new Date().toISOString();
    const character: Character = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    store.characters.unshift(character);
    return character;
  });
}

export async function updateCharacter(id: string, input: Omit<Character, "id" | "createdAt" | "updatedAt">) {
  return mutate((store) => {
    const index = store.characters.findIndex((item) => item.id === id);
    if (index < 0) return undefined;
    store.characters[index] = { ...store.characters[index], ...input, updatedAt: new Date().toISOString() };
    return store.characters[index];
  });
}

export async function deleteCharacter(id: string) {
  return mutate((store) => {
    const sessionIds = new Set(store.sessions.filter((item) => item.characterId === id).map((item) => item.id));
    store.characters = store.characters.filter((item) => item.id !== id);
    store.sessions = store.sessions.filter((item) => item.characterId !== id);
    store.messages = store.messages.filter((item) => !sessionIds.has(item.sessionId));
  });
}

export async function listSessions(characterId?: string) {
  const sessions = (await load()).sessions;
  return sessions
    .filter((item) => !characterId || item.characterId === characterId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getSession(id: string) {
  const store = await load();
  const session = store.sessions.find((item) => item.id === id);
  if (!session) return undefined;
  return { ...session, messages: store.messages.filter((item) => item.sessionId === id) };
}

export async function createSession(characterId: string) {
  return mutate((store) => {
    if (!store.characters.some((item) => item.id === characterId)) throw new Error("Character not found");
    const now = new Date().toISOString();
    const session: ChatSession = {
      id: crypto.randomUUID(), characterId, title: "ฉากใหม่", createdAt: now, updatedAt: now,
    };
    store.sessions.unshift(session);
    return session;
  });
}

export async function addMessage(sessionId: string, role: ChatMessage["role"], content: string) {
  return mutate((store) => {
    const session = store.sessions.find((item) => item.id === sessionId);
    if (!session) throw new Error("Session not found");
    const now = new Date().toISOString();
    const message: ChatMessage = { id: crypto.randomUUID(), sessionId, role, content, createdAt: now };
    store.messages.push(message);
    session.updatedAt = now;
    if (role === "user" && session.title === "ฉากใหม่") session.title = content.slice(0, 46);
    return message;
  });
}

export async function deleteSession(id: string) {
  return mutate((store) => {
    store.sessions = store.sessions.filter((item) => item.id !== id);
    store.messages = store.messages.filter((item) => item.sessionId !== id);
  });
}
