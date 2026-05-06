import Image from "next/image";
import Link from "next/link";

const socialProof = [
  "Pagamentos reais",
  "Tarefas simples",
  "Acompanhe pelo app",
];

const howItWorksSteps = [
  {
    title: "Escolha uma campanha", description: "Encontre tarefas simples perto de você ou online.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-[#7a2fbc]" aria-hidden="true">
        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="m8 12 2.2 2.2L16 8.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: "Realize a ação", description: "Assista vídeos, avalie locais ou interaja com conteúdos.", icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-[#7a2fbc]" aria-hidden="true">
        <path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8.7v6.6m0 0 2.8-2.8M12 15.3l-2.8-2.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: "Receba na sua carteira", description: "Acompanhe seus ganhos e solicite saque semanal.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-[#7a2fbc]" aria-hidden="true">
        <path d="M3.8 8.2A2.2 2.2 0 0 1 6 6h11.5a2.2 2.2 0 0 1 2.2 2.2v7.6a2.2 2.2 0 0 1-2.2 2.2H6a2.2 2.2 0 0 1-2.2-2.2V8.2Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M15.6 12h4.1" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <circle cx="9.2" cy="12" r="2.3" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <section className="ok-fade-in relative overflow-hidden rounded-[2.6rem] border border-[#ebd2ff] bg-gradient-to-br from-white via-[#fff8fe] to-[#f2e4ff]/95 px-5 py-14 shadow-[0_28px_55px_-34px_rgba(128,43,186,0.58)] md:px-10 md:py-20 xl:px-14">
        <span className="ok-blob h-80 w-80 bg-[#ff9fd8]/58" style={{ top: "-22%", left: "-12%" }} />
        <span className="ok-blob h-96 w-96 bg-[#bb72ff]/48" style={{ top: "0%", right: "-14%", animationDelay: "0.8s" }} />
        <span className="ok-blob h-72 w-72 bg-[#ff83cb]/44" style={{ bottom: "-26%", right: "18%", animationDelay: "1.6s" }} />

        <div className="relative grid items-center gap-8 md:grid-cols-[0.88fr_1.12fr] md:gap-6 xl:grid-cols-[0.84fr_1.16fr]">
          <div className="ok-fade-up text-center md:max-w-[560px] md:text-left">
            <div className="mb-8 md:mb-11">
              <Image
                src="/logo-okeganha.png"
                alt="OKEGANHA"
                width={480}
                height={124}
                priority
                className="mx-auto h-auto w-[220px] object-contain md:mx-0 md:w-[340px]"
              />
            </div>

            <h1 className="text-balance text-4xl font-extrabold leading-[0.96] tracking-tight text-[#351456] sm:text-5xl md:text-6xl xl:text-7xl">
              <span className="block">Ganhe</span>
              <span className="block bg-gradient-to-r from-[#ff4fb0] via-[#cf47ff] to-[#7a2fbc] bg-clip-text text-transparent">
                dinheiro real
              </span>
              <span className="block">com ações simples</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#725391] sm:text-lg md:mx-0">
              Participe de campanhas, complete tarefas pelo celular e acompanhe seus ganhos em tempo real — tudo em uma experiência simples, segura e transparente.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
              <Link
                href="/cadastro"
                className="ok-btn-primary px-8 py-4 text-base font-semibold shadow-[0_20px_35px_-18px_rgba(174,52,230,0.95)] transition hover:scale-[1.03]"
              >
                Criar conta grátis
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-[#dcb8ff] bg-white/88 px-8 py-4 text-base font-semibold text-[#6a34a2] shadow-sm transition hover:scale-[1.02] hover:bg-white"
              >
                Fazer login
              </Link>
              <Link
                href="#como-funciona"
                className="rounded-2xl border border-[#d7b4ff] bg-white/72 px-8 py-4 text-base font-semibold text-[#6b35a4] shadow-sm transition hover:scale-[1.02] hover:bg-white"
              >
                Ver como funciona
              </Link>
            </div>

            <div className="mt-7 grid gap-2 sm:grid-cols-3">
              {socialProof.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#edd8ff] bg-white/70 px-3 py-2 text-sm font-semibold text-[#734b9d] backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="ok-fade-up ok-fade-delay-1 relative flex items-center justify-center md:justify-end">
            <span className="absolute h-[82%] w-[84%] rounded-full bg-gradient-to-br from-[#ff7fca]/40 via-[#c94eff]/30 to-[#8542db]/30 blur-[72px]" />
            <span className="absolute h-[58%] w-[62%] rounded-full bg-[#ffffff]/35 blur-[62px]" />
            <div className="relative -mx-3 w-[calc(100%+1.5rem)] max-w-[640px] md:mx-0 md:max-w-[820px] xl:max-w-[920px]">
              <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl border border-white/35 bg-gradient-to-br from-white/24 via-[#f6e9ff]/14 to-[#f0dcff]/18 backdrop-blur-md" />
              <Image
                src="/criativo_1.png"
                alt="Tela do aplicativo OKEGANHA"
                width={1800}
                height={1500}
                priority
                sizes="(max-width: 768px) 98vw, (max-width: 1280px) 64vw, 920px"
                className="h-auto w-full rotate-[2.5deg] rounded-[18px] object-contain shadow-[0_22px_44px_-28px_rgba(96,38,148,0.48)] transition duration-300 hover:scale-[1.015] animate-[okHeroFloat_5.4s_ease-in-out_infinite]"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="ok-fade-in relative mt-8 overflow-hidden rounded-[2rem] border border-[#e7ccff] bg-gradient-to-br from-white/92 via-[#fff7ff] to-[#f4e8ff]/90 px-5 py-9 shadow-[0_20px_44px_-28px_rgba(123,46,183,0.55)] md:px-8 md:py-12"
      >
        <span className="ok-blob h-64 w-64 bg-[#ff97d2]/36" style={{ top: "-30%", right: "-8%" }} />
        <span className="ok-blob h-56 w-56 bg-[#b56dff]/30" style={{ bottom: "-35%", left: "-10%" }} />

        <div className="relative">
          <div className="mx-auto max-w-2xl text-center">
            <p className="ok-badge">Como funciona</p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#3e1564] md:text-4xl">
              Três passos para começar a ganhar com o OKEGANHA
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3">
            {howItWorksSteps.map((step, index) => (
              <article
                key={step.title}
                className={`ok-fade-up rounded-2xl border border-[#ead5ff] bg-white/85 p-5 shadow-[0_16px_26px_-20px_rgba(112,42,170,0.6)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_28px_-18px_rgba(112,42,170,0.68)] ${
                  index === 1 ? "ok-fade-delay-1" : index === 2 ? "ok-fade-delay-2" : ""
                }`}
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5ccff] bg-gradient-to-br from-[#ffe1f2] to-[#efe1ff]">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#4a2174]">{`${index + 1}. ${step.title}`}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#765895] md:text-base">{step.description}</p>
              </article>
            ))}
          </div>

          <div className="ok-fade-up ok-fade-delay-3 mt-8 rounded-2xl border border-[#ebd6ff] bg-white/80 p-5 text-center md:mt-10">
            <p className="text-base font-semibold text-[#5b2d85] md:text-lg">Comece agora e ganhe seu primeiro valor hoje</p>
            <Link href="/cadastro" className="ok-btn-primary ok-pulse mt-4 inline-flex px-8 py-3 text-sm md:text-base">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

