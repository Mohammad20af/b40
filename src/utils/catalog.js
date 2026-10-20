export const normalizeSku = (value) =>
  typeof value === "string" ? value.trim().toUpperCase() : "";

export function defaultSku(id, taken = new Set()) {
  const base = `B40-P-${String(id).toUpperCase().padStart(3, "0")}`;
  let sku = base;
  let suffix = 2;
  while (taken.has(sku)) sku = `${base}-${suffix++}`;
  return sku;
}

// Reserve explicit SKUs before filling legacy records, independent of list order.
export function withSkus(products) {
  const reserved = new Set(
    products.map((p) => normalizeSku(p.sku)).filter(Boolean),
  );
  const assigned = new Set();
  const skus = new Map();
  for (const product of [...products].sort((a, b) =>
    a.id.localeCompare(b.id),
  )) {
    let sku = normalizeSku(product.sku);
    if (!sku || assigned.has(sku)) sku = defaultSku(product.id, reserved);
    reserved.add(sku);
    assigned.add(sku);
    skus.set(product.id, sku);
  }
  return products.map((product) => ({ ...product, sku: skus.get(product.id) }));
}
