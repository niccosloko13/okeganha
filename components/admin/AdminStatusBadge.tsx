import clsx from "clsx";

type AdminStatusBadgeProps = {
  status: string;
};

const palette: Record<string, string> = {
  ACTIVE: "border border-[#d9c4ff] bg-[#f5ecff] text-[#5c3584]", PAUSED: "border border-[#ead7ff] bg-[#faf5ff] text-[#8264a5]",
  FINISHED: "border border-[#e5e8f3] bg-[#f4f6fb] text-[#5d688f]", DRAFT: "border border-[#ead7ff] bg-[#faf5ff] text-[#8264a5]",
  UNDER_REVIEW: "border border-[#ffe6bc] bg-[#fff6e3] text-[#9a6b15]", PENDING: "border border-[#ead7ff] bg-[#faf5ff] text-[#8264a5]",
  APPROVED: "border border-[#c8eed7] bg-[#e9fff2] text-[#327854]", REJECTED: "border border-[#ffc9df] bg-[#ffeef6] text-[#933f6c]",
  TRIAL: "border border-[#ead7ff] bg-[#faf5ff] text-[#8264a5]", PAST_DUE: "border border-[#ffe6bc] bg-[#fff6e3] text-[#9a6b15]",
  CANCELED: "border border-[#ffd2d9] bg-[#fff2f5] text-[#9a3c53]", BLOCKED: "border border-[#ffc9df] bg-[#ffeef6] text-[#933f6c]",
  PAID: "border border-[#c8eed7] bg-[#e9fff2] text-[#327854]", FREE: "border border-[#e5e8f3] bg-[#f4f6fb] text-[#5d688f]",
  BASIC: "border border-[#d9c4ff] bg-[#f5ecff] text-[#5c3584]", PREMIUM: "border border-[#ffd1ea] bg-[#fff0f9] text-[#9a3e77]",
  ENTERPRISE: "border border-[#cfe8ff] bg-[#edf6ff] text-[#255d96]", LOW: "border border-[#d3f1df] bg-[#eefff4] text-[#2f7b4f]",
  MEDIUM: "border border-[#ffe6bc] bg-[#fff6e3] text-[#9a6b15]", HIGH: "border border-[#ffc9df] bg-[#ffeef6] text-[#933f6c]",
  USER: "border border-[#d9c4ff] bg-[#f5ecff] text-[#5c3584]", ADMIN: "border border-[#ffd1ea] bg-[#fff0f9] text-[#9a3e77]",
  COMPANY: "border border-[#d9c4ff] bg-[#f5ecff] text-[#5c3584]",
};

const labels: Record<string, string> = {
  PENDING: "Pendente", ACTIVE: "Ativa",
  REJECTED: "Reprovada", BLOCKED: "Bloqueada",
  FREE: "FREE", BASIC: "BASIC",
  PREMIUM: "PREMIUM", ENTERPRISE: "ENTERPRISE",
};

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  return (
    <span className={clsx("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", palette[status] ?? palette.PENDING)}>
      {labels[status] ?? status}
    </span>
  );
}
