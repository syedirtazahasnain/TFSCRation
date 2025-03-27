'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function RoleBasedRedirect({ 
  children, 
  allowedRoles 
}: RoleBasedRedirectProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const verifyAuth = () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/auth/login');
        return;
      }

      try {
        const user = JSON.parse(userData);
        const userRole = user.role || user.my_role;
        
        if (allowedRoles && !allowedRoles.includes(userRole)) {
          const defaultRoute = userRole === 'admin' || userRole === 'superadmin' 
            ? '/dashboard/admin' 
            : '/dashboard/user';
          router.push(defaultRoute);
          return;
        }

        setIsAllowed(true);
      } catch (error) {
        router.push('/auth/login');
      }
    };

    verifyAuth();
  }, [router, allowedRoles]);

  if (!isClient) {
    return null; // Return nothing during SSR
  }

  if (!isAllowed) {
    return null; // Or return a loading spinner here if preferred
  }

  return <>{children}</>;
}