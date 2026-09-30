import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getDataDirectory } from "@/lib/store";

export const runtime = "nodejs";

const allowedTypes: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 6 * 1024 * 1024) {
      return Response.json({ error: "Image must be smaller than 5 MB" }, { status: 413 });
    }
    const formData = await request.formData();
    const file = formData.get("image");
    if (!(file instanceof File)) throw new Error("Image file is required");
    const extension = allowedTypes[file.type];
    if (!extension) throw new Error("Only PNG, JPEG, WebP, and GIF images are supported");
    if (file.size === 0 || file.size > 5 * 1024 * 1024) throw new Error("Image must be smaller than 5 MB");

    const filename = `${crypto.randomUUID()}.${extension}`;
    const uploadDirectory = path.join(getDataDirectory(), "uploads");
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(path.join(uploadDirectory, filename), Buffer.from(await file.arrayBuffer()));
    return Response.json({ url: `/api/uploads/${filename}` }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 });
  }
}
