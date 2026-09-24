import api from "@/libs/axios";
import { ProductResponse } from "@/types/product";

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
