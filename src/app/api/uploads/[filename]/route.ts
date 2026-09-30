import { readFile } from "node:fs/promises";
import path from "node:path";
import { getDataDirectory } from "@/lib/store";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
};

type UploadRouteContext = { params: Promise<{ filename: string }> };

export async function GET(_: Request, context: UploadRouteContext) {
  const { filename } = await context.params;
  if (!/^[a-f0-9-]+\.(png|jpe?g|webp|gif)$/i.test(filename)) return new Response("Not found", { status: 404 });
  try {
    const extension = path.extname(filename).toLowerCase();
    const data = await readFile(path.join(getDataDirectory(), "uploads", filename));
    return new Response(data, {
      headers: { "content-type": contentTypes[extension] || "application/octet-stream", "cache-control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
