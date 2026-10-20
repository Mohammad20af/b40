export const DEFAULT_STOCK = 5;
export const LOW_STOCK_THRESHOLD = 2;
export const isLowStock = (quantity) =>
  quantity > 0 && quantity <= LOW_STOCK_THRESHOLD;

export function sizeStock(product, size) {
  if (!product?.sizes.includes(size)) return 0;
  const stock =
    product.stockBySize && Object.hasOwn(product.stockBySize, size)
      ? product.stockBySize[size]
      : undefined;
  if (stock === undefined) return product.available ? DEFAULT_STOCK : 0;
  return Number.isSafeInteger(stock) && stock >= 0 ? stock : 0;
}

export function withInventory(product) {
  return {
    ...product,
    stockBySize: Object.fromEntries(
      product.sizes.map((size) => [size, sizeStock(product, size)]),
    ),
  };
}

export const totalStock = (product) =>
  product.sizes.reduce((total, size) => total + sizeStock(product, size), 0);

export const canPurchase = (product) =>
  product.available && totalStock(product) > 0;

export function stockStatus(quantity) {
  return quantity === 0
    ? { label: "نفد", className: "status-cancelled" }
    : isLowStock(quantity)
      ? { label: "مخزون منخفض", className: "status-preparing" }
      : { label: "متوفر", className: "status-ready" };
}

// Inventory is shared by every color of a size; cart lines still retain colors.
export function remainingStock(product, size, entries, exceptKey) {
  const used = entries.reduce(
    (sum, entry) =>
      sum +
      (entry.id === product.id &&
      entry.size === size &&
      (exceptKey === undefined || entry.key !== exceptKey)
        ? entry.quantity
        : 0),
    0,
  );
  return Math.max(0, sizeStock(product, size) - used);
}
