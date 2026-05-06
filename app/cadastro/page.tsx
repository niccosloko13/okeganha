import Link from "next/link";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function CadastroPage() {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6">
      <div className="ok-topbar mb-6 p-5 text-center">
        <div className="flex justify-center">
          <BrandLogo height={44} textClassName="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">Criar conta</h1>
        <p className="text-sm text-[#eaf3ff]">Comece hoje e acompanhe tudo pelo app.</p>
      </div>
      <GoogleSignInButton enabled={googleEnabled} />
      <p className="my-4 text-center text-sm font-medium text-[#8a6cab]">Ou crie com email e senha</p>
      <RegisterForm />
      <p className="mt-3 text-center text-xs text-[#8a6cab]">Você completa seus dados de saque depois.</p>
      <p className="mt-4 text-center text-sm text-[#8269a0]">
        Já possui conta{" "}
        <Link className="font-semibold text-okBlueDark" href="/login">
          Entrar
        </Link>
      </p>
    </div>
  );
}
