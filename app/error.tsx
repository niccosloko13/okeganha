"use client";

import { useEffect } from "react";
import { isDatabaseUrlMissingError } from "@/lib/env";

type ErrorPageProps = {
  error: Error & { digest: string };
  reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isConfigError = isDatabaseUrlMissingError(error);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4 py-10">
      <div className="ok-card w-full p-6">
        <p className="ok-badge">Falha de configuração</p>
        <h1 className="mt-3 text-2xl font-bold text-[#4d2e75]">
          {isConfigError ? "Banco de dados não configurado" : "Algo deu errado"}
        </h1>
        <p className="mt-2 text-sm text-[#8269a0]">
          {isConfigError
            ? "Defina DATABASE_URL no arquivo .env e reinicie o servidor. Use o .env.example como referencia."
            : "Não foi possível concluir esta ação agora. Tente novamente."}
        </p>
        <button className="ok-btn-primary mt-4" onClick={reset} type="button">
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
