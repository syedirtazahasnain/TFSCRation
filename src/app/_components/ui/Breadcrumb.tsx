"use client";

import Link from "next/link";
import { ChevronRight } from "@mui/icons-material";

type Crumb = {
  label: string;
  href?: string; // if no href, it’s the last item
};

type BreadcrumbProps = {
  items: Crumb[];
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="text-sm text-gray-600 my-2" aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            {index !== 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}

            {item.href ? (
              <Link
                href={item.href}
                className="hover:underline text-gray-200 capitalize font-semibold"
              >
                {item.label}
              </Link>
            ) : (
              <span className="capitalize text-gray-200 font-semibold">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
