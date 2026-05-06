import clsx from "clsx";

type StatusBadgeProps = {
  status: string;
};

const palette: Record<string, string> = {
  ACTIVE: "border border-okBorder bg-okBlueLight text-okBlueDark", PAUSED: "border border-okBorder bg-okLilac/30 text-[#564796]",
  FINISHED: "border border-okBorder bg-[#eef0f8] text-[#5a6690]", PENDING: "border border-okBorder bg-okLilac/30 text-[#564796]",
  APPROVED: "border border-okBorder bg-okBlueLight text-okBlueDark", REJECTED: "border border-okPink/70 bg-okPink/25 text-[#7d3860]",
  BLOCKED: "border border-okPink/70 bg-okPink/25 text-[#7d3860]", PAID: "border border-okBorder bg-okBlueLight text-okBlueDark",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={clsx("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", palette[status] ?? "border border-okBorder bg-okBlueLight text-okBlueDark")}>
      {status}
    </span>
  );
}

