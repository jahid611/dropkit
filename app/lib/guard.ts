import "server-only";

import { redirect } from "next/navigation";
import { getCurrentBrand } from "./auth";

/** Exige une marque connectée. Redirige vers /login sinon. */
export async function requireBrand() {
  const brand = await getCurrentBrand();
  if (!brand) redirect("/login");
  return brand;
}

/** Exige une marque connectée ET onboardée. Sinon redirige où il faut. */
export async function requireOnboardedBrand() {
  const brand = await requireBrand();
  if (!brand.onboardingCompleted) redirect("/onboarding");
  return brand;
}
