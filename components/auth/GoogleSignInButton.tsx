import { googleSignInAction } from "@/app/actions/auth-actions";

type GoogleSignInButtonProps = {
  text?: string;
  enabled?: boolean;
};

export function GoogleSignInButton({ text = "Entrar com Google", enabled = true }: GoogleSignInButtonProps) {
  if (!enabled) {
    return (
      <div className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#efe3fc] bg-[#f8f2ff] px-4 py-3 text-sm font-semibold text-[#8a6cab]">
        Google em configuração
      </div>
    );
  }

  return (
    <form action={googleSignInAction}>
      <button
        type="submit"
        className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-[#e3c6ff] bg-white px-4 py-3 font-semibold text-[#5f2f8f] shadow-[0_14px_24px_-18px_rgba(110,35,167,0.58)] transition hover:-translate-y-0.5 hover:border-[#d3a9ff] hover:bg-[#fdf9ff]"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#e6d4ff] bg-white text-sm font-bold text-[#5f2f8f]">
          G
        </span>
        {text}
      </button>
    </form>
  );
}
