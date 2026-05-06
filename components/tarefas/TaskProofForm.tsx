"use client";

import { useActionState } from "react";

import { submitTaskProofAction } from "@/app/actions/user-actions";
import type { ActionState } from "@/types";

const initialState: ActionState = { ok: false };

type TaskProofFormProps = {
  taskId: string;
  proofType: "TEXT" | "IMAGE" | "LINK" | "TEXT_AND_IMAGE";
};

export function TaskProofForm({ taskId, proofType }: TaskProofFormProps) {
  const [state, formAction, pending] = useActionState(submitTaskProofAction, initialState);

  const proofHint =
    proofType === "LINK"
      ? "Cole o link da prova (post, comentário ou avaliação)."
      : proofType === "IMAGE"
        ? "Envie uma URL de print ou imagem da execução."
        : "Adicione URL de print, link ou imagem da prova.";

  return (
    <form action={formAction} className="ok-card space-y-3 p-4">
      <input type="hidden" name="taskId" value={taskId} />

      <div className="rounded-2xl border border-[#ffd4eb] bg-[#fff1f9] px-3 py-2 text-xs font-medium text-[#7b3b68]">
        Envie uma comprovação real da execução. Tentativas falsas podem resultar em bloqueio.
      </div>

      <div>
        <label className="ok-label">Descrição da comprovação</label>
        <textarea
          name="proofText"
          required
          minLength={12}
          className="ok-input h-28"
          placeholder="Descreva como você realizou a tarefa."
        />
      </div>

      <div>
        <label className="ok-label">URL ou print</label>
        <input name="proofImageUrl" className="ok-input" placeholder="https://..." />
        <p className="mt-1 text-xs text-[#8269a0]">{proofHint}</p>
      </div>

      {state.message ? <p className={state.ok ? "text-sm text-okBlueDark" : "text-sm text-okPink"}>{state.message}</p> : null}

      <button disabled={pending} type="submit" className="ok-btn-primary w-full disabled:opacity-60">
        {pending ? "Enviando..." : "Enviar comprovação"}
      </button>
    </form>
  );
}
