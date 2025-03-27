'use client';

import ProtectedRoute from '@/app/_components/auth/ProtectedRoute';
import { Suspense } from 'react';
import LoadingSpinner from '@/app/_components/ui/LoadingSpinner';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <Suspense fallback={<LoadingSpinner />}>
        <div className="flex min-h-screen">
          <div className="flex-1 p-8">
            {children}
          </div>
        </div>
      </Suspense>
    </ProtectedRoute>
  );
}