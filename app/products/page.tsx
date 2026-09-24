"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { getProducts } from "@/services/product.service";
import { Product } from "@/types/product";

import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageParam = Number(searchParams.get("page"));
  const limitParam = Number(searchParams.get("limit"));

  const search = searchParams.get("search") ?? "";

  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const limit = [10, 20, 50].includes(limitParam) ? limitParam : 10;

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts({
          page,
          limit,
          search,
          signal: controller.signal,
        });

        const totalPages = Math.ceil(data.total / limit);

        if (totalPages > 0 && page > totalPages) {
          router.replace(
            `/products?page=${totalPages}&limit=${limit}${
              search ? `&search=${encodeURIComponent(search)}` : ""
            }`,
          );

          return;
        }

        setProducts(data.products);
        setTotal(data.total);
      } catch (error) {
        if (error instanceof Error && error.name === "CanceledError") {
          return;
        }

        setError("Failed to load products.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      controller.abort();
    };
  }, [page, limit, search, router]);

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(newPage));
    params.set("limit", String(limit));

    router.push(`/products?${params.toString()}`);
  };

  const changeLimit = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", "1");
    params.set("limit", String(newLimit));

    router.push(`/products?${params.toString()}`);
  };

  const changeSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value.trim()) {
        params.set("search", value.trim());
      } else {
        params.delete("search");
      }

      // Search change must reset page
      params.set("page", "1");

      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams],
  );

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
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">Products</h1>

          <div className="flex flex-col gap-3 md:flex-row">
            <SearchInput value={search} onSearch={changeSearch} />

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
        </div>

        {products.length === 0 ? (
          <div className="rounded border p-8 text-center">
            <p className="text-gray-600">No products found.</p>
          </div>
        ) : (
          <>
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
                    <tr key={product.id} className="border-b hover:bg-gray-50">
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
          </>
        )}
      </div>
    </main>
  );
}
