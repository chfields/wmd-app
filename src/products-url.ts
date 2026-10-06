import type { ProductSort } from "./api";

export function productsUrl(q?: string, sort?: ProductSort): string {
  const params: string[] = [];
  if (q) params.push(`q=${encodeURIComponent(q)}`);
  if (sort && sort !== "featured") params.push(`sort=${encodeURIComponent(sort)}`);
  return `/v1/catalog/products${params.length ? `?${params.join("&")}` : ""}`;
}
