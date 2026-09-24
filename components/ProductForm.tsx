"use client";

import { FormEvent, useState } from "react";

import { ProductPayload } from "@/types/product";

interface ProductFormProps {
  initialValues?: ProductPayload;

  onSubmit: (values: ProductPayload) => Promise<void>;

  buttonText: string;
}

export default function ProductForm({
  initialValues,
  onSubmit,
  buttonText,
}: ProductFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");

  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );

  const [category, setCategory] = useState(initialValues?.category ?? "");

  const [price, setPrice] = useState(initialValues?.price?.toString() ?? "");

  const [stock, setStock] = useState(initialValues?.stock?.toString() ?? "");

  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    /*
     * Prevent multiple Save requests.
     */
    if (saving) return;

    setError("");

    if (!title.trim()) {
      setError("Product title is required.");
      return;
    }

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    if (!category.trim()) {
      setError("Category is required.");
      return;
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    const numericStock = Number(stock);

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      setError("Stock must be 0 or greater.");
      return;
    }

    try {
      setSaving(true);

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        price: numericPrice,
        stock: numericStock,
      });
    } catch {
      setError("Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-black">
      {error && (
        <div className="rounded border border-red-300 p-3 text-black">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block font-medium">Title</label>

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-black"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Description</label>

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-black"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Category</label>

        <input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-black"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Price</label>

        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-black"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Stock</label>

        <input
          type="number"
          value={stock}
          onChange={(event) => setStock(event.target.value)}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-black"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded bg-black px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : buttonText}
      </button>
    </form>
  );
}
