'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface ProductFormProps {
  productId?: string;
}

interface Product {
  id?: number;
  name: string;
  detail: string;
  price: string;
  image?: string | File;
}

export default function ProductFormPage({ productId }: ProductFormProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product>({
    name: '',
    detail: '',
    price: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!!productId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) {
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://household.test/api/admin/products/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch product');
        
        const data = await response.json();
        setProduct(data.data);
        if (data.data.image) {
          setImagePreview(`http://household.test/storage/${data.data.image}`);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load product');
        router.push('/dashboard/admin/products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProduct(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('detail', product.detail);
      formData.append('price', product.price);
      if (product.image instanceof File) {
        formData.append('image', product.image);
      }
      if (productId) {
        formData.append('id', productId);
      }

      const response = await fetch(
        'http://household.test/api/admin/store-products',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Failed to save product');

      const data = await response.json();
      toast.success(data.message);
      router.push('/dashboard/admin/products');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading product...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Name
        </label>
        <input
          type="text"
          name="name"
          value={product.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="detail"
          value={product.detail}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price
        </label>
        <input
          type="number"
          name="price"
          value={product.price}
          onChange={handleChange}
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-3 py-2 border rounded-md"
        />
        {imagePreview && (
          <div className="mt-2">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="h-40 object-contain border rounded"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => router.push('/dashboard/admin/products')}
          className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}