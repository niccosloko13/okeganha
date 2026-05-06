type AdminTableProps = {
  children: React.ReactNode;
};

export function AdminTable({ children }: AdminTableProps) {
  return <div className="ok-card overflow-x-auto">{children}</div>;
}
