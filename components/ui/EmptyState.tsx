type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="ok-card border-dashed p-6 text-center">
      <p className="text-lg font-semibold text-[#4d2e75]">{title}</p>
      <p className="mt-2 text-sm text-[#8269a0]">{description}</p>
    </div>
  );
}


