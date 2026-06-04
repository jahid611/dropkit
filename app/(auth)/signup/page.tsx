import { redirect } from "next/navigation";
import AuthForm from "@/app/components/AuthForm";
import { signupAction } from "@/app/actions/auth";
import { getCurrentBrand } from "@/app/lib/auth";

export default async function SignupPage() {
  const brand = await getCurrentBrand();
  if (brand) redirect(brand.onboardingCompleted ? "/dashboard" : "/onboarding");

  return (
    <>
      <h1 className="mb-1 luxe text-3xl text-[#1a1611]">Créez votre studio</h1>
      <p className="mb-7 text-sm text-[#1a1611]/55">
        Quelques minutes pour votre premier drop.
      </p>
      <AuthForm mode="signup" action={signupAction} />
    </>
  );
}
