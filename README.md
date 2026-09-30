# Fable Local

แพลตฟอร์มเล่น roleplay กับตัวละคร AI แบบ local-first ใช้ Next.js และเชื่อมต่อ Ollama โดยตรง ข้อมูลตัวละคร ฉาก และข้อความจะเก็บในเครื่อง ไม่ต้องใช้ cloud API

## ความสามารถ

- สร้างและแก้ไขตัวละคร พร้อมบุคลิก ฉากเปิด คำทักทาย และตัวอย่างบทสนทนา
- อัปโหลดรูปตัวละคร พร้อมอายุ สรรพนาม อาชีพ โลก เป้าหมาย และข้อมูลเสริม
- ปรับธีม สีหลัก ขนาดตัวอักษร ความหนาแน่น และพื้นผิวของ UI
- เลือกโมเดล Ollama และ temperature แยกต่อตัวละคร
- ตอบแบบ streaming ผ่าน Ollama Chat API
- แยกประวัติเป็นหลายฉากต่อตัวละคร
- เก็บข้อมูลถาวรใน `data/store.json` หรือ Podman named volume
- UI รองรับ desktop และ mobile

## รันโดยตรง

ต้องมี Node.js 20.9 ขึ้นไป, pnpm และ Ollama ที่กำลังทำงานอยู่

```powershell
Copy-Item .env.example .env.local
pnpm install
pnpm dev
```

เปิด `http://localhost:3000` และตรวจว่า Ollama เปิดที่ `http://127.0.0.1:11434` หากชื่อโมเดลของคุณไม่ใช่ `qwen3:8b` ให้แก้ `OLLAMA_MODEL` หรือเลือกโมเดลในหน้าแก้ไขตัวละคร

ดูชื่อโมเดลที่ติดตั้ง:

```powershell
ollama list
```

## รันด้วย Podman

Ollama ยังรันบน Windows host ตามปกติ ส่วนเว็บแอปอยู่ใน container:

```powershell
$env:OLLAMA_MODEL="qwen3:8b"
podman compose up --build
```

Compose ตั้ง `OLLAMA_BASE_URL=http://host.containers.internal:11434` ไว้แล้ว ข้อมูลถูกเก็บใน volume `roleplay-data`

หาก container ต่อ Ollama ไม่ได้ ให้ตรวจว่า Ollama ยอมรับ connection จาก Podman VM และ host alias ใช้งานได้ในเครื่องนั้น โดยลองเรียก `/api/tags` จาก container

## การตั้งค่า

| ตัวแปร | ค่าเริ่มต้น | ความหมาย |
| --- | --- | --- |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | URL ของ Ollama API |
| `OLLAMA_MODEL` | `qwen3:8b` | โมเดลเริ่มต้นสำหรับตัวละครใหม่ |
| `DATA_DIR` | `./data` | ตำแหน่งข้อมูลถาวร |

## ตรวจสอบคุณภาพ

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## โครงสร้าง

- `src/app/page.tsx` — หน้า roleplay และ character editor
- `src/app/api` — API สำหรับตัวละคร ฉาก โมเดล และ streaming chat
- `src/app/api/uploads` — อัปโหลดและให้บริการรูปตัวละครจาก local storage
- `src/lib/store.ts` — local JSON persistence พร้อม serialized writes
- `src/lib/ollama.ts` — Ollama client
- `src/lib/prompt.ts` — ประกอบ system prompt ของตัวละคร

ไฟล์ JSON เหมาะกับการใช้งานคนเดียวในเครื่อง หากจะเปิดหลายผู้ใช้หรือหลาย process ควรเปลี่ยนชั้น `store.ts` เป็น SQLite/PostgreSQL พร้อม authentication
