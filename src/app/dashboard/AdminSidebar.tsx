'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiUsers, FiPackage, FiSettings } from 'react-icons/fi';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: FiHome },
    { name: 'Users', href: '/dashboard/admin/users', icon: FiUsers },
    { name: 'Products', href: '/dashboard/admin/products', icon: FiPackage },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: FiSettings },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <div className="mb-8 p-4">
        <h1 className="text-xl font-bold">Admin Panel</h1>
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