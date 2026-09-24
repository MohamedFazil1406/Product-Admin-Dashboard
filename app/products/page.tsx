"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getProducts } from "@/services/product.service";
import { Product } from "@/types/product";

import Pagination from "@/components/Pagination";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageParam = Number(searchParams.get("page"));
  const limitParam = Number(searchParams.get("limit"));

  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const limit = [10, 20, 50].includes(limitParam) ? limitParam : 10;

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts({
          page,
          limit,
        });

        setProducts(data.products);
        setTotal(data.total);
      } catch {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [page, limit]);

  const totalPages = Math.ceil(total / limit);

  const changePage = (newPage: number) => {
    router.push(`/products?page=${newPage}&limit=${limit}`);
  };

  const changeLimit = (newLimit: number) => {
    router.push(`/products?page=1&limit=${newLimit}`);
  };

  if (loading) {
    return <div className="p-8">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="mb-4 text-red-600">{error}</p>

        <button
          onClick={() => window.location.reload()}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Products</h1>

          <select
            value={limit}
            onChange={(event) => changeLimit(Number(event.target.value))}
            className="rounded border px-3 py-2"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Rating</th>
                <th className="p-3 text-left">Stock</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="p-3">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="h-14 w-14 rounded object-cover"
                    />
                  </td>

                  <td className="p-3 font-medium">{product.title}</td>

                  <td className="p-3">{product.category}</td>

                  <td className="p-3">${product.price}</td>

                  <td className="p-3">{product.rating}</td>

                  <td className="p-3">{product.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={changePage}
        />
      </div>
    </main>
  );
}
