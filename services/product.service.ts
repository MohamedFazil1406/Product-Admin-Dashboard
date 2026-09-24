import api from "@/libs/axios";
import { Product, ProductPayload, ProductResponse } from "@/types/product";

interface GetProductsParams {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  signal?: AbortSignal;
}

export const getProducts = async ({
  page,
  limit,
  search = "",
  category = "",
  sortBy = "",
  order = "asc",
  signal,
}: GetProductsParams): Promise<ProductResponse> => {
  const skip = (page - 1) * limit;

  let endpoint = "/products";

  if (search.trim()) {
    endpoint = "/products/search";
  } else if (category) {
    endpoint = `/products/category/${category}`;
  }

  const response = await api.get<ProductResponse>(endpoint, {
    params: {
      limit,
      skip,

      ...(search.trim() && {
        q: search.trim(),
      }),

      ...(sortBy && {
        sortBy,
        order,
      }),
    },

    signal,
  });

  return response.data;
};

export const getCategories = async (): Promise<string[]> => {
  const response = await api.get<string[]>("/products/category-list");

  return response.data;
};

export const getProductById = async (
  id: number,
  signal?: AbortSignal,
): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`, {
    signal,
  });

  return response.data;
};

export const addProduct = async (data: ProductPayload): Promise<Product> => {
  const response = await api.post<Product>("/products/add", data);

  return response.data;
};

export const updateProduct = async (
  id: number,
  data: ProductPayload,
): Promise<Product> => {
  const response = await api.put<Product>(`/products/${id}`, data);

  return response.data;
};

export const deleteProduct = async (id: number): Promise<Product> => {
  const response = await api.delete<Product>(`/products/${id}`);

  return response.data;
};
