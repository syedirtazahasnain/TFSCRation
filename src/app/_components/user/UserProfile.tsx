'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  id: number;
  name: string;
  email: string;
  my_role: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

function PasswordUpdateForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('http://household.test/api/password-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: [data.message || 'Failed to update password'] });
        }
        return;
      }

      // Success case
      setSuccessMessage(data.message);
      localStorage.setItem('token', data.data.token);
      setFormData({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
      
      // Optionally redirect or refresh user data
      router.refresh();

    } catch (error) {
      setErrors({ general: ['Network error. Please try again.'] });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Update Password</h2>
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.general[0]}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="current_password" className="block text-sm font-medium mb-2">
            Current Password
          </label>
          <input
            type="password"
            id="current_password"
            name="current_password"
            value={formData.current_password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg ${
              errors.current_password ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.current_password && (
            <div className="text-red-500 text-sm mt-1">
              {errors.current_password.map((msg, i) => (
                <p key={i}>{msg}</p>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="new_password" className="block text-sm font-medium mb-2">
            New Password
          </label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg ${
              errors.new_password ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.new_password && (
            <div className="text-red-500 text-sm mt-1">
              {errors.new_password.map((msg, i) => (
                <p key={i}>{msg}</p>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="new_password_confirmation" className="block text-sm font-medium mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            id="new_password_confirmation"
            name="new_password_confirmation"
            value={formData.new_password_confirmation}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg ${
              errors.new_password ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

// export default function UserProfile() {
  export default function UserProfile({ my_role }: UserData) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch('http://household.test/api/user-details', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to fetch user details');
        }

        const data = await response.json();
        setUser(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!user) {
    return <div className="text-gray-500">No user data available</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Role:</span>
            <span className="font-medium capitalize">{user.my_role}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Member since:</span>
            <span className="font-medium">
              {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last updated:</span>
            <span className="font-medium">
              {new Date(user.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <PasswordUpdateForm />
    </div>
  );
}