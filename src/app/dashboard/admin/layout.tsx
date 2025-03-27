import ProtectedRoute from '@/app/_components/auth/ProtectedRoute';
// import AdminSidebar from '@/app/_components/dashboard/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
      <div className="flex min-h-screen">
        {/* <AdminSidebar /> */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}