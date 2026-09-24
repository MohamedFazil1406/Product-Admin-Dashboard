import { Product } from "@/types/product";

const ADDED_KEY = "addedProducts";
const EDITED_KEY = "editedProducts";
const DELETED_KEY = "deletedProductIds";

export function getAddedProducts(): Product[] {
  if (typeof window === "undefined") {
    return [];
  }

  const value = localStorage.getItem(ADDED_KEY);

  return value ? JSON.parse(value) : [];
}

export function saveAddedProduct(product: Product) {
  const products = getAddedProducts();

  localStorage.setItem(ADDED_KEY, JSON.stringify([product, ...products]));
}

export function getEditedProducts(): Record<number, Product> {
  if (typeof window === "undefined") {
    return {};
  }

  const value = localStorage.getItem(EDITED_KEY);

  return value ? JSON.parse(value) : {};
}

export function saveEditedProduct(product: Product) {
  const products = getEditedProducts();

  products[product.id] = product;

  localStorage.setItem(EDITED_KEY, JSON.stringify(products));
}

export function getDeletedProductIds(): number[] {
  if (typeof window === "undefined") {
    return [];
  }

  const value = localStorage.getItem(DELETED_KEY);

  return value ? JSON.parse(value) : [];
}

export function saveDeletedProduct(id: number) {
  const ids = getDeletedProductIds();

  if (!ids.includes(id)) {
    ids.push(id);
  }

  localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
}

export function applyLocalChanges(products: Product[]): Product[] {
  const edited = getEditedProducts();

  const deleted = getDeletedProductIds();

  return products
    .filter((product) => !deleted.includes(product.id))
    .map((product) => edited[product.id] ?? product);
}
