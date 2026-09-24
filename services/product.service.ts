import api from "@/libs/axios";
import { ProductResponse } from "@/types/product";

interface GetProductsParams {
  page: number;
  limit: number;
}

export const getProducts = async ({
  page,
  limit,
}: GetProductsParams): Promise<ProductResponse> => {
  const skip = (page - 1) * limit;

  const response = await api.get<ProductResponse>("/products", {
    params: {
      limit,
      skip,
    },
  });

  return response.data;
};
