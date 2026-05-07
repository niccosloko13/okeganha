export const GAMIFICATION_IMAGE_SIZES = {
  avatar: "42px",
  icon: "56px",
  badge: "18px",
  bar: "200px",
  missionThumb: "(max-width: 768px) 40vw, 180px",
} as const;

export function imgProps(kind: keyof typeof GAMIFICATION_IMAGE_SIZES, priority = false) {
  return {
    sizes: GAMIFICATION_IMAGE_SIZES[kind],
    loading: priority ? "eager" as const : "lazy" as const,
    priority,
  };
}
