export const money = (value) =>
  `${new Intl.NumberFormat("ar", { maximumFractionDigits: 2, numberingSystem: "arab" }).format(value)} ₪`;
export const itemKey = (id, size, color) => [id, size, color].join("|");
export function sanitizeCart(raw, catalog) {
  if (!Array.isArray(raw)) return [];
  const result = new Map();
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const product = catalog.find((p) => p.id === entry.id && p.available);
    if (
      !product ||
      !product.sizes.includes(entry.size) ||
      !product.colors.some((c) => c.name === entry.color)
    )
      continue;
    const quantity = Number(entry.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) continue;
    const key = itemKey(entry.id, entry.size, entry.color);
    const previous = result.get(key)?.quantity || 0;
    result.set(key, {
      id: entry.id,
      size: entry.size,
      color: entry.color,
      quantity: Math.min(10, previous + quantity),
      key,
    });
  }
  return [...result.values()];
}
export function filterProducts(
  products,
  {
    search = "",
    category = "",
    size = "",
    maxPrice = 400,
    available = false,
    sort = "new",
  },
) {
  const results = products.filter(
    (p) =>
      p.name.includes(search.trim()) &&
      (!category ||
        (category === "clothing"
          ? p.category !== "أحذية"
          : p.category === category)) &&
      (!size || p.sizes.includes(size)) &&
      p.price <= Number(maxPrice) &&
      (!available || p.available),
  );
  return sort === "low"
    ? results.sort((a, b) => a.price - b.price)
    : sort === "high"
      ? results.sort((a, b) => b.price - a.price)
      : results;
}
export function orderMessage({
  customer,
  items,
  branch,
  delivery,
  subtotal,
  zone,
}) {
  return [
    "طلب تجريبي من B40",
    `الفرع: ${branch.name}`,
    `الاسم: ${customer.name}`,
    `الهاتف: ${customer.phone}`,
    `الموقع: ${zone.name} - ${customer.area}`,
    `العنوان: ${customer.address}`,
    "",
    ...items.map(
      (i) =>
        `${i.product.name} | المقاس: ${i.size} | اللون: ${i.color} | الكمية: ${i.quantity} | ${money(i.product.price * i.quantity)}`,
    ),
    "",
    `المجموع الفرعي: ${money(subtotal)}`,
    `التوصيل: ${money(delivery)}`,
    `الإجمالي: ${money(subtotal + delivery)}`,
    "الدفع عند الاستلام",
    `ملاحظات: ${customer.notes || "لا يوجد"}`,
  ].join("\n");
}
