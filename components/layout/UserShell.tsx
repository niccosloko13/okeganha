import { AppShell } from "@/components/layout/AppShell";

type UserShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export async function UserShell(props: UserShellProps) {
  return <AppShell {...props} />;
}
