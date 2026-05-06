import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

type UserRiskBadgeProps = { level: "LOW" | "MEDIUM" | "HIGH" };

export function UserRiskBadge({ level }: UserRiskBadgeProps) {
  return <AdminStatusBadge status={level} />;
}
