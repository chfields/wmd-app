export const itemCountLabel = (count?: number): string | null =>
  count === undefined ? null : `${count} ${count === 1 ? "item" : "items"}`;
