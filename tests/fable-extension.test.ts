import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const extensionPath = path.join(root, "extensions", "fable-friendly-ui", "index.js");
const manifestPath = path.join(root, "extensions", "fable-friendly-ui", "manifest.json");
const configurePath = path.join(root, "scripts", "configure-sillytavern.ps1");

test("Fable UI compiles language, Persona, and character preferences into one prompt", async () => {
  const source = await readFile(extensionPath, "utf8");
  assert.match(source, /COMPILED_PROMPT_KEY/);
  assert.match(source, /compileFablePrompt/);
  assert.match(source, /\[Response language\]/);
  assert.match(source, /\[User Persona\]/);
  assert.match(source, /\[Character preferences\]/);
  assert.match(source, /LEGACY_PROMPT_KEYS/);
});

test("Character Card editor includes identity, quality, and local authoring tools", async () => {
  const source = await readFile(extensionPath, "utf8");
  for (const field of ["gender", "pronouns", "age", "occupation", "role"]) {
    assert.match(source, new RegExp(`name: '${field}'`));
  }
  assert.match(source, /validateCardProfile/);
  assert.match(source, /fable-prompt-preview/);
  assert.match(source, /generateDialogueExample/);
  assert.match(source, /generateLocalTranslation/);
  assert.match(source, /const profile = \{ \.\.\.cloneEmptyProfile\(\), \.\.\.stored \}/);
  assert.match(source, /profile\.localizations/);
  assert.match(source, /context\.generateRaw/);
  assert.doesNotMatch(source, /translate\.google|api\.deepl/);
});

test("local memory uses the installed Ollama embedding model", async () => {
  const configure = await readFile(configurePath, "utf8");
  assert.match(configure, /source = 'ollama'/);
  assert.match(configure, /qwen3-embedding:0\.6b/);
  assert.match(configure, /\$EmbeddingModel = \$EmbeddingModel\.Trim/);
  assert.match(configure, /enabled_chats = \$true/);
  assert.match(configure, /\$memory\.source = 'main'/);
  assert.match(configure, /Do not invent or infer missing facts/);
});

test("extension manifest exposes the integrated profile release", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.equal(manifest.version, "0.5.1");
  assert.equal(manifest.minimum_client_version, "1.19.0");
});
