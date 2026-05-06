import { googleSignInAction } from "@/app/actions/auth-actions";

type GoogleSignInButtonProps = {
  text?: string;
  enabled?: boolean;
};

export function GoogleSignInButton({ text = "Continuar com Google", enabled = true }: GoogleSignInButtonProps) {
  if (!enabled) {
    return (
      <div className="flex h-14 w-full items-center justify-center rounded-2xl border border-[#ead9fb] bg-[#f8f2ff] px-5 text-sm font-semibold text-[#8a6cab]">
        Google em configuracao
      </div>
    );
  }

  return (
    <form action={googleSignInAction}>
      <button
        type="submit"
        className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-[#e6d4fb] bg-white px-5 text-[15px] font-semibold text-[#4f2379] shadow-[0_18px_32px_-22px_rgba(92,31,146,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d9b9f8] hover:shadow-[0_22px_36px_-20px_rgba(92,31,146,0.72)]"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#e7d9f8] bg-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.4-.2-2.1H12Z"/>
            <path fill="#34A853" d="M6.6 14.3 6 14.8l-2.1 1.6A10 10 0 0 0 12 22c2.7 0 4.9-.9 6.6-2.5l-3.1-2.4c-.9.6-2 .9-3.5.9-2.6 0-4.8-1.7-5.6-4.1Z"/>
            <path fill="#4A90E2" d="M3.9 7.6A10 10 0 0 0 3 12c0 1.6.4 3.1 1 4.4l2.7-2.1c-.2-.6-.4-1.3-.4-2.1s.1-1.5.4-2.1L4 7.9l-.1-.3Z"/>
            <path fill="#FBBC05" d="M12 6c1.4 0 2.7.5 3.7 1.5l2.8-2.8C16.9 3.2 14.7 2.2 12 2.2A10 10 0 0 0 3.9 7.6l3 2.4C7.7 7.7 9.9 6 12 6Z"/>
          </svg>
        </span>
        <span>{text}</span>
      </button>
    </form>
  );
}
