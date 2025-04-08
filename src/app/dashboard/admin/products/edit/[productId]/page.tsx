
'use client';

import { useRouter, useParams } from 'next/navigation';
import Header from '@/app/_components/Header';
import ProductFormPage from '@/app/_components/ProductFormPage';

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  return (
    <div className="container mx-auto p-4">
      <Header />
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductFormPage productId={productId} />
    </div>
  );
}