'use client';

import ProductFormPage from '@/app/_components/ProductFormPage';
import Header from "@/app/_components/Header";

export default function AddProductPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <h1 className="text-2xl font-bold mb-8 pt-10">Add New Product</h1>
      <ProductFormPage />
    </div>
  );
}