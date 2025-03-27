'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserProfile from './user/UserProfile';
import Link from 'next/link';

export default function Header() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch('http://household.test/api/user-details', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data.data);
          setUserRole(data.data.my_role || data.data.role);
          console.log('User role:', data.data.my_role || data.data.role);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('http://household.test/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Logout failed');
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.refresh();
      router.push('/auth/login');
      
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToAdminRoute = (path: string) => {
    if (!userRole) {
      setError('User role not loaded yet');
      return;
    }

    if (userRole === 'admin' || userRole === 'super_admin') {
      router.push(`/dashboard/admin/${path}`);
    } else {
      setError('You do not have permission to access this page');
    }
  };
  
  const fetchAllOrders = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
  
      const response = await fetch('http://household.test/api/admin/orders/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch orders');
      }
  
      const data = await response.json();
      console.log('All orders:', data);
      // Here you can handle the orders data - perhaps navigate to a page that displays them
      router.push(`/dashboard/admin/order`);
      
    } catch (err: any) {
      console.error('Fetch orders error:', err);
      setError(err.message || 'Failed to fetch orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center relative">
      <h1 className="text-xl font-bold text-gray-800">Household App</h1>
      
      <div className="flex items-center gap-4">
        {error && (
          <p className="text-red-500 text-sm animate-fade-in">{error}</p>
        )}
        
        <button
          onClick={() => router.push('/dashboard/user/product-list')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          Home
        </button>

        <button
          onClick={() => router.push('/dashboard/user/orders')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-all duration-200"
        >
          Orders
        </button>

        {/* Admin-only buttons - conditionally rendered */}
        {userRole && (userRole === 'admin' || userRole === 'super_admin') && (
          <>
            <button
              onClick={fetchAllOrders}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              All Orders
            </button>
            <button
              onClick={() => navigateToAdminRoute('dashboard')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              Admin Dashboard
            </button>
          </>
        )}
        
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-all duration-200"
        >
          Profile
        </button>
        
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={`
            bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg
            transition-all duration-200 flex items-center gap-2
            ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging Out...
            </>
          ) : (
            'Logout'
          )}
        </button>
      </div>

      {showProfile && userData && (
        <div className="absolute right-4 top-20 z-10 bg-white p-4 rounded shadow-lg">
          <UserProfile userData={userData} />
          <button
            onClick={() => setShowProfile(false)}
            className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 rounded"
          >
            Close
          </button>
        </div>
      )}
    </header>
  );
}