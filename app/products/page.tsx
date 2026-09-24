"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getCategories, getProducts } from "@/services/product.service";

import { Product } from "@/types/product";

import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import ProductFilters from "@/components/ProductFilters";

import {
  applyLocalChanges,
  getAddedProducts,
} from "@/libs/product-local-store";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryString = searchParams.toString();

  const pageParam = Number(searchParams.get("page"));
  const limitParam = Number(searchParams.get("limit"));

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const sortBy = searchParams.get("sort") ?? "";

  const order: "asc" | "desc" =
    searchParams.get("order") === "desc" ? "desc" : "asc";

  /*
   * Validate URL values
   */
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const limit = [10, 20, 50].includes(limitParam) ? limitParam : 10;

  /*
   * State
   */
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Load categories once
   */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();

        setCategories(data);
      } catch {
        console.error("Failed to load categories.");
      }
    };

    loadCategories();
  }, []);

  /*
   * Load products
   */
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
          category,
          sortBy,
          order,
          signal: controller.signal,
        });

        /*
         * First apply locally edited/deleted
         * products to API results.
         */
        let finalProducts = applyLocalChanges(data.products);

        /*
         * DummyJSON doesn't persist newly
         * created products.
         *
         * Show locally added products at the
         * beginning of page 1 when viewing the
         * normal product list.
         */
        let addedProducts: Product[] = [];

        if (page === 1 && !search && !category) {
          addedProducts = getAddedProducts();

          /*
           * Apply edits/deletes to locally
           * added products too.
           */
          addedProducts = applyLocalChanges(addedProducts);

          finalProducts = [...addedProducts, ...finalProducts];
        }

        /*
         * Optional local sorting.
         *
         * API results are already sorted,
         * but local products also need
         * sorting when they are included.
         */
        if (sortBy) {
          finalProducts = [...finalProducts].sort((a, b) => {
            let result = 0;

            if (sortBy === "price") {
              result = a.price - b.price;
            }

            if (sortBy === "rating") {
              result = a.rating - b.rating;
            }

            if (sortBy === "title") {
              result = a.title.localeCompare(b.title);
            }

            return order === "desc" ? -result : result;
          });
        }

        /*
         * Calculate total.
         *
         * Locally added products should count
         * in the normal unfiltered view.
         */
        const localAddedCount =
          !search && !category ? getAddedProducts().length : 0;

        const adjustedTotal = data.total + localAddedCount;

        const totalPages = Math.ceil(adjustedTotal / limit);

        /*
         * Handle ?page=999
         */
        if (totalPages > 0 && page > totalPages) {
          const params = new URLSearchParams(queryString);

          params.set("page", String(totalPages));

          router.replace(`/products?${params.toString()}`);

          return;
        }

        setProducts(finalProducts);
        setTotal(adjustedTotal);
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
  }, [page, limit, search, category, sortBy, order, router, queryString]);

  /*
   * Pagination
   */
  const changePage = (newPage: number) => {
    const params = new URLSearchParams(queryString);

    params.set("page", String(newPage));

    params.set("limit", String(limit));

    router.push(`/products?${params.toString()}`);
  };

  /*
   * Change page size
   */
  const changeLimit = (newLimit: number) => {
    const params = new URLSearchParams(queryString);

    params.set("page", "1");

    params.set("limit", String(newLimit));

    router.push(`/products?${params.toString()}`);
  };

  /*
   * Search
   */
  const changeSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(queryString);

      const trimmedValue = value.trim();

      if (trimmedValue) {
        params.set("search", trimmedValue);

        /*
         * DummyJSON can't combine
         * search + category.
         */
        params.delete("category");
      } else {
        params.delete("search");
      }

      params.set("page", "1");

      params.set("limit", String(limit));

      const newQuery = params.toString();

      if (newQuery !== queryString) {
        router.push(`/products?${newQuery}`);
      }
    },
    [router, queryString, limit],
  );

  /*
   * Category filter
   */
  const changeCategory = (value: string) => {
    const params = new URLSearchParams(queryString);

    if (value) {
      params.set("category", value);

      params.delete("search");
    } else {
      params.delete("category");
    }

    params.set("page", "1");

    router.push(`/products?${params.toString()}`);
  };

  /*
   * Sort
   */
  const changeSort = (value: string) => {
    const params = new URLSearchParams(queryString);

    if (value) {
      params.set("sort", value);

      params.set("order", order);
    } else {
      params.delete("sort");

      params.delete("order");
    }

    params.set("page", "1");

    router.push(`/products?${params.toString()}`);
  };

  /*
   * Sort direction
   */
  const changeOrder = (value: "asc" | "desc") => {
    const params = new URLSearchParams(queryString);

    params.set("order", value);

    params.set("page", "1");

    router.push(`/products?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-white p-6 text-black">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-black">Products</h1>

              <button
                type="button"
                onClick={() => router.push("/products/add")}
                className="rounded bg-black px-4 py-2 text-white"
              >
                + Add Product
              </button>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <SearchInput value={search} onSearch={changeSearch} />

              <select
                value={limit}
                onChange={(event) => changeLimit(Number(event.target.value))}
                className="rounded border border-gray-300 bg-white px-3 py-2 text-black"
              >
                <option value={10}>10 per page</option>

                <option value={20}>20 per page</option>

                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>

          {/* Filters */}

          <ProductFilters
            categories={categories}
            category={category}
            sortBy={sortBy}
            order={order}
            onCategoryChange={changeCategory}
            onSortChange={changeSort}
            onOrderChange={changeOrder}
          />
        </div>

        {/* Loading */}

        {loading ? (
          <div className="rounded border border-gray-200 p-8 text-center text-black">
            Loading products...
          </div>
        ) : error ? (
          /* Error */

          <div className="rounded border border-gray-200 p-8 text-center">
            <p className="mb-4 text-black">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded bg-black px-4 py-2 text-white"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          /* Empty */

          <div className="rounded border border-gray-200 p-8 text-center">
            <p className="text-black">
              {search
                ? `No products found for "${search}".`
                : category
                  ? `No products found in "${category}".`
                  : "No products found."}
            </p>
          </div>
        ) : (
          <>
            {/* Product table */}

            <div className="hidden overflow-x-auto rounded border border-gray-200 md:block">
              <table className="w-full border-collapse bg-white text-black">
                <thead className="bg-gray-100">
                  <tr className="border-b border-gray-200">
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
                    <tr
                      key={product.id}
                      onClick={() => router.push(`/products/${product.id}`)}
                      className="cursor-pointer border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="p-3">
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="h-14 w-14 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded bg-gray-100 text-xs text-black">
                            No image
                          </div>
                        )}
                      </td>

                      <td className="p-3 font-medium text-black">
                        {product.title}
                      </td>

                      <td className="p-3 text-black">{product.category}</td>

                      <td className="p-3 text-black">${product.price}</td>

                      <td className="p-3 text-black">
                        {product.rating ?? "-"}
                      </td>

                      <td className="p-3 text-black">{product.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}

            <div className="grid gap-4 md:hidden">
              {products.map((product) => (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="rounded border border-gray-200 bg-white p-4 text-left text-black"
                >
                  <div className="flex gap-4">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="h-20 w-20 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded bg-gray-100 text-xs">
                        No image
                      </div>
                    )}

                    <div>
                      <h2 className="font-semibold">{product.title}</h2>

                      <p className="text-sm">{product.category}</p>

                      <p className="mt-2 font-medium">${product.price}</p>

                      <p className="text-sm">Rating: {product.rating ?? "-"}</p>

                      <p className="text-sm">Stock: {product.stock}</p>
                    </div>
                  </div>
                </button>
              ))}
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
