import { UserShell } from "@/components/layout/UserShell";
import { ProfileForm } from "@/components/usuario/ProfileForm";
import { requireUser } from "@/lib/auth";

export default async function PerfilPage() {
  const user = await requireUser();

  return (
    <UserShell title="Meu perfil" subtitle="Atualize telefone e chave Pix.">
      <div className="ok-fade-up">
        <ProfileForm phone={user.phone} pixKey={user.pixKey} email={user.email} name={user.name} />
      </div>
    </UserShell>
  );
}

