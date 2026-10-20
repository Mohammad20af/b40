import { products } from "../data/products.js";
import { deliveryZones } from "../data/branches.js";
import { demoOrders, orderStatuses } from "../data/orders.js";
import { withInventory } from "../utils/inventory.js";
import { sanitizeCart } from "../utils/shop.js";
import { defaultSku, normalizeSku, withSkus } from "../utils/catalog.js";

export const storageKeys = {
  products: "b40-products-v1",
  orders: "b40-orders-v1",
  cart: "b40-cart-v1",
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
    withSkus(
      read(storageKeys.products, products, validProduct).map(withInventory),
    ),
  migrate() {
    const snapshot = storageSnapshot(storageKeys.products);
    // Leave malformed storage untouched; normal reads still use the existing fallback.
    if (snapshot !== null) {
      try {
        const stored = JSON.parse(snapshot);
        if (!Array.isArray(stored) || !stored.every(validProduct)) return;
      } catch {
        return;
      }
    }
    const current = catalogService.list();
    if (snapshot !== JSON.stringify(current))
      write(storageKeys.products, current);
  },
  get: (id) => catalogService.list().find((p) => p.id === id),
  save(product) {
    let record = { ...product, id: product.id || crypto.randomUUID() };
    if (!validProduct(record)) throw new Error("Invalid product");
    const current = catalogService.list();
    record.sku =
      normalizeSku(record.sku) ||
      defaultSku(
        record.id,
        new Set(current.filter((p) => p.id !== record.id).map((p) => p.sku)),
      );
    if (
      record.sku.length > 80 ||
      current.some((p) => p.id !== record.id && p.sku === record.sku)
    ) {
      const error = new Error(
        record.sku.length > 80
          ? "رمز المنتج يجب ألا يتجاوز 80 حرفاً."
          : "رمز المنتج مستخدم بالفعل. أدخل رمزاً فريداً.",
      );
      error.code = "INVALID_SKU";
      throw error;
    }
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
export const cartService = {
  list(catalog = catalogService.list()) {
    return sanitizeCart(
      read(storageKeys.cart, [], () => true),
      catalog,
    );
  },
  save(entries) {
    write(
      storageKeys.cart,
      entries.map(({ id, size, color, quantity }) => ({
        id,
        size,
        color,
        quantity,
      })),
    );
  },
};
export const orderService = {
  list: () => read(storageKeys.orders, demoOrders, validOrder),
  get: (id) => orderService.list().find((order) => order.id === id),
  create: async (order) => {
    const save = () => {
      const catalog = catalogService.list();
      const checked = sanitizeCart(order.items, catalog);
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
      const zone = deliveryService.zones().find((z) => z.id === order.zone?.id);
      if (!zone) throw new Error("Invalid delivery zone");
      const items = checked.map((entry) => {
        const product = catalog.find((p) => p.id === entry.id);
        return {
          ...entry,
          product: {
            id: product.id,
            sku: product.sku,
            name: product.name,
            price: product.price,
            images: [product.images[0]],
          },
        };
      });
      const lastNumber = current.reduce((last, entry) => {
        const match = /^B40-(\d+)$/.exec(entry.id);
        return match ? Math.max(last, Number(match[1])) : last;
      }, 1000);
      const record = {
        ...order,
        customer: {
          ...order.customer,
          notes:
            typeof order.customer?.notes === "string"
              ? order.customer.notes.trim()
              : "",
        },
        items,
        zone: { ...zone },
        delivery: zone.price,
        subtotal: items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        ),
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
