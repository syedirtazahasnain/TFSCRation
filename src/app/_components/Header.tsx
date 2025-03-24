'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // If no token exists, redirect to login
      if (!token) {
        router.push('/login');
        return;
      }

      // Call logout API
      const response = await fetch('http://household.test/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Handle API response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Logout failed');
      }

      // Clear token and redirect on success
      localStorage.removeItem('token');
      router.refresh(); // Clear any cached data
      router.push('/login');
      
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">Household App</h1>
      
      <div className="flex items-center gap-4">
        {error && (
          <p className="text-red-500 text-sm animate-fade-in">{error}</p>
        )}
        
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
              <svg 
                className="animate-spin h-4 w-4 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
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
    </header>
  );
}