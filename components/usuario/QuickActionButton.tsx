import Link from "next/link";

type QuickActionButtonProps = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
  pulse?: boolean;
};

export function QuickActionButton({ href, label, variant = "primary", pulse = false }: QuickActionButtonProps) {
  const cls =
    variant === "primary"
      ? `ok-btn-primary inline-flex items-center justify-center text-sm ${pulse ? "ok-pulse" : ""}`
      : "ok-btn-secondary inline-flex items-center justify-center text-sm";

  return (
    <Link href={href} className={cls}>
      {label}
    </Link>
  );
}
