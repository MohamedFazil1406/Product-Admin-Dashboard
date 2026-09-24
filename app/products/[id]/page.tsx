"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

import { deleteProduct, getProductById } from "@/services/product.service";

import {
  getDeletedProductIds,
  getEditedProducts,
  saveDeletedProduct,
} from "@/libs/product-local-store";

import { Product } from "@/types/product";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [notFound, setNotFound] = useState(false);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadProduct = async () => {
      /*
       * Validate product ID.
       *
       * /products/abc
       * /products/-1
       */
      if (!Number.isInteger(id) || id <= 0) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setNotFound(false);
        setProduct(null);

        /*
         * DummyJSON does not persist deletes.
         *
         * If we deleted this product earlier,
         * treat it as not found.
         */
        const deletedProductIds = getDeletedProductIds();

        if (deletedProductIds.includes(id)) {
          setNotFound(true);
          return;
        }

        /*
         * Fetch original product.
         */
        const apiProduct = await getProductById(id, controller.signal);

        /*
         * DummyJSON does not persist edits.
         *
         * If a locally edited version exists,
         * prefer it over the API response.
         */
        const editedProducts = getEditedProducts();

        const finalProduct = editedProducts[id] ?? apiProduct;

        setProduct(finalProduct);
      } catch (error) {
        /*
         * Request intentionally cancelled.
         */
        if (axios.isCancel(error)) {
          return;
        }

        /*
         * Product doesn't exist.
         */
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setNotFound(true);
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

  /*
   * Delete product.
   */
  const handleDelete = async () => {
    if (!product || deleting) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      await deleteProduct(product.id);

      /*
       * DummyJSON does not actually
       * persist deletion.
       */
      saveDeletedProduct(product.id);

      router.push("/products?page=1&limit=10");
    } catch {
      alert("Failed to delete product.");
    } finally {
      setDeleting(false);
    }
  };

  /*
   * Loading
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-white p-6 text-black">
        <div className="mx-auto max-w-6xl rounded border border-gray-200 p-8 text-center">
          Loading product...
        </div>
      </main>
    );
  }

  /*
   * Not found
   */
  if (notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white p-6 text-black">
        <div className="text-center">
          <h1 className="mb-2 text-4xl font-bold">404</h1>

          <h2 className="mb-3 text-xl font-semibold">Product not found</h2>

          <p className="mb-6 text-black">
            The product you are looking for does not exist.
          </p>

          <button
            onClick={() => router.push("/products")}
            className="rounded bg-black px-5 py-2 text-white"
          >
            Back to products
          </button>
        </div>
      </main>
    );
  }

  /*
   * Error
   */
  if (error) {
    return (
      <main className="min-h-screen bg-white p-6 text-black">
        <div className="mx-auto max-w-6xl rounded border border-gray-200 p-8 text-center">
          <p className="mb-4 text-black">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="rounded bg-black px-4 py-2 text-white"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white p-6 text-black">
      <div className="mx-auto max-w-6xl">
        {/* Top actions */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-black hover:bg-gray-100"
          >
            ← Back
          </button>

          <div className="flex gap-3">
            {/* Edit */}

            <button
              type="button"
              onClick={() => router.push(`/products/${product.id}/edit`)}
              className="rounded bg-black px-5 py-2 text-white"
            >
              Edit Product
            </button>

            {/* Delete */}

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded border border-red-500 bg-white px-5 py-2 text-black hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Product"}
            </button>
          </div>
        </div>

        {/* Product */}

        <div className="grid gap-10 md:grid-cols-2">
          {/* Images */}

          <div>
            <div className="mb-4 rounded border border-gray-200 p-4">
              <img
                src={product.images?.[0] ?? product.thumbnail}
                alt={product.title}
                className="mx-auto h-96 w-full object-contain"
              />
            </div>

            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {product.images.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="rounded border border-gray-200 p-2"
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="h-24 w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}

          <div>
            <p className="mb-2 text-sm font-medium uppercase text-black">
              {product.category}
            </p>

            <h1 className="mb-4 text-3xl font-bold text-black">
              {product.title}
            </h1>

            <p className="mb-6 leading-7 text-black">{product.description}</p>

            <div className="mb-6 space-y-3">
              {/* Price */}

              <div className="flex justify-between border-b border-gray-200 py-3">
                <span className="font-medium text-black">Price</span>

                <span className="font-bold text-black">${product.price}</span>
              </div>

              {/* Rating */}

              <div className="flex justify-between border-b border-gray-200 py-3">
                <span className="font-medium text-black">Rating</span>

                <span className="text-black">⭐ {product.rating}</span>
              </div>

              {/* Stock */}

              <div className="flex justify-between border-b border-gray-200 py-3">
                <span className="font-medium text-black">Stock</span>

                <span className="text-black">{product.stock}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}

        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-black">Reviews</h2>

          {!product.reviews || product.reviews.length === 0 ? (
            <div className="rounded border border-gray-200 p-6">
              <p className="text-black">No reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {product.reviews.map((review, index) => (
                <div
                  key={`${review.reviewerEmail}-${index}`}
                  className="rounded border border-gray-200 p-5"
                >
                  <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row">
                    <p className="font-semibold text-black">
                      {review.reviewerName}
                    </p>

                    <p className="text-black">
                      ⭐ {review.rating}
                      /5
                    </p>
                  </div>

                  <p className="mb-2 text-black">{review.comment}</p>

                  <p className="text-sm text-black">
                    {new Date(review.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
