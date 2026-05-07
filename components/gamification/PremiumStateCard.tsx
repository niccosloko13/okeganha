import Image from "next/image";

import { GAMIFICATION_ASSETS } from "@/lib/gamification-assets";

export function PremiumStateCard({
  title,
  description,
  type,
}: {
  title: string;
  description: string;
  type: "empty" | "energy_low" | "level_up" | "completed" | "review" | "blocked" | "profile_incomplete";
}) {
  const icon =
    type === "energy_low" ? GAMIFICATION_ASSETS.rewards.energy
      : type === "level_up" ? GAMIFICATION_ASSETS.badges.crown
      : type === "completed" ? GAMIFICATION_ASSETS.badges.trophy
      : type === "review" ? GAMIFICATION_ASSETS.effects.streak
      : type === "blocked" ? GAMIFICATION_ASSETS.rewards.locked
      : type === "profile_incomplete" ? GAMIFICATION_ASSETS.badges.verified
      : GAMIFICATION_ASSETS.rewards.chest;

  return (
    <article className="rounded-2xl border border-[#7d4bb2] bg-[#20133a]/85 p-4 backdrop-blur-md shadow-[0_16px_30px_-20px_rgba(181,89,255,0.8)]">
      <div className="flex items-center gap-3">
        <Image src={icon} alt="state" width={44} height={44} className="h-11 w-11 object-contain" loading="lazy" />
        <div>
          <h3 className="text-sm font-bold text-[#f3e9ff]">{title}</h3>
          <p className="text-xs text-[#d2bceb]">{description}</p>
        </div>
      </div>
    </article>
  );
}
