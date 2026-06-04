export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="app-shell min-h-dvh">{children}</div>;
}
