// app/orders/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Order } from "@/types";
import Sidebar from "@/app/_components/sidebar/index";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { Visibility } from "@mui/icons-material";

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
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page") || "1";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders?page=${currentPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, router]);

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error)
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!orders?.data.length)
    return <div className="container mx-auto p-4">No orders found</div>;

  return (
    <div className="min-h-screen flex gap-[20px] px-[20px] xl:px-[30px]">
      <div className="w-[15%] relative">
        <Sidebar />
      </div>
      <div className="w-full mx-auto space-y-4 p-4">
      <div className="px-6 py-6 bg-[#2b3990] rounded-[20px] xl:rounded-[25px] text-[#fff]">
          <h1 className="text-2xl font-bold my-0">All Orders Details</h1>
          <Breadcrumb
            items={[{ label: "Dashboard" }, { label: "User Orders" }]}
          />
        </div>

        <div className="overflow-x-auto mb-8">
          <div className="p-[25px] border-[2px] border-gray-300 rounded-[25px] bg-white">
            <table className="min-w-full bg-white rounded-[15px] overflow-hidden">
              <thead className="bg-[#000]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-100">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-100">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-100">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-100">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.data.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`border-b ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                      {order.status}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.created_at}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      ${order.grand_total}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <Link
                        href={`/dashboard/user/orders/${order.id}`}
                        className="text-blue-300 hover:text-blue-800"
                      >
                        <Visibility className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-end gap-2 mt-6 mr-[20px]">
          {orders.links.map((link, index) => {
            if (link.url === null) return null;

            const page = new URL(link.url).searchParams.get("page") || "1";
            const isActive = link.active;
            const isPrevious = link.label.includes("Previous");
            const isNext = link.label.includes("Next");

            return (
              <Link
                key={index}
                href={`/dashboard/user/orders?page=${page}`}
                className={`m-0 w-[30px] h-[30px] flex items-center justify-center rounded-lg ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } ${isPrevious || isNext ? "font-semibold" : ""}`}
              >
                {isPrevious ? "«" : isNext ? "»" : link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
