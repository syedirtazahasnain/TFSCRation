"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserProfile from ".././user/UserProfile";
import Link from "next/link";
import Image from "next/image";
import {
  Dashboard,
  ShoppingCart,
  AccountCircle,
  Password,
  AddShoppingCart,
  Assessment,
} from "@mui/icons-material";

export default function index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/user-details", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data.data);
          setUserRole(data.data.my_role || data.data.role);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Logout failed");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.refresh();
      router.push("/auth/login");
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err.message || "Failed to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToAdminRoute = (path: string) => {
    if (!userRole) {
      setError("User role not loaded yet");
      return;
    }

    if (userRole === "admin" || userRole === "super_admin") {
      router.push(`/dashboard/admin/${path}`);
    } else {
      setError("You do not have permission to access this page");
    }
  };

  const fetchAllOrders = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/orders/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch orders");
      }

      const data = await response.json();
      router.push(`/dashboard/admin/order`);
    } catch (err: any) {
      console.error("Fetch orders error:", err);
      setError(err.message || "Failed to fetch orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="z-20 hidden w-[15%] overflow-y-auto bg-[#f9f9f9] md:block flex-shrink-0 scrollbar-hide h-screen fixed top-0 left-0">
      <div className="px-4 py-6 text-gray-500">
        <div className="overflow-hidden flex items-center justify-center">
          <Image
            src="/images/logo/logo-dark.webp"
            alt="Company Logo"
            width={200}
            height={50}
            className=""
          />
        </div>
        <div className="w-full h-[1px] bg-[#000] opacity-20 my-4"></div>
        <ul>
          <li className="py-2">
            <p className="text-sm font-semibold text-gray-800 transition-colors">
              <span className="ml-3">Main</span>
            </p>
          </li>
          <li className="relative">
            {userRole === "user" && (
              <>
                <button
                  onClick={() => router.push("/dashboard/user/product-list")}
                  className="inline-flex items-center w-full text-sm text-gray-800 transition-colors duration-150 hover:text-gray-800 px-6"
                >
                  <Dashboard className="w-5 h-5" />
                  <span className="ml-4">Dashboard</span>
                </button>
                <div className="py-2 mt-4">
                  <p className="text-sm text-gray-800 transition-colors font-semibold">
                    <span className="ml-3">Orders & More</span>
                  </p>
                </div>
                <button
                  onClick={() => router.push("/dashboard/user/orders")}
                  className="inline-flex items-center w-full text-sm text-gray-800 transition-colors duration-150 hover:text-gray-800 px-6"
                >
                  <Assessment className="w-5 h-5" />
                  <span className="ml-4">Orders</span>
                </button>
                <button
                  onClick={() => router.push("/dashboard/user/product-list")}
                  className="inline-flex items-center w-full text-sm text-gray-800 transition-colors duration-150 hover:text-gray-800 px-6"
                >
                  <AddShoppingCart className="w-5 h-5" />
                  <span className="ml-4">Order Now</span>
                </button>
              </>
            )}
          </li>
          <li>
            <>
              <div className="py-2 mt-4">
                <p className="text-sm text-gray-800 transition-colors font-semibold">
                  <span className="ml-3">Profile & More</span>
                </p>
              </div>
              <button
                onClick={() => router.push("/dashboard/user/profile")}
                className="inline-flex items-center w-full text-sm text-gray-800 transition-colors duration-150 hover:text-gray-800 px-6"
              >
                <AccountCircle className="w-5 h-5" />
                <span className="ml-4">Profile</span>
              </button>
              <button
                onClick={() => router.push("/dashboard/user/update-password")}
                className="inline-flex items-center w-full text-sm text-gray-800 transition-colors duration-150 hover:text-gray-800 px-6"
              >
                <Password className="w-5 h-5" />
                <span className="ml-4">Change Password</span>
              </button>
            </>
          </li>
        </ul>
      </div>
    </aside>
  );
}
