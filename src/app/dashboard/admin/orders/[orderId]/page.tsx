'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/app/_components/Header';

interface Order {
  id: number;
  order_number: string;
  status: string;
  grand_total: string;
  created_at: string;
  items: {
    id: number;
    product_id: number;
    quantity: string;
    unit_price: string;
    price: string;
    product: {
      id: number;
      name: string;
      detail: string;
      price: string;
    };
  }[];
}

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(
          `http://127.0.0.1:8000/api/admin/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }

        const data = await response.json();
        setOrder(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!order) return <div className="container mx-auto p-4">No order found</div>;

  return (
    <div className="container mx-auto p-4">
        <Header />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">
          Order #{order.order_number}
        </h1>
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Status:</span>
            <span className="capitalize">{order.status}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Date:</span>
            <span>{new Date(order.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Total:</span>
            <span className="font-bold">${order.grand_total}</span>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="border-b pb-4">
              <h3 className="font-semibold">{item.product.name}</h3>
              <p className="text-gray-600">{item.product.detail}</p>
              <div className="flex justify-between mt-2">
                <span>
                  {item.quantity} × ${item.unit_price}
                </span>
                <span className="font-semibold">${item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}