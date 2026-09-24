import api from "@/libs/axios";
import { ProductResponse } from "@/types/product";

interface GetProductsParams {
  page: number;
  limit: number;
  search?: string;
  signal?: AbortSignal;
}

export const getProducts = async ({
  page,
  limit,
  search = "",
  signal,
}: GetProductsParams): Promise<ProductResponse> => {
  const skip = (page - 1) * limit;

  const endpoint = search.trim() ? "/products/search" : "/products";

  const response = await api.get<ProductResponse>(endpoint, {
    params: {
      limit,
      skip,
      ...(search.trim() && {
        q: search.trim(),
      }),
    },
    signal,
  });

  return response.data;
};
