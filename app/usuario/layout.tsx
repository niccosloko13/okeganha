import { requireRegularUser } from "@/lib/auth";

export default async function UsuarioLayout({ children }: { children: React.ReactNode }) {
  await requireRegularUser();
  return children;
}

