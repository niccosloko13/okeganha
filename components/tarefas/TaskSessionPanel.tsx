"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TaskSessionPanelProps = {
  taskId: string;
  campaignId: string;
  contentUrl: string;
};

type SessionState = {
  id: string;
  activeDuration: number;
  requiredDuration: number;
  focusLossCount: number;
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function buildFingerprint(clickIntervalMs: number | null) {
  const nav = navigator as Navigator & { webdriver: boolean };
  const screenInfo = `${window.screen.width}x${window.screen.height}`;
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, language: nav.language,
    platform: nav.platform, screen: screenInfo,
    colorDepth: window.screen.colorDepth, hardwareConcurrency: nav.hardwareConcurrency,
    maxTouchPoints: nav.maxTouchPoints, pluginsLength: nav.plugins.length ?? 0,
    canvasHash: "canvas-na", webglHash: "webgl-na",
    webdriver: Boolean(nav.webdriver), clickIntervalMs: clickIntervalMs ?? undefined,
  };
}

export function TaskSessionPanel({ taskId, campaignId, contentUrl }: TaskSessionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);
  const [canFinish, setCanFinish] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [focusLossCountLocal, setFocusLossCountLocal] = useState(0);
  const focusLossIncrementRef = useRef(0);
  const lastClickTs = useRef<number | null>(null);

  const progress = useMemo(() => {
    if (!session) return 0;
    return Math.max(0, Math.min(100, Math.round((session.activeDuration / session.requiredDuration) * 100)));
  }, [session]);
  const remainingSeconds = useMemo(() => {
    if (!session) return 0;
    return Math.max(0, session.requiredDuration - session.activeDuration);
  }, [session]);

  const startSession = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/task-session/start", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMessage(data.message ?? "Não foi possível iniciar a sessão.");
        return;
      }

      setSession(data.session);
      setFocusLossCountLocal(0);
      setIsFinalized(false);
      window.open(contentUrl, "_blank", "noopener,noreferrer");
      setMessage(data.resumed ? "Sessao retomada. Continue para liberar o envio." : "Sessao iniciada. Mantenha esta aba ativa ate completar o tempo minimo.");
    } catch {
      setMessage("Erro ao iniciar sessão de tarefa.");
    } finally {
      setLoading(false);
    }
  }, [contentUrl, taskId]);

  const finishSession = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/task-session/finish", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMessage(data.message ?? "Não foi possível finalizar a tarefa.");
        return;
      }

      setCanFinish(false);
      setIsFinalized(true);
      setMessage("Sessão finalizada com sucesso. Agora você pode enviar a comprovação.");
      setSession((prev) => (prev ? { ...prev, activeDuration: data.session.activeDuration } : prev));
    } catch {
      setMessage("Erro ao finalizar sessão.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") {
        focusLossIncrementRef.current += 1;
        setFocusLossCountLocal((prev) => prev + 1);
      }
    };

    const onBlur = () => {
      focusLossIncrementRef.current += 1;
      setFocusLossCountLocal((prev) => prev + 1);
    };

    window.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useEffect(() => {
    if (!session || isFinalized) return;

    const timer = window.setInterval(async () => {
      const clickIntervalMs = lastClickTs.current ? Date.now() - lastClickTs.current : null;
      const payload = {
        sessionId: session.id, isVisible: document.visibilityState === "visible",
        isFocused: document.hasFocus(), focusLossIncrement: focusLossIncrementRef.current > 0 ? 1 : 0, deviceFingerprint: buildFingerprint(clickIntervalMs),
      };

      focusLossIncrementRef.current = 0;

      const response = await fetch("/api/task-session/heartbeat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        if (data.blocked) {
          window.location.href = "/conta/bloqueada";
        }
        return;
      }

      setSession((prev) => (prev ? { ...prev, ...data.session } : prev));
      setCanFinish(Boolean(data.canFinish));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [session, isFinalized]);

  return (
    <article className="ok-card p-5">
      <h2 className="text-lg font-semibold text-[#4d2e75]">Sessão de execução segura</h2>
      <p className="mt-2 text-sm text-[#6f4f8f]">
        Abra o conteúdo em nova aba, mantenha o foco e complete o tempo mínimo para liberar o envio da comprovação.
      </p>

      {!session ? (
        <button
          type="button"
          onClick={(event) => {
            const now = Date.now();
            lastClickTs.current = now;
            startSession();
          }}
          disabled={loading}
          className="ok-btn-primary mt-4"
        >
          {loading ? "Iniciando..." : "Abrir conteúdo"}
        </button>
      ) : session ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-[#ecd7ff] bg-white p-3">
            <p className="text-sm font-semibold text-[#5b2f85]">Tempo ativo: {formatTime(session.activeDuration)}</p>
            <p className="text-xs text-[#7a5a99]">Tempo mínimo: {formatTime(session.requiredDuration)}</p>
            <p className="text-xs font-semibold text-[#6b38a0]">
              {canFinish ? "Pronto para envio" : `Em andamento: faltam ${formatTime(remainingSeconds)}`}
            </p>
            <p className="text-xs text-[#7a5a99]">Perdas de foco: {Math.max(session.focusLossCount, focusLossCountLocal)}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#f1e4ff]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#ff63bc] via-[#c248ff] to-[#7a2fbc]" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <button type="button" onClick={finishSession} disabled={!canFinish || loading} className="ok-btn-secondary">
            {loading ? "Finalizando..." : "Finalizar tarefa"}
          </button>
        </div>
      ) : null}

      {message ? <p className="mt-3 text-sm text-[#6f4f8f]">{message}</p> : null}
    </article>
  );
}
