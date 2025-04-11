"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/app/_components/Header";
import Sidebar from "@/app/_components/sidebar/index";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";

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
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await response.json();
        setOrder(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error)
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!order)
    return <div className="container mx-auto p-4">No order found</div>;

  return (
    <div className="min-h-screen flex gap-[20px] px-[20px] xl:px-[30px]">
      <div className="w-[15%] relative">
        <Sidebar />
      </div>
      <div className="w-full mx-auto space-y-4 p-4">
      <div className="px-6 py-6 bg-[#2b3990] rounded-[20px] xl:rounded-[25px] text-[#fff]">
          <h1 className="text-2xl font-bold my-0">Order Detail</h1>
          <Breadcrumb
            items={[{ label: "Dashboard" }, { label: "Single Order Detail" }]}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-6 py-4">
            <div className="flex gap-[10px] items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Order #{order.order_number}
              </h3>
              <p className="rounded-full bg-green-100 px-3 py-0.5 text-xs capitalize">
                {order.status}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <p className="rounded-full px-3 py-0.5 text-xs capitalize">
                <span className="pr-[10px]">Order Date:</span>
                <span className="text-sm font-semibold">
                  {order.created_at}
                </span>
              </p>
              <p className="rounded-full px-3 py-0.5 text-xs capitalize">
                <span className="pr-[10px]">Grand Total:</span>
                <span className="text-lg text-red-600 font-semibold">
                  {order.grand_total}
                </span>
              </p>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="border-gray-100 border-y dark:border-gray-800">
                  <th className="py-3 px-4">
                    <div className="flex items-center">
                      <p className="font-medium text-[#000]">Products</p>
                    </div>
                  </th>
                  <th className="py-3 px-4">
                    <div className="flex items-center justify-center">
                      <p className="font-medium text-gray-500">Type</p>
                    </div>
                  </th>
                  <th className="py-3 px-4">
                    <div className="flex items-center justify-center">
                      <p className="font-medium text-gray-500">Brand</p>
                    </div>
                  </th>
                  <th className="py-3 px-4">
                    <div className="flex items-center justify-center">
                      <p className="font-medium text-gray-500">Measure</p>
                    </div>
                  </th>
                  <th className="py-3 px-4">
                    <div className="flex items-center justify-center">
                      <p className="font-medium text-gray-500">Quantity</p>
                    </div>
                  </th>
                  <th className="py-3 px-4 bg-[#2b3990]">
                    <div className="flex items-center justify-center col-span-2">
                      <p className="font-medium text-[#fff]">Total Price</p>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {order.items.map((item, itemIndex) => (
                  <tr
                    key={`${order.id}-${item.id}`} // Combine order.id and item.id to create a unique key
                    className={`border-b ${
                      itemIndex % 2 !== 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-[50px] w-[50px] overflow-hidden rounded-full">
                          <img src={item.product.image ? `${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${item.product.image}`: "/images/items/atta.webp"} alt="Product"
                          onError={(e) => {
                            e.currentTarget.src = "/images/items/atta.webp";
                          }}
                           />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 capitalize">
                              {item.product.name}
                            </p>
                            <span className="text-gray-500">
                              {item.unit_price} Rs
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.product.type}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                          {item.product.brand}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.product.measure}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                          {item.quantity}x
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        <p className="rounded-full bg-success-50 px-2 py-0.5 text-theme-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
                          {item.price}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
