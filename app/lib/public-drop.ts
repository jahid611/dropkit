import { cache } from "react";
import { prisma } from "@/app/lib/db";

/**
 * Lecture d'un drop public par slug, mémoïsée par requête (`cache()` React) :
 * `generateMetadata` et la page la partagent → une seule requête DB.
 */
export const getPublicDrop = cache((slug: string) =>
  prisma.drop.findUnique({
    where: { slug },
    include: {
      brand: { include: { profile: true } },
      items: { orderBy: { position: "asc" } },
      fields: { orderBy: { position: "asc" } },
    },
  }),
);
