// app/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Order } from "@/types";
import Header from '@/app/_components/Header';


interface PaginatedOrders {
  data: Order[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get('page') || '1';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(`http://household.test/api/orders?page=${currentPage}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, router]);

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!orders?.data.length) return <div className="container mx-auto p-4">No orders found</div>;

  return (
      <div className="container mx-auto p-4">
        <Header />
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
      <div className="space-y-4 mb-8">
        {orders.data.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">Order #{order.order_number}</h2>
                <p className="text-gray-600">
                  Status: <span className="capitalize">{order.status}</span>
                </p>
                <p className="text-gray-600">
                  Date: {new Date(order.created_at).toLocaleDateString()}
                </p>
                <p className="text-lg font-bold">Total: ${order.grand_total}</p>
              </div>
              <Link href={`/dashboard/user/orders/${order.id}`} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-2">
        {orders.links.map((link, index) => {
          if (link.url === null) return null;
          
          const page = new URL(link.url).searchParams.get('page') || '1';
          const isActive = link.active;
          const isPrevious = link.label.includes('Previous');
          const isNext = link.label.includes('Next');

          return (
            <Link
              key={index}
              href={`/orders?page=${page}`}
              className={`px-4 py-2 rounded-lg border ${
                isActive
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } ${
                (isPrevious || isNext) ? 'font-semibold' : ''
              }`}
            >
              {isPrevious ? '«' : isNext ? '»' : link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}