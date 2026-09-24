"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

import ProductForm from "@/components/ProductForm";

import { getProductById, updateProduct } from "@/services/product.service";

import { Product, ProductPayload } from "@/types/product";

import {
  getEditedProducts,
  saveEditedProduct,
} from "@/libs/product-local-store";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const id = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadProduct = async () => {
      if (!Number.isInteger(id) || id <= 0) {
        setError("Invalid product.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getProductById(id, controller.signal);

        /*
         * DummyJSON doesn't persist edits,
         * so check our local version.
         */
        const editedProducts = getEditedProducts();

        const finalProduct = editedProducts[id] ?? data;

        setProduct(finalProduct);
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setError("Product not found.");
          return;
        }

        setError("Failed to load product.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      controller.abort();
    };
  }, [id]);

  const handleUpdate = async (values: ProductPayload) => {
    const updated = await updateProduct(id, values);

    /*
     * Preserve fields that may not
     * come back from the update API.
     */
    const mergedProduct: Product = {
      ...product!,
      ...updated,
      ...values,
      id,
    };

    saveEditedProduct(mergedProduct);

    router.push(`/products/${id}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-6 text-black">
        <div className="mx-auto max-w-2xl">Loading product...</div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-white p-6 text-black">
        <div className="mx-auto max-w-2xl">
          <p className="mb-4">{error || "Product not found."}</p>

          <button
            onClick={() => router.push("/products")}
            className="rounded bg-black px-4 py-2 text-white"
          >
            Back to products
          </button>
        </div>
      </main>
    );
  }

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

        <h1 className="mb-6 text-2xl font-bold">Edit Product</h1>

        <ProductForm
          buttonText="Save Changes"
          initialValues={{
            title: product.title,

            description: product.description,

            category: product.category,

            price: product.price,

            stock: product.stock,
          }}
          onSubmit={handleUpdate}
        />
      </div>
    </main>
  );
}
