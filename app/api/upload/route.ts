import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getCurrentBrand } from "@/app/lib/auth";
import { supabaseAdmin, BUCKET } from "@/app/lib/supabase";

const MAX_BYTES = 6_000_000; // 6 Mo
const OK_EXT = ["jpg", "jpeg", "png", "webp", "gif", "avif"];

export async function POST(request: Request) {
  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: "Fichier trop lourd (6 Mo max)" }, { status: 413 });

  const ext = (file.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!OK_EXT.includes(ext))
    return NextResponse.json({ error: "Format d'image non supporté" }, { status: 415 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = `uploads/${randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || `image/${ext}`,
    upsert: false,
  });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
