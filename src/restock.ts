import type { Product } from "./api";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function stockLabel(product: Pick<Product, "available" | "stock" | "restockDate">, today: Date): string {
  if (product.available) return `${product.stock} in stock`;
  if (!product.restockDate) return "Out of stock";

  const [year, month, day] = product.restockDate.split("-").map(Number);
  const restock = new Date(year, month - 1, day);
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return restock >= localToday ? `Back on ${months[restock.getMonth()]} ${restock.getDate()}` : "Out of stock";
}
