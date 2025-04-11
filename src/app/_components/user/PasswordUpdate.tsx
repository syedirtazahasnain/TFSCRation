'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PasswordUpdateForm() {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/password-update`, {
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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
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