import { NextResponse } from "next/server";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { prisma } from "@/app/lib/db";
import { getCurrentBrand } from "@/app/lib/auth";
import { slugify } from "@/app/lib/slug";

function safeParse(raw: string): Record<string, string> {
  try {
    const o = JSON.parse(raw);
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await ctx.params;
  const drop = await prisma.drop.findFirst({
    where: { id, brandId: brand.id },
    include: {
      fields: { orderBy: { position: "asc" } },
      submissions: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!drop) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const format =
    new URL(request.url).searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  // Colonnes : Date + libellés des champs
  const columns = ["Date", ...drop.fields.map((f) => f.label)];
  const aoa: string[][] = [columns];
  for (const s of drop.submissions) {
    const data = safeParse(s.data);
    aoa.push([
      s.createdAt.toISOString().slice(0, 16).replace("T", " "),
      ...drop.fields.map((f) => data[f.id] ?? ""),
    ]);
  }

  const base = `inscrits-${slugify(drop.title)}`;

  if (format === "csv") {
    const csv = Papa.unparse(aoa);
    return new NextResponse("﻿" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${base}.csv"`,
      },
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inscrits");
  const buf: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${base}.xlsx"`,
    },
  });
}
