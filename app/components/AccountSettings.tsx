"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateEmailAction,
  changePasswordAction,
  type AccountState,
} from "@/app/actions/account";

const inputCls =
  "w-full border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink/30 outline-none transition focus:border-ink/50";
const labelCls = "eyebrow text-ink/45";

function Save({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-ink px-6 py-2.5 eyebrow text-paper transition hover:opacity-85 disabled:opacity-50"
    >
      {pending ? "…" : label}
    </button>
  );
}

function Feedback({ state }: { state: AccountState }) {
  if (state.error) return <span className="text-sm text-[#9a3b2c]">{state.error}</span>;
  if (state.ok) return <span className="eyebrow text-ink/55">Enregistré ✓</span>;
  return null;
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-line p-6">
      <h2 className="luxe text-xl text-ink">{title}</h2>
      {desc && <p className="mt-1 text-sm text-ink/50">{desc}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function AccountSettings({ email }: { email: string }) {
  const [emailState, emailAction] = useActionState<AccountState, FormData>(updateEmailAction, {});
  const [pwState, pwAction] = useActionState<AccountState, FormData>(changePasswordAction, {});

  return (
    <div className="flex flex-col gap-6">
      <Section title="Adresse email" desc="Sert à vous connecter.">
        <form action={emailAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Email</span>
            <input name="email" type="email" defaultValue={email} required className={inputCls} />
          </label>
          <div className="flex items-center gap-4">
            <Save label="Mettre à jour" />
            <Feedback state={emailState} />
          </div>
        </form>
      </Section>

      <Section title="Mot de passe" desc="Choisissez un mot de passe d'au moins 8 caractères.">
        <form action={pwAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Mot de passe actuel</span>
            <input name="current" type="password" autoComplete="current-password" required className={inputCls} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Nouveau mot de passe</span>
            <input name="next" type="password" autoComplete="new-password" required minLength={8} className={inputCls} />
          </label>
          <div className="flex items-center gap-4">
            <Save label="Changer le mot de passe" />
            <Feedback state={pwState} />
          </div>
        </form>
      </Section>
    </div>
  );
}
