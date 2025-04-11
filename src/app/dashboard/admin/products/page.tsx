// app/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/_components/Header';

interface Product {
  id: number;
  name: string;
  detail: string;
  price: string;
  image: string | null;
}

interface PaginatedProducts {
  current_page: number;
  data: Product[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<PaginatedProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get('page') || '1';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/products?page=${currentPage}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, router]);

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!products?.data?.length) return <div className="container mx-auto p-4">No products found</div>;

  return (
    <div className="container mx-auto p-4">
      <Header />
      <h1 className="text-2xl font-bold mb-6">Product List</h1>
      
      {/* <div className="mb-6">
        <Link 
          href="/dashboard/admin/products/new"
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Add New Product
        </Link>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {products.data.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col h-full">
              {product.image && (
                <div className="mb-4 h-48 bg-[#f9f9f9] rounded-lg overflow-hidden">
                  <img 
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${product.image}`} 
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/images/items/atta.webp";
                    }}
                  />
                </div>
              )}
              <div className="flex-grow">
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <p className="text-gray-600 mb-2 line-clamp-2">{product.detail}</p>
                <p className="text-lg font-bold">${product.price}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  href={`/dashboard/admin/products/edit/${product.id}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-2">
        {products.links.map((link, index) => {
          if (link.url === null) return null;
          
          const page = new URL(link.url).searchParams.get('page') || '1';
          const isActive = link.active;
          const label = link.label
            .replace('&laquo; Previous', '«')
            .replace('Next &raquo;', '»');

          return (
            <Link
              key={index}
              href={`/dashboard/admin/products?page=${page}`}
              className={`px-4 py-2 rounded-lg border ${
                isActive
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}