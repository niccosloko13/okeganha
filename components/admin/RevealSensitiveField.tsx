"use client";

import { useActionState } from "react";

import { revealSensitiveFieldAction } from "@/app/actions/admin-user-actions";

type RevealSensitiveFieldProps = {
  userId: string;
  field: "cpf" | "pixKey";
  masked: string;
};

export function RevealSensitiveField({ userId, field, masked }: RevealSensitiveFieldProps) {
  const [state, formAction, pending] = useActionState(revealSensitiveFieldAction, { value: masked });

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="field" value={field} />
      <span className="text-sm text-[#6f4f8f]">{state.value}</span>
      <button type="submit" disabled={pending} className="ok-btn-secondary text-xs">
        {pending ? "..." : "Revelar dado sensível"}
      </button>
    </form>
  );
}
