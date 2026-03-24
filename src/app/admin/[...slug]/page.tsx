import AdminGuard from "@/components/admin/AdminGuard";
import AdminNotFound from "@/components/admin/AdminNotFound";

export default function AdminCatchAllPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[var(--color-dark)] px-4 py-8 sm:px-6 lg:px-8">
        <AdminNotFound variant="missing" />
      </div>
    </AdminGuard>
  );
}
