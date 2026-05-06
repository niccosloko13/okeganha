type ProgressCardProps = {
  progressPercent: number;
  done: number;
  target: number;
};

export function ProgressCard({ progressPercent, done, target }: ProgressCardProps) {
  const safePercent = Math.max(0, Math.min(100, progressPercent));

  return (
    <section className="ok-card p-5">
      <h2 className="text-lg font-extrabold text-[#3a1658]">Progresso da semana</h2>
      <p className="mt-1 text-sm text-[#7a5a99]">
        Você concluiu {done} de {target} tarefas da meta semanal.
      </p>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#f4e7ff]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#ff63bc] via-[#c248ff] to-[#7a2fbc] transition-all duration-500"
          style={{ width: `${safePercent}%` }}
        />
      </div>
      <p className="mt-3 text-sm font-medium text-[#6a4a8e]">
        {safePercent >= 80 ? "Ritmo excelente, continue assim." : "Mantenha o foco: mais missões aumentam seu saldo."}
      </p>
    </section>
  );
}
