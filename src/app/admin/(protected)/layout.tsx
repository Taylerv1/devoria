import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminGuard from "@/components/admin/AdminGuard";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[var(--color-dark)]">
        <AdminSidebar />
        <main className="ml-64 min-h-screen px-6 py-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
