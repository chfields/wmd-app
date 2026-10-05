import type { Product } from "./api";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function stockLabel(product: Product, today?: string): string {
  if (product.available) return `${product.stock} in stock`;
  if (!product.restockDate) return "Out of stock";

  if (today === undefined) {
    const now = new Date();
    today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }
  if (product.restockDate < today) return "Out of stock";

  const [, month, day] = product.restockDate.split("-");
  return `Back on ${months[Number(month) - 1]} ${Number(day)}`;
}
