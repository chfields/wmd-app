/** The app's only backend: wmd-bff. Set EXPO_PUBLIC_BFF_URL to point at staging. */

export const BFF_URL = process.env.EXPO_PUBLIC_BFF_URL ?? "http://localhost:8080";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  available: boolean;
  restockDate?: string | null;
  lowStock?: boolean;
}

export interface OrderLine {
  productId: string;
  name: string;
  quantity: number;
  priceCents: number;
}

export type DeliveryWindow = "morning" | "afternoon" | "evening";

export interface Order {
  id: string;
  userId: string;
  status: "pending" | "confirmed";
  totalCents: number;
  lines: OrderLine[];
  giftMessage: string | null;
  deliveryWindow?: DeliveryWindow;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  orderId: string;
  title: string;
  body: string;
  status: string;
  createdAt: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, ...rest } = init;
  let response: Response;
  try {
    response = await fetch(`${BFF_URL}${path}`, {
      ...rest,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...rest.headers,
      },
    });
  } catch {
    throw new ApiError(0, "offline", "Can't reach WMD Shop. Check your connection.");
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = body?.error ?? {};
    throw new ApiError(response.status, error.code ?? "unknown", error.message ?? "Something went wrong.");
  }
  return body as T;
}

export const api = {
  signIn: (email: string, password: string) =>
    request<{ token: string; user: User }>("/v1/session", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  products: (q?: string) => request<Product[]>(`/v1/catalog/products${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  placeOrder: (token: string, items: { productId: string; quantity: number }[], giftMessage?: string, deliveryWindow: DeliveryWindow = "morning") => {
    const msg = giftMessage?.trim();
    return request<Order>("/v1/orders", {
      method: "POST",
      body: JSON.stringify({ items, ...(msg ? { giftMessage: msg } : {}), deliveryWindow }),
      token,
    });
  },
  order: (token: string, id: string) => request<Order>(`/v1/orders/${encodeURIComponent(id)}`, { token }),
  orders: (token: string) => request<Order[]>("/v1/orders", { token }),
  notifications: (token: string) => request<Notification[]>("/v1/notifications", { token }),
};

export const money = (cents: number): string => `$${(cents / 100).toFixed(2)}`;
