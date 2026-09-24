"use client";

import { useRouter } from "next/navigation";

import ProductForm from "@/components/ProductForm";

import { addProduct } from "@/services/product.service";

import { ProductPayload } from "@/types/product";

import { saveAddedProduct } from "@/libs/product-local-store";

export default function AddProductPage() {
  const router = useRouter();

  const handleAdd = async (values: ProductPayload) => {
    const product = await addProduct(values);

    /*
     * DummyJSON does not persist created products,
     * so save the returned product locally.
     */
    saveAddedProduct(product);

    router.push("/products?page=1&limit=10");
  };

  return (
    <main className="min-h-screen bg-white p-6 text-black">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 rounded border border-gray-300 bg-white px-4 py-2 text-black hover:bg-gray-100"
        >
          ← Back
        </button>

        <h1 className="mb-6 text-2xl font-bold text-black">Add Product</h1>

        <ProductForm buttonText="Add Product" onSubmit={handleAdd} />
      </div>
    </main>
  );
}
