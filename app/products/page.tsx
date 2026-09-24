"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getCategories, getProducts } from "@/services/product.service";

import { Product } from "@/types/product";

import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import ProductFilters from "@/components/ProductFilters";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /*
   * Using a string instead of searchParams directly
   * makes dependencies more stable.
   */
  const queryString = searchParams.toString();

  /*
   * URL values
   */
  const pageParam = Number(searchParams.get("page"));
  const limitParam = Number(searchParams.get("limit"));

  const search = searchParams.get("search") ?? "";

  const category = searchParams.get("category") ?? "";

  const sortBy = searchParams.get("sort") ?? "";

  const order: "asc" | "desc" =
    searchParams.get("order") === "desc" ? "desc" : "asc";

  /*
   * Validate page.
   *
   * ?page=abc
   * ?page=-5
   *
   * becomes page 1.
   */
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  /*
   * Only allow page sizes required
   * by the assignment.
   */
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
   * Load categories once.
   */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();

        setCategories(data);
      } catch {
        console.error("Failed to load categories");
      }
    };

    loadCategories();
  }, []);

  /*
   * Load products.
   *
   * AbortController prevents an older
   * request from overwriting a newer one.
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

        const totalPages = Math.ceil(data.total / limit);

        /*
         * Handle ?page=999
         */
        if (totalPages > 0 && page > totalPages) {
          const params = new URLSearchParams(queryString);

          params.set("page", String(totalPages));

          router.replace(`/products?${params.toString()}`);

          return;
        }

        setProducts(data.products);

        setTotal(data.total);
      } catch (error) {
        /*
         * Ignore intentionally cancelled
         * Axios requests.
         */
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
   * Page size
   */
  const changeLimit = (newLimit: number) => {
    const params = new URLSearchParams(queryString);

    params.set("page", "1");

    params.set("limit", String(newLimit));

    router.push(`/products?${params.toString()}`);
  };

  /*
   * Search
   *
   * Search and category are mutually exclusive
   * because DummyJSON cannot combine them.
   */
  const changeSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(queryString);

      const trimmedValue = value.trim();

      if (trimmedValue) {
        params.set("search", trimmedValue);

        /*
         * Search selected:
         * remove category.
         */
        params.delete("category");
      } else {
        params.delete("search");
      }

      /*
       * Search changes always return
       * to page 1.
       */
      params.set("page", "1");

      params.set("limit", String(limit));

      const newQuery = params.toString();

      /*
       * Prevent unnecessary navigation.
       */
      if (newQuery !== queryString) {
        router.push(`/products?${newQuery}`);
      }
    },
    [router, queryString, limit],
  );

  /*
   * Category
   */
  const changeCategory = (value: string) => {
    const params = new URLSearchParams(queryString);

    if (value) {
      params.set("category", value);

      /*
       * Category selected:
       * remove search.
       */
      params.delete("search");
    } else {
      params.delete("category");
    }

    params.set("page", "1");

    router.push(`/products?${params.toString()}`);
  };

  /*
   * Sort field
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
            <h1 className="text-2xl font-bold text-black">Products</h1>

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

            <div className="overflow-x-auto rounded border border-gray-200">
              <table className="w-full border-collapse bg-white text-black">
                <thead className="bg-gray-100">
                  <tr className="border-b border-gray-200">
                    <th className="p-3 text-left text-black">Image</th>

                    <th className="p-3 text-left text-black">Title</th>

                    <th className="p-3 text-left text-black">Category</th>

                    <th className="p-3 text-left text-black">Price</th>

                    <th className="p-3 text-left text-black">Rating</th>

                    <th className="p-3 text-left text-black">Stock</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="p-3">
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="h-14 w-14 rounded object-cover"
                        />
                      </td>

                      <td className="p-3 font-medium text-black">
                        {product.title}
                      </td>

                      <td className="p-3 text-black">{product.category}</td>

                      <td className="p-3 text-black">${product.price}</td>

                      <td className="p-3 text-black">{product.rating}</td>

                      <td className="p-3 text-black">{product.stock}</td>
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
