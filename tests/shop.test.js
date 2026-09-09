import test from "node:test";
import assert from "node:assert/strict";
import { products } from "../src/data/products.js";
import { branches, deliveryZones } from "../src/data/branches.js";
import {
  sanitizeCart,
  filterProducts,
  orderMessage,
  money,
} from "../src/utils/shop.js";

test("cart rejects stale, malformed, unavailable and invalid variant entries", () => {
  assert.deepEqual(
    sanitizeCart(
      [
        null,
        {},
        { id: "missing" },
        { id: "10", size: "M", color: "أسود", quantity: 1 },
        { id: "01", size: "XXL", color: "أسود", quantity: 1 },
        { id: "01", size: "M", color: "أسود", quantity: -2 },
      ],
      products,
    ),
    [],
  );
  assert.deepEqual(sanitizeCart({}, products), []);
});
test("cart merges matching variants, caps quantity and keeps sizes distinct", () => {
  const entries = sanitizeCart(
    [
      { id: "01", size: "M", color: "أسود", quantity: 8 },
      { id: "01", size: "M", color: "أسود", quantity: 8 },
      { id: "01", size: "L", color: "أسود", quantity: 1 },
    ],
    products,
  );
  assert.equal(entries.length, 2);
  assert.equal(entries[0].quantity, 10);
  assert.equal(entries[1].quantity, 1);
});
test("combined filters and numeric price sorting return matching products only", () => {
  const list = filterProducts(products, {
    category: "clothing",
    size: "M",
    maxPrice: 200,
    available: true,
    search: "تيشيرت",
    sort: "low",
  });
  assert.deepEqual(
    list.map((p) => p.price),
    [99, 129, 149],
  );
  assert.equal(
    filterProducts(products, { category: "أحذية", size: "M" }).length,
    0,
  );
  assert.equal(filterProducts(products, { available: true }).length, 11);
});
test("Arabic WhatsApp preview preserves branch, delivery, variants and totals", () => {
  const customer = {
    name: "عميل تجريبي",
    phone: "0500000000",
    area: "وسط المدينة",
    address: "عنوان تجريبي",
    notes: "اتصال قبل التوصيل",
  };
  for (const branch of branches) {
    const message = orderMessage({
      customer,
      branch,
      zone: deliveryZones[1],
      delivery: 15,
      subtotal: 258,
      items: [{ product: products[0], size: "M", color: "أسود", quantity: 2 }],
    });
    for (const expected of [
      branch.name,
      customer.name,
      customer.phone,
      customer.address,
      "المقاس: M",
      "اللون: أسود",
      "الكمية: 2",
      money(273),
      customer.notes,
    ])
      assert.ok(message.includes(expected), expected);
  }
});
