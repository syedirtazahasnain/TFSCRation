'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleBasedRedirect from './RoleBasedRedirect';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  loadingComponent?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  loadingComponent = (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      router.push('/auth/login');
    }
  }, [router]);

  if (!isMounted) {
    return loadingComponent;
  }

  return (
    <RoleBasedRedirect 
      allowedRoles={allowedRoles} 
      loadingComponent={loadingComponent}
    >
      {children}
    </RoleBasedRedirect>
  );
}