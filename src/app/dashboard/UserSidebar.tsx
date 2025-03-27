'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiShoppingBag, FiUser, FiSettings } from 'react-icons/fi';

export default function UserSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard/user', icon: FiHome },
    { name: 'Orders', href: '/dashboard/user/orders', icon: FiShoppingBag },
    { name: 'Profile', href: '/dashboard/user/profile', icon: FiUser },
    { name: 'Settings', href: '/dashboard/user/settings', icon: FiSettings },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <div className="mb-8 p-4">
        <h1 className="text-xl font-bold">My Account</h1>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center p-3 rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-blue-700 text-white'
                : 'hover:bg-gray-700 text-gray-300'
            }`}
          >
            <item.icon className="mr-3" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}