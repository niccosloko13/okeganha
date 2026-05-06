"use client";

import { useActionState, useEffect, useState } from "react";

import { requestIdentityVerificationAction } from "@/app/actions/user-actions";
import type { ActionState } from "@/types";

const initialState: ActionState = { ok: false };

type IdentityVerificationCardProps = {
  status: "NOT_VERIFIED" | "PENDING" | "VERIFIED";
};

const statusLabel: Record<IdentityVerificationCardProps["status"], string> = {
  NOT_VERIFIED: "Não verificado", PENDING: "Verificação pendente",
  VERIFIED: "Verificado",
};

export function IdentityVerificationCard({ status }: IdentityVerificationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(requestIdentityVerificationAction, initialState);
  const isVerified = status === "VERIFIED";

  useEffect(() => {
    if (state.ok) {
      setIsOpen(false);
    }
  }, [state.ok]);

  return (
    <>
      <article className="ok-card space-y-3 p-4">
        <h3 className="text-base font-extrabold text-[#3a1658]">Verificação facial</h3>
        <p className="text-sm text-[#7a5a99]">
          Status atual: <strong>{statusLabel[status]}</strong>
        </p>
        <button
          type="button"
          disabled={isVerified}
          onClick={() => setIsOpen(true)}
          className="ok-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isVerified ? "Identidade verificada" : "Verificar identidade"}
        </button>
      </article>

      {isOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#2f1245]/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#e8d0ff] bg-white p-5 shadow-[0_30px_45px_-28px_rgba(104,36,158,0.92)]">
            <h4 className="text-lg font-extrabold text-[#3a1658]">Enviar verificação</h4>
            <p className="mt-1 text-sm text-[#7a5a99]">
              Envie uma selfie para análise manual. Este processo é um mock para preparação do painel admin.
            </p>

            <form action={formAction} className="mt-4 space-y-3">
              <div>
                <label className="ok-label">Upload da imagem</label>
                <input type="file" accept="image/*" className="ok-input" required />
              </div>

              {state.message ? (
                <p className={state.ok ? "text-sm text-okBlueDark" : "text-sm text-okPink"}>{state.message}</p>
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setIsOpen(false)} className="ok-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={pending} className="ok-btn-primary disabled:opacity-60">
                  {pending ? "Enviando..." : "Enviar verificação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
