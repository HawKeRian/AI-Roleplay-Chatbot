"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Character, ChatMessage, ChatSession, OllamaModel, SessionWithMessages } from "@/lib/types";

type ModelState = { connected: boolean; models: OllamaModel[]; error?: string };
type CharacterDraft = Omit<Character, "id" | "createdAt" | "updatedAt">;

const emptyDraft: CharacterDraft = {
  name: "", tagline: "", description: "", personality: "", scenario: "", greeting: "",
  exampleDialogue: "", model: "qwen3:8b", temperature: 0.8, color: "#c96642",
};

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`);
  return data as T;
}

function avatarLetters(name: string) {
  return name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
}

function CharacterAvatar({ character, large = false }: { character: Character; large?: boolean }) {
  return (
    <div className={`avatar ${large ? "avatar-large" : ""}`} style={{ "--avatar-color": character.color } as React.CSSProperties}>
      <span>{avatarLetters(character.name)}</span>
      <i />
    </div>
  );
}

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeCharacterId, setActiveCharacterId] = useState<string>("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<SessionWithMessages | null>(null);
  const [modelState, setModelState] = useState<ModelState>({ connected: false, models: [] });
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CharacterDraft>(emptyDraft);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const bootedRef = useRef(false);

  const activeCharacter = characters.find((item) => item.id === activeCharacterId) || null;
  const filteredCharacters = useMemo(
    () => characters.filter((item) => `${item.name} ${item.tagline}`.toLowerCase().includes(search.toLowerCase())),
    [characters, search],
  );

  const loadSession = useCallback(async (id: string) => {
    const result = await api<{ session: SessionWithMessages }>(`/api/sessions/${id}`);
    setActiveSession(result.session);
  }, []);

  const loadSessions = useCallback(async (characterId: string, preferredId?: string) => {
    const result = await api<{ sessions: ChatSession[] }>(`/api/sessions?characterId=${encodeURIComponent(characterId)}`);
    setSessions(result.sessions);
    const target = preferredId || result.sessions[0]?.id;
    if (target) {
      await loadSession(target);
    } else {
      const created = await api<{ session: ChatSession }>("/api/sessions", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ characterId }),
      });
      setSessions([created.session]);
      setActiveSession({ ...created.session, messages: [] });
    }
  }, [loadSession]);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    Promise.all([
      api<{ characters: Character[] }>("/api/characters"),
      api<ModelState>("/api/models"),
    ]).then(async ([characterResult, models]) => {
      setCharacters(characterResult.characters);
      setModelState(models);
      if (characterResult.characters[0]) {
        setActiveCharacterId(characterResult.characters[0].id);
        await loadSessions(characterResult.characters[0].id);
      }
    }).catch((reason) => setError(reason.message)).finally(() => setLoading(false));
  }, [loadSessions]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, streamingText]);

  async function selectCharacter(id: string) {
    if (id === activeCharacterId || sending) return;
    setActiveCharacterId(id);
    setActiveSession(null);
    setRailOpen(false);
    setError("");
    try { await loadSessions(id); } catch (reason) { setError((reason as Error).message); }
  }

  async function newScene() {
    if (!activeCharacter || sending) return;
    try {
      const result = await api<{ session: ChatSession }>("/api/sessions", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ characterId: activeCharacter.id }),
      });
      setSessions((items) => [result.session, ...items]);
      setActiveSession({ ...result.session, messages: [] });
      setHistoryOpen(false);
    } catch (reason) { setError((reason as Error).message); }
  }

  async function sendMessage() {
    const content = input.trim();
    if (!content || !activeSession || sending) return;
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`, sessionId: activeSession.id, role: "user", content, createdAt: new Date().toISOString(),
    };
    setActiveSession((session) => session ? { ...session, messages: [...session.messages, optimistic] } : session);
    setInput("");
    setError("");
    setSending(true);
    setStreamingText("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: activeSession.id, content }),
      });
      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Chat failed (${response.status})`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalMessage: ChatMessage | undefined;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";
        for (const block of blocks) {
          const eventName = block.match(/^event: (.+)$/m)?.[1];
          const dataLine = block.match(/^data: (.+)$/m)?.[1];
          if (!eventName || !dataLine) continue;
          const payload = JSON.parse(dataLine);
          if (eventName === "delta") setStreamingText((text) => text + payload.text);
          if (eventName === "done") finalMessage = payload.message;
          if (eventName === "error") throw new Error(payload.error);
        }
      }
      if (finalMessage) {
        setActiveSession((session) => session ? {
          ...session,
          messages: [...session.messages.filter((item) => item.id !== optimistic.id), optimistic, finalMessage!],
        } : session);
      }
      const refreshed = await api<{ sessions: ChatSession[] }>(`/api/sessions?characterId=${activeCharacterId}`);
      setSessions(refreshed.sessions);
    } catch (reason) {
      setError((reason as Error).message.includes("fetch failed")
        ? "เชื่อมต่อ Ollama ไม่ได้ กรุณาตรวจว่า Ollama กำลังทำงานอยู่"
        : (reason as Error).message);
      await loadSession(activeSession.id).catch(() => undefined);
    } finally {
      setStreamingText("");
      setSending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  function openCreate() {
    setEditingId(null);
    setDraft({ ...emptyDraft, model: modelState.models[0]?.name || emptyDraft.model });
    setEditorOpen(true);
  }

  function openEdit() {
    if (!activeCharacter) return;
    const { id, createdAt, updatedAt, ...characterDraft } = activeCharacter;
    void id; void createdAt; void updatedAt;
    setEditingId(activeCharacter.id);
    setDraft(characterDraft);
    setEditorOpen(true);
  }

  async function saveCharacter(event: FormEvent) {
    event.preventDefault();
    try {
      const url = editingId ? `/api/characters/${editingId}` : "/api/characters";
      const result = await api<{ character: Character }>(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" }, body: JSON.stringify(draft),
      });
      if (editingId) {
        setCharacters((items) => items.map((item) => item.id === editingId ? result.character : item));
      } else {
        setCharacters((items) => [result.character, ...items]);
        setActiveCharacterId(result.character.id);
        await loadSessions(result.character.id);
      }
      setEditorOpen(false);
    } catch (reason) { setError((reason as Error).message); }
  }

  async function removeCharacter() {
    if (!editingId || !confirm("ลบตัวละครและประวัติการเล่นทั้งหมดของตัวละครนี้หรือไม่?")) return;
    await api(`/api/characters/${editingId}`, { method: "DELETE" });
    const remaining = characters.filter((item) => item.id !== editingId);
    setCharacters(remaining);
    setEditorOpen(false);
    if (remaining[0]) {
      setActiveCharacterId(remaining[0].id);
      await loadSessions(remaining[0].id);
    } else {
      setActiveCharacterId(""); setActiveSession(null); setSessions([]);
    }
  }

  const messages = activeSession?.messages || [];

  return (
    <main className="app-shell">
      <button className="mobile-menu" onClick={() => setRailOpen(true)} aria-label="เปิดเมนู">☰</button>
      <aside className={`character-rail ${railOpen ? "rail-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark">F</div>
          <div><strong>Fable Local</strong><span>ROLEPLAY STUDIO</span></div>
          <button className="mobile-close" onClick={() => setRailOpen(false)}>×</button>
        </div>

        <button className="new-character" onClick={openCreate}><span>＋</span> สร้างตัวละคร</button>
        <label className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาตัวละคร..." /></label>
        <div className="rail-label"><span>ตัวละครของคุณ</span><em>{characters.length}</em></div>
        <div className="character-list">
          {filteredCharacters.map((character) => (
            <button key={character.id} className={`character-card ${character.id === activeCharacterId ? "active" : ""}`} onClick={() => void selectCharacter(character.id)}>
              <CharacterAvatar character={character} />
              <span className="character-meta"><strong>{character.name}</strong><small>{character.tagline}</small></span>
              <b>›</b>
            </button>
          ))}
          {!loading && !filteredCharacters.length && <div className="empty-small">ยังไม่มีตัวละครที่ตรงกัน</div>}
        </div>
        <div className="local-status">
          <span className={modelState.connected ? "status-dot online" : "status-dot"} />
          <div><strong>{modelState.connected ? "Ollama พร้อมใช้งาน" : "Ollama ออฟไลน์"}</strong><small>{modelState.connected ? `${modelState.models.length} โมเดลในเครื่อง` : "ตรวจสอบ service และ URL"}</small></div>
        </div>
      </aside>

      <section className="stage">
        {activeCharacter ? (
          <>
            <header className="stage-header">
              <div className="stage-identity">
                <CharacterAvatar character={activeCharacter} />
                <div><strong>{activeCharacter.name}</strong><span><i className="live-dot" /> อยู่ในบทบาท · {activeCharacter.model}</span></div>
              </div>
              <div className="header-actions">
                <button title="แก้ไขตัวละคร" onClick={openEdit}>✎</button>
                <button className="history-button" onClick={() => setHistoryOpen((value) => !value)}>ประวัติ <span>⌄</span></button>
                <button className="new-scene" onClick={() => void newScene()}>＋ ฉากใหม่</button>
              </div>
            </header>

            {historyOpen && (
              <div className="history-popover">
                <div><strong>ประวัติฉาก</strong><button onClick={() => setHistoryOpen(false)}>×</button></div>
                {sessions.map((session) => (
                  <button key={session.id} className={session.id === activeSession?.id ? "selected" : ""} onClick={() => { void loadSession(session.id); setHistoryOpen(false); }}>
                    <span>{session.title}</span><small>{new Date(session.updatedAt).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}</small>
                  </button>
                ))}
              </div>
            )}

            <div className="scene-ribbon">
              <span>SCENE</span><p>{activeCharacter.scenario}</p>
            </div>

            <div className="conversation">
              {!messages.length && (
                <div className="chapter-opening">
                  <div className="ornament">✦</div><span>บทใหม่เริ่มต้น</span>
                  <p>ตอบกลับเพื่อเริ่มเรื่องราว หรือสร้างฉากใหม่เมื่ออยากเริ่มเส้นเรื่องอื่น</p>
                </div>
              )}
              {!messages.length && activeCharacter.greeting && (
                <MessageBubble role="assistant" content={activeCharacter.greeting} character={activeCharacter} />
              )}
              {messages.map((message) => <MessageBubble key={message.id} role={message.role} content={message.content} character={activeCharacter} />)}
              {sending && <MessageBubble role="assistant" content={streamingText} character={activeCharacter} typing={!streamingText} />}
              {error && <div className="error-banner"><span>!</span><p>{error}</p><button onClick={() => setError("")}>×</button></div>}
              <div ref={endRef} />
            </div>

            <div className="composer-wrap">
              <div className="composer">
                <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={`พูดหรือทำบางอย่างกับ ${activeCharacter.name}...`} rows={1} disabled={sending || !activeSession} />
                <button className="send-button" onClick={() => void sendMessage()} disabled={!input.trim() || sending} aria-label="ส่งข้อความ">↑</button>
                <div className="composer-hint"><span>Enter เพื่อส่ง</span><span>Shift + Enter เพื่อขึ้นบรรทัดใหม่</span></div>
              </div>
              <p className="privacy-note">ข้อความและตัวละครถูกเก็บไว้ในเครื่องของคุณเท่านั้น</p>
            </div>
          </>
        ) : (
          <div className="empty-stage">
            <div className="brand-mark large">F</div><h1>เรื่องราวกำลังรอคุณอยู่</h1>
            <p>สร้างตัวละครคนแรก แล้วเริ่มบทสนทนาที่ทำงานด้วย AI บนเครื่องของคุณ</p>
            <button className="new-character" onClick={openCreate}>＋ สร้างตัวละคร</button>
          </div>
        )}
      </section>

      {editorOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditorOpen(false); }}>
          <form className="editor-modal" onSubmit={saveCharacter}>
            <div className="modal-header"><div><span>{editingId ? "CHARACTER PROFILE" : "NEW CHARACTER"}</span><h2>{editingId ? `แก้ไข ${draft.name}` : "สร้างตัวละครใหม่"}</h2></div><button type="button" onClick={() => setEditorOpen(false)}>×</button></div>
            <div className="form-grid">
              <label><span>ชื่อ *</span><input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="ชื่อของตัวละคร" /></label>
              <label><span>คำโปรย</span><input value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} placeholder="อธิบายในหนึ่งประโยค" /></label>
              <label className="full"><span>คำอธิบาย</span><textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="ตัวละครนี้คือใคร มีภูมิหลังอย่างไร" /></label>
              <label className="full"><span>บุคลิกและน้ำเสียง</span><textarea value={draft.personality} onChange={(e) => setDraft({ ...draft, personality: e.target.value })} placeholder="นิสัย วิธีพูด ค่านิยม สิ่งที่ชอบและไม่ชอบ" /></label>
              <label className="full"><span>ฉากเริ่มต้น</span><textarea value={draft.scenario} onChange={(e) => setDraft({ ...draft, scenario: e.target.value })} placeholder="คุณและตัวละครอยู่ที่ไหน เกิดอะไรขึ้น" /></label>
              <label className="full"><span>ข้อความทักทาย</span><textarea value={draft.greeting} onChange={(e) => setDraft({ ...draft, greeting: e.target.value })} placeholder="ประโยคแรกเมื่อเริ่มฉาก" /></label>
              <label><span>โมเดล Ollama</span><input list="model-list" value={draft.model} onChange={(e) => setDraft({ ...draft, model: e.target.value })} /><datalist id="model-list">{modelState.models.map((model) => <option key={model.name} value={model.name} />)}</datalist></label>
              <label><span>ความสร้างสรรค์ · {draft.temperature.toFixed(2)}</span><input type="range" min="0" max="2" step="0.05" value={draft.temperature} onChange={(e) => setDraft({ ...draft, temperature: Number(e.target.value) })} /></label>
              <label className="full"><span>ตัวอย่างบทสนทนา</span><textarea value={draft.exampleDialogue} onChange={(e) => setDraft({ ...draft, exampleDialogue: e.target.value })} placeholder="User: ...\nCharacter: ..." /></label>
            </div>
            <div className="modal-footer">
              {editingId && <button type="button" className="danger" onClick={() => void removeCharacter()}>ลบตัวละคร</button>}
              <span />
              <button type="button" className="secondary" onClick={() => setEditorOpen(false)}>ยกเลิก</button>
              <button type="submit" className="save">บันทึกตัวละคร</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

function MessageBubble({ role, content, character, typing = false }: { role: "user" | "assistant"; content: string; character: Character; typing?: boolean }) {
  return (
    <article className={`message ${role}`}>
      <div className="message-avatar">{role === "assistant" ? <CharacterAvatar character={character} /> : <div className="user-avatar">YOU</div>}</div>
      <div className="message-body">
        <div className="message-author">{role === "assistant" ? character.name : "คุณ"}</div>
        <div className="bubble">
          {typing ? <span className="typing"><i /><i /><i /></span> : content.split("\n").map((line, index) => <p key={index}>{line || <br />}</p>)}
        </div>
      </div>
    </article>
  );
}
