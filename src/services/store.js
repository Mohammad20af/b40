import { products } from "../data/products";
import { deliveryZones } from "../data/branches";
import { demoOrders, orderStatuses } from "../data/orders";
import { withInventory } from "../utils/inventory.js";
import { sanitizeCart } from "../utils/shop.js";

export const storageKeys = {
  products: "b40-products-v1",
  orders: "b40-orders-v1",
};
const changeEvent = "b40:store-change";
export function storageSnapshot(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function subscribeStore(notify) {
  const onStorage = (event) => {
    if (!event.key || Object.values(storageKeys).includes(event.key)) notify();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(changeEvent, notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changeEvent, notify);
  };
}
function read(key, fallback, valid) {
  try {
    const value = JSON.parse(storageSnapshot(key));
    return Array.isArray(value) && value.every(valid) ? value : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  // Persist before notifying consumers; failed writes never report success.
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(changeEvent));
}
const validProduct = (p) =>
  p &&
  typeof p.id === "string" &&
  typeof p.name === "string" &&
  Number.isFinite(p.price) &&
  p.price >= 0 &&
  typeof p.category === "string" &&
  typeof p.available === "boolean" &&
  Array.isArray(p.images) &&
  p.images.length > 0 &&
  p.images.every((i) => typeof i === "string") &&
  Array.isArray(p.sizes) &&
  p.sizes.length > 0 &&
  p.sizes.every((s) => typeof s === "string") &&
  Array.isArray(p.colors) &&
  p.colors.length > 0 &&
  p.colors.every(
    (c) => c && typeof c.name === "string" && typeof c.hex === "string",
  );
const validOrder = (o) =>
  o &&
  typeof o.id === "string" &&
  orderStatuses.some((s) => s.id === o.status) &&
  o.customer &&
  typeof o.customer.name === "string" &&
  typeof o.customer.phone === "string" &&
  o.branch &&
  typeof o.branch.name === "string" &&
  o.zone &&
  typeof o.zone.name === "string" &&
  Number.isFinite(o.subtotal) &&
  Number.isFinite(o.delivery) &&
  Number.isFinite(Date.parse(o.createdAt)) &&
  Array.isArray(o.items) &&
  o.items.every(
    (i) =>
      i &&
      i.product &&
      typeof i.product.name === "string" &&
      Number.isFinite(i.quantity) &&
      Number.isFinite(i.product.price),
  );

// Demo persistence adapters. Replace these methods with backend API calls later.
export const catalogService = {
  list: () =>
    read(storageKeys.products, products, validProduct).map(withInventory),
  get: (id) => catalogService.list().find((p) => p.id === id),
  save(product) {
    let record = { ...product, id: product.id || crypto.randomUUID() };
    if (!validProduct(record)) throw new Error("Invalid product");
    const current = catalogService.list();
    const previous = current.find((p) => p.id === record.id);
    record = withInventory({
      ...record,
      stockBySize: previous?.stockBySize ?? record.stockBySize,
    });
    write(
      storageKeys.products,
      current.some((p) => p.id === record.id)
        ? current.map((p) => (p.id === record.id ? record : p))
        : [record, ...current],
    );
    return record;
  },
  setStock(id, size, quantity) {
    if (!Number.isSafeInteger(quantity) || quantity < 0)
      throw new Error("Invalid stock quantity");
    const current = catalogService.list();
    const product = current.find((p) => p.id === id);
    if (!product?.sizes.includes(size)) throw new Error("Invalid product size");
    write(
      storageKeys.products,
      current.map((p) =>
        p.id === id
          ? { ...p, stockBySize: { ...p.stockBySize, [size]: quantity } }
          : p,
      ),
    );
  },
  remove(id) {
    write(
      storageKeys.products,
      catalogService.list().filter((p) => p.id !== id),
    );
  },
};
export const deliveryService = {
  zones: () => deliveryZones,
  quote: (zoneId) => deliveryZones.find((z) => z.id === zoneId)?.price ?? 0,
};
export const orderService = {
  list: () => read(storageKeys.orders, demoOrders, validOrder),
  create: async (order) => {
    const save = () => {
      const checked = sanitizeCart(order.items, catalogService.list());
      if (
        !checked.length ||
        checked.length !== order.items.length ||
        checked.some(
          (item, index) => item.quantity !== order.items[index].quantity,
        )
      ) {
        const error = new Error(
          "تغيّر المخزون. راجع كميات الحقيبة ثم حاول مجدداً.",
        );
        error.code = "STOCK_CHANGED";
        throw error;
      }
      const current = orderService.list();
      const lastNumber = current.reduce((last, entry) => {
        const match = /^B40-(\d+)$/.exec(entry.id);
        return match ? Math.max(last, Number(match[1])) : last;
      }, 1000);
      const record = {
        ...order,
        id: `B40-${lastNumber + 1}`,
        simulated: false,
        status: "new",
        createdAt: new Date().toISOString(),
      };
      if (!validOrder(record) || !record.items.length)
        throw new Error("Invalid order");
      write(storageKeys.orders, [record, ...current]);
      return record;
    };
    // Keep numbering and writes together when multiple checkout tabs submit.
    return navigator.locks
      ? navigator.locks.request("b40-create-order", save)
      : save();
  },
  setStatus(id, status) {
    const current = orderService.list();
    const order = current.find((o) => o.id === id);
    const next = { new: "preparing", preparing: "ready", ready: "delivered" };
    if (
      !order ||
      !(
        next[order.status] === status ||
        (status === "cancelled" && next[order.status])
      )
    )
      throw new Error("Invalid order transition");
    write(
      storageKeys.orders,
      current.map((o) => (o.id === id ? { ...o, status } : o)),
    );
  },
};
