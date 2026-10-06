import type { DeliveryWindow } from "./api";

const labels: Record<DeliveryWindow, string> = {
  morning: "Morning (8am–12pm)",
  afternoon: "Afternoon (12–5pm)",
  evening: "Evening (5–9pm)",
};

export const deliveryWindowLabel = (window?: DeliveryWindow | null): string => labels[window ?? "morning"];
