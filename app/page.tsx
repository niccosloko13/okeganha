import Image from "next/image";
import Link from "next/link";

const highlights = [
  "Missoes rapidas todos os dias",
  "Aprovacao transparente",
  "Saldo e saque com controle",
];

const steps = [
  {
    title: "Escolha uma missao",
    description: "Encontre missoes ativas e veja o valor antes de comecar.",
  },
  {
    title: "Execute e envie prova",
    description: "Conclua a acao pedida e envie sua validacao com seguranca.",
  },
  {
    title: "Receba e evolua",
    description: "Ganhe saldo, suba de nivel e mantenha seu ritmo diario.",
  },
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-[#fff9ff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,100,188,0.22),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(122,47,188,0.2),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(194,72,255,0.14),transparent_30%)]" />

      <section className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pb-10 pt-8 md:grid-cols-2 md:items-center md:px-8 md:pt-16">
        <div>
          <Image src="/logo-okeganha.png" alt="OKEGANHA" width={340} height={90} className="h-auto w-[220px] md:w-[300px]" priority />
          <h1 className="mt-8 text-4xl font-extrabold leading-[0.95] tracking-tight text-[#2f114d] md:text-6xl">
            Missoes reais.
            <span className="block bg-gradient-to-r from-[#ff4fb0] to-[#7a2fbc] bg-clip-text text-transparent">Ganhos reais.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-[#6f4e93] md:text-lg">
            Faca tarefas simples, acompanhe sua evolucao e transforme constancia em recompensa.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/cadastro" className="rounded-2xl bg-gradient-to-r from-[#ff4fb0] to-[#7a2fbc] px-7 py-4 text-center text-base font-bold text-white shadow-[0_16px_30px_-14px_rgba(122,47,188,0.65)] transition hover:scale-[1.02]">
              Criar conta gratis
            </Link>
            <Link href="/login" className="rounded-2xl border border-[#dcb8ff] bg-white px-7 py-4 text-center text-base font-semibold text-[#5f2e93] transition hover:bg-[#faf3ff]">
              Ja tenho conta
            </Link>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item} className="rounded-xl border border-[#ead4ff] bg-white/80 px-3 py-2 text-xs font-semibold text-[#6d4f8e] md:text-sm">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-[#ffb7e4] via-[#ddb4ff] to-[#a26df1] opacity-35 blur-3xl" />
          <div className="rounded-[2rem] border border-white/40 bg-white/60 p-3 shadow-[0_24px_40px_-26px_rgba(80,30,130,0.65)] backdrop-blur-xl">
            <Image
              src="/criativo_1.png"
              alt="Preview do app OKEGANHA"
              width={1400}
              height={1200}
              className="h-auto w-full rounded-[1.4rem]"
              priority
            />
          </div>
        </div>
      </section>

      <section className="relative mx-auto mb-14 w-full max-w-7xl px-4 md:px-8">
        <div className="rounded-[2rem] border border-[#e7cdff] bg-white/80 p-6 shadow-[0_20px_36px_-26px_rgba(86,32,136,0.7)] backdrop-blur-xl md:p-8">
          <h2 className="text-center text-2xl font-extrabold text-[#39145c] md:text-3xl">Como funciona</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, idx) => (
              <article key={step.title} className="rounded-2xl border border-[#ecd9ff] bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-[#8c69ad]">Passo {idx + 1}</p>
                <h3 className="mt-2 text-lg font-extrabold text-[#42196a]">{step.title}</h3>
                <p className="mt-2 text-sm text-[#73559a]">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
