import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { getCurrentBrand } from "@/app/lib/auth";

const MAX_BYTES = 5_000_000; // 5 Mo
const OK_EXT = ["jpg", "jpeg", "png", "webp", "gif", "avif"];

export async function POST(request: Request) {
  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: "Fichier trop lourd (5 Mo max)" }, { status: 413 });

  const ext = (file.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!OK_EXT.includes(ext))
    return NextResponse.json({ error: "Format d'image non supporté" }, { status: 415 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, name), buffer);

  return NextResponse.json({ url: `/uploads/${name}` });
}
