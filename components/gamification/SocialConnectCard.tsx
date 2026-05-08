import Image from "next/image";

import { GAMIFICATION_ASSETS } from "@/lib/gamification-assets";

type SocialStatus = "NOT_CONNECTED" | "PENDING" | "CONNECTED" | "ERROR" | "RECHECK_REQUIRED";

const statusStyle: Record<SocialStatus, string> = {
  NOT_CONNECTED: "text-[#d7c2ef] border-[#6f45a3]",
  PENDING: "text-[#ffe6a6] border-[#8e7332]",
  CONNECTED: "text-[#a8ffd8] border-[#2f7c5e]",
  ERROR: "text-[#ffb4cf] border-[#8a3b5e]",
  RECHECK_REQUIRED: "text-[#ffd8b3] border-[#8b5a2f]",
};

export function SocialConnectCard({
  platform,
  username,
  profileUrl,
  status,
}: {
  platform: "INSTAGRAM" | "TIKTOK" | "FACEBOOK";
  username?: string;
  profileUrl?: string;
  status: SocialStatus;
}) {
  const icon = platform === "INSTAGRAM" ? GAMIFICATION_ASSETS.platforms.instagram : platform === "TIKTOK" ? GAMIFICATION_ASSETS.platforms.tiktok : GAMIFICATION_ASSETS.platforms.google;

  return (
    <article className="rounded-2xl border border-[#6f45a3] bg-[#1a1030]/85 p-4 backdrop-blur-md transition hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <Image src={icon} alt={platform} width={72} height={72} className="h-16 w-16 rounded-xl object-cover" loading="lazy" />
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-[#f2e8ff]">{platform}</h3>
          <p className="truncate text-xs text-[#ccb3e9]">{username || "Perfil ainda nao conectado"}</p>
        </div>
      </div>

      <div className={`mt-3 inline-flex rounded-lg border px-2 py-1 text-[11px] font-bold ${statusStyle[status]}`}>{status}</div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button type="button" className="min-h-[40px] rounded-lg border border-[#6f45a3] bg-[#241640] px-2 text-xs font-semibold text-[#f1e7ff] active:scale-95">Conectar</button>
        <button type="button" className="min-h-[40px] rounded-lg border border-[#6f45a3] bg-[#241640] px-2 text-xs font-semibold text-[#f1e7ff] active:scale-95">Reconectar</button>
        <a href={profileUrl || "#"} target="_blank" className="min-h-[40px] rounded-lg border border-[#6f45a3] bg-[#241640] px-2 py-2 text-center text-xs font-semibold text-[#f1e7ff]">Ver perfil</a>
      </div>

      <p className="mt-3 text-[11px] text-[#c7afe6]">Conexao real sera feita por fluxo seguro/OAuth quando disponivel.</p>
    </article>
  );
}
