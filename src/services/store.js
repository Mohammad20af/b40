import { products } from "../data/products";
import { deliveryZones } from "../data/branches";
import { demoOrders, orderStatuses } from "../data/orders";

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
  list: () => read(storageKeys.products, products, validProduct),
  get: (id) => catalogService.list().find((p) => p.id === id),
  save(product) {
    const record = { ...product, id: product.id || crypto.randomUUID() };
    if (!validProduct(record)) throw new Error("Invalid product");
    const current = catalogService.list();
    write(
      storageKeys.products,
      current.some((p) => p.id === record.id)
        ? current.map((p) => (p.id === record.id ? record : p))
        : [record, ...current],
    );
    return record;
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
  preview: async (order) => {
    const record = {
      ...order,
      id: `B40-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      simulated: true,
      status: "new",
      createdAt: new Date().toISOString(),
    };
    write(storageKeys.orders, [record, ...orderService.list()]);
    return record;
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
