import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentVisitor } from "@/app/lib/visitor-auth";
import { readFpToken, fingerprint } from "@/app/lib/fingerprint";

// État personnel du visiteur pour un drop (lit les cookies -> route dynamique).
// Appelée par VisitorExperience après l'affichage de la page (cachée côté CDN).
// Réponse non mise en cache.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [visitor, token] = await Promise.all([
    getCurrentVisitor(),
    readFpToken(),
  ]);
  const fp = token ? fingerprint(token) : null;

  let alreadySubmitted = false;
  if (fp || visitor) {
    const existing = await prisma.submission.findFirst({
      where: {
        dropId: id,
        OR: [
          ...(fp ? [{ fingerprint: fp }] : []),
          ...(visitor ? [{ visitorId: visitor.id }] : []),
        ],
      },
    });
    alreadySubmitted = Boolean(existing);
  }

  return NextResponse.json(
    {
      alreadySubmitted,
      loggedIn: Boolean(visitor),
      visitorEmail: visitor?.email ?? null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
