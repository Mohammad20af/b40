import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { products } from "../src/data/products.js";
import { storeInfo } from "../src/data/branches.js";
import { withSkus } from "../src/utils/catalog.js";
import {
  catalogService,
  cartService,
  deliveryService,
  orderService,
  storageKeys,
} from "../src/services/store.js";

beforeEach(() => {
  const data = new Map();
  globalThis.localStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
  globalThis.window = new EventTarget();
});

test("SKU migration preserves legacy catalog, inventory, images and orders and is stable", () => {
  const legacy = [
    {
      ...products[0],
      images: [products[0].images[0]],
      stockBySize: { S: 0, M: 2 },
    },
    { ...products[1], sku: " shoe-2 " },
  ];
  localStorage.setItem(storageKeys.products, JSON.stringify(legacy));
  localStorage.setItem(storageKeys.orders, "[]");
  catalogService.migrate();
  const first = localStorage.getItem(storageKeys.products);
  catalogService.migrate();
  assert.equal(localStorage.getItem(storageKeys.products), first);
  assert.equal(localStorage.getItem(storageKeys.orders), "[]");
  const saved = catalogService.list();
  assert.equal(saved[0].sku, "B40-P-001");
  assert.equal(saved[1].sku, "SHOE-2");
  assert.equal(saved[0].stockBySize.S, 0);
  assert.equal(saved[0].stockBySize.M, 2);
  assert.deepEqual(saved[0].images, legacy[0].images);
});

test("SKU defaults avoid explicit and duplicate legacy SKUs independent of catalog ordering", () => {
  const legacy = [
    { ...products[0] },
    { ...products[1], sku: "B40-P-001" },
    { ...products[2], sku: "b40-p-001" },
  ];
  const result = withSkus(legacy);
  assert.equal(new Set(result.map((p) => p.sku)).size, 3);
  for (const product of withSkus([...legacy].reverse()))
    assert.equal(product.sku, result.find((p) => p.id === product.id).sku);
  assert.deepEqual(withSkus(result), result);
});

test("SKU duplicates are rejected on create and edit without modifying catalog", () => {
  catalogService.migrate();
  const [first, second] = catalogService.list();
  const snapshot = localStorage.getItem(storageKeys.products);
  for (const record of [
    { ...second, sku: ` ${first.sku.toLowerCase()} ` },
    { ...first, id: undefined },
  ]) {
    assert.throws(() => catalogService.save(record), { code: "INVALID_SKU" });
  }
  assert.equal(localStorage.getItem(storageKeys.products), snapshot);
  const updated = catalogService.save({
    ...first,
    sku: " custom-001 ",
    images: [...first.images].reverse(),
  });
  assert.equal(updated.sku, "CUSTOM-001");
  assert.deepEqual(
    catalogService.get(first.id).images,
    [...first.images].reverse(),
  );
});

test("cart service stores only line identifiers and quantities and safely loads legacy data", () => {
  const product = catalogService.list()[0];
  const line = {
    id: product.id,
    size: "M",
    color: product.colors[0].name,
    quantity: 2,
    product,
    key: "old-key",
  };
  cartService.save([line]);
  assert.deepEqual(JSON.parse(localStorage.getItem(storageKeys.cart)), [
    { id: line.id, size: line.size, color: line.color, quantity: 2 },
  ]);
  localStorage.setItem(
    storageKeys.cart,
    JSON.stringify([null, line, { id: "missing" }]),
  );
  assert.equal(cartService.list().length, 1);
  assert.equal(cartService.list()[0].quantity, 2);
});

test("saved orders preserve stable snapshots, configured delivery, notes, IDs and statuses", async () => {
  const product = catalogService.list()[0];
  const zone = deliveryService.zones().at(-1);
  const payload = {
    customer: {
      name: "Test",
      phone: "0500000000",
      address: "Test address",
      notes: "  Call first\nThanks  ",
    },
    branch: storeInfo,
    zone,
    delivery: 999,
    subtotal: 999,
    items: [
      {
        id: product.id,
        size: "M",
        color: product.colors[0].name,
        quantity: 2,
        product,
      },
    ],
  };
  const order = await orderService.create(payload);
  assert.equal(order.delivery, zone.price);
  assert.equal(order.subtotal, product.price * 2);
  assert.equal(order.customer.notes, "Call first\nThanks");
  assert.equal(order.items[0].product.images.length, 1);
  catalogService.save({ ...product, name: "Changed", price: 1 });
  assert.equal(orderService.get(order.id).items[0].product.name, product.name);
  assert.equal(
    orderService.get(order.id).items[0].product.price,
    product.price,
  );
  for (const status of ["preparing", "ready", "delivered"])
    orderService.setStatus(order.id, status);
  assert.equal(orderService.get(order.id).status, "delivered");
  const next = await orderService.create(payload);
  assert.notEqual(next.id, order.id);
  assert.equal(orderService.get(order.id).id, order.id);
});
