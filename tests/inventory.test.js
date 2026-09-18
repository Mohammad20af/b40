import test from "node:test";
import assert from "node:assert/strict";
import { products } from "../src/data/products.js";
import {
  withInventory,
  sizeStock,
  totalStock,
  stockStatus,
  remainingStock,
} from "../src/utils/inventory.js";
import { sanitizeCart, filterProducts } from "../src/utils/shop.js";

test("inventory migrates existing clothing, shoe and custom sizes without mutating products", () => {
  for (const product of products) {
    const normalized = withInventory(product);
    assert.deepEqual(
      Object.keys(normalized.stockBySize).sort(),
      [...product.sizes].sort(),
    );
    assert.equal(
      totalStock(normalized),
      product.sizes.length * (product.available ? 5 : 0),
    );
    assert.equal(product.stockBySize, undefined);
  }
  assert.deepEqual(
    withInventory({ ...products[0], sizes: ["One Size", "constructor"] })
      .stockBySize,
    { "One Size": 5, constructor: 5 },
  );
});

test("inventory preserves zero, drops removed sizes, defaults new sizes and rejects corrupt stock", () => {
  const product = withInventory({
    ...products[0],
    sizes: ["S", "M", "L", "XL"],
    stockBySize: { S: 0, M: -1, L: 1.5, removed: 9 },
  });
  assert.deepEqual(product.stockBySize, { S: 0, M: 0, L: 0, XL: 5 });
  assert.equal(sizeStock(product, "missing"), 0);
  assert.equal(sizeStock({ ...product, stockBySize: { S: "8" } }, "S"), 0);
});

test("status boundaries are zero, one or two, and three or more", () => {
  assert.deepEqual(
    [0, 1, 2, 3].map((n) => stockStatus(n).label),
    ["نفد", "مخزون منخفض", "مخزون منخفض", "متوفر"],
  );
});

test("cart allocates shared size stock across colors and merges duplicates safely", () => {
  const product = withInventory({
    ...products[0],
    stockBySize: { M: 3, S: 0 },
  });
  const line = {
    id: product.id,
    size: "M",
    color: product.colors[0].name,
    quantity: 2,
  };
  const cart = sanitizeCart(
    [
      line,
      { ...line, color: product.colors[1].name },
      line,
      { ...line, size: "S" },
    ],
    [product],
  );
  assert.deepEqual(
    cart.map((i) => i.quantity),
    [2, 1],
  );
  assert.equal(remainingStock(product, "M", cart), 0);
  assert.equal(remainingStock(product, "M", cart, cart[0].key), 2);
  assert.equal(remainingStock(product, "M", [line]), 1);
  assert.deepEqual(
    sanitizeCart(cart, [{ ...product, stockBySize: { M: 1 } }]).map(
      (i) => i.quantity,
    ),
    [1],
  );
  assert.deepEqual(
    sanitizeCart(cart, [{ ...product, stockBySize: { M: 0 } }]),
    [],
  );
});

test("availability filter respects total stock and the selected size", () => {
  const product = withInventory({
    ...products[0],
    stockBySize: { S: 0, M: 0, L: 0, XL: 0 },
  });
  assert.equal(filterProducts([product], { available: true }).length, 0);
  const partial = { ...product, stockBySize: { ...product.stockBySize, M: 2 } };
  assert.equal(
    filterProducts([partial], { available: true, size: "M" }).length,
    1,
  );
  assert.equal(
    filterProducts([partial], { available: true, size: "S" }).length,
    0,
  );
});
