"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { AuthState } from "@/app/actions/auth";

type Action = (prev: AuthState, fd: FormData) => Promise<AuthState>;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-3 w-full bg-[#1a1611] px-4 py-3.5 text-[0.65rem] uppercase tracking-[0.25em] text-[#f5f1ea] transition hover:opacity-85 disabled:opacity-50"
    >
      {pending ? "…" : label}
    </button>
  );
}

const inputCls =
  "w-full border border-[#1a1611]/20 bg-transparent px-4 py-3 text-sm text-[#1a1611] placeholder:text-[#1a1611]/30 outline-none transition focus:border-[#1a1611]";
const labelCls = "text-[0.6rem] uppercase tracking-[0.25em] text-[#1a1611]/50";

export default function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "signup";
  action: Action;
}) {
  const [state, formAction] = useActionState(action, {});
  const isSignup = mode === "signup";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="hello@votremaison.com"
          className={inputCls}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Mot de passe</span>
        <input
          name="password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
          minLength={isSignup ? 8 : undefined}
          placeholder="••••••••"
          className={inputCls}
        />
      </label>

      {isSignup && (
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Confirmer le mot de passe</span>
          <input
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            className={inputCls}
          />
        </label>
      )}

      {state.error && (
        <p className="border border-[#9a3b2c]/30 bg-[#9a3b2c]/5 px-3 py-2 text-xs text-[#9a3b2c]">
          {state.error}
        </p>
      )}

      <SubmitButton label={isSignup ? "Créer mon studio" : "Se connecter"} />

      <p className="mt-1 text-center text-xs text-[#1a1611]/50">
        {isSignup ? (
          <>
            Déjà un compte ?{" "}
            <Link href="/login" className="border-b border-[#1a1611] pb-0.5 text-[#1a1611]">
              Se connecter
            </Link>
          </>
        ) : (
          <>
            Pas encore de compte ?{" "}
            <Link href="/signup" className="border-b border-[#1a1611] pb-0.5 text-[#1a1611]">
              Créer un compte
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
