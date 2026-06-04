// Compression d'image côté navigateur (avant upload) : on redimensionne et on
// ré-encode en WebP. Réduit fortement le poids des fichiers.

export async function compressImage(
  file: File,
  maxSize = 1280,
  quality = 0.82,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  if (width > maxSize || height > maxSize) {
    const scale = maxSize / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Compression impossible");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob) throw new Error("Compression impossible");
  return blob;
}

/** Compresse puis envoie l'image à /api/upload. Renvoie l'URL stockée. */
export async function uploadCompressed(
  file: File,
  { maxSize = 1280, quality = 0.82 }: { maxSize?: number; quality?: number } = {},
): Promise<string> {
  const blob = await compressImage(file, maxSize, quality);
  const fd = new FormData();
  fd.append("file", new File([blob], "image.webp", { type: "image/webp" }));
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Échec de l'upload");
  return json.url as string;
}
