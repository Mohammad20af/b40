import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useCatalog } from "./useStore";
import { itemKey, sanitizeCart } from "../utils/shop";
import { cartService, catalogService } from "../services/store";
import { remainingStock } from "../utils/inventory.js";

const CartContext = createContext(null);
export function CartProvider({ children }) {
  const products = useCatalog();
  const [entries, setEntries] = useState(() => {
    try {
      return cartService.list(products);
    } catch {
      return [];
    }
  });
  const [notice, setNotice] = useState("");
  const entriesRef = useRef(entries);
  function commit(next) {
    entriesRef.current = next;
    setEntries(next);
  }
  useEffect(() => {
    const next = sanitizeCart(entriesRef.current, products);
    if (JSON.stringify(next) !== JSON.stringify(entriesRef.current)) {
      commit(next);
      setNotice("تم تعديل الحقيبة حسب المخزون المتوفر حالياً.");
    }
  }, [products]);
  useEffect(() => {
    try {
      cartService.save(entries);
    } catch {
      /* Cart remains usable when storage is unavailable. */
    }
  }, [entries]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  const items = sanitizeCart(entries, products).map((e) => ({
    ...e,
    product: products.find((p) => p.id === e.id),
  }));
  const add = (product, size, color, quantity = 1) => {
    const catalog = catalogService.list();
    const latest = catalog.find((p) => p.id === product.id);
    const current = sanitizeCart(entriesRef.current, catalog);
    const key = itemKey(product.id, size, color);
    const inLine = current.find((e) => e.key === key)?.quantity || 0;
    if (
      !latest?.available ||
      !latest.colors.some((c) => c.name === color) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > Math.min(10 - inLine, remainingStock(latest, size, current))
    ) {
      commit(current);
      setNotice("الكمية المطلوبة غير متوفرة في المخزون. راجع الحقيبة.");
      return false;
    }
    commit(
      sanitizeCart(
        [...current, { id: product.id, size, color, quantity }],
        catalog,
      ),
    );
    setNotice(`تمت إضافة ${product.name} إلى الحقيبة`);
    return true;
  };
  const update = (key, quantity) => {
    const catalog = catalogService.list();
    const current = sanitizeCart(entriesRef.current, catalog);
    const entry = current.find((e) => e.key === key);
    if (!entry || !Number.isInteger(quantity)) return commit(current);
    const product = catalog.find((p) => p.id === entry.id);
    const nextQuantity = Math.max(
      1,
      Math.min(10, quantity, remainingStock(product, entry.size, current, key)),
    );
    commit(
      current.map((e) =>
        e.key === key ? { ...e, quantity: nextQuantity } : e,
      ),
    );
    if (nextQuantity !== quantity)
      setNotice("تم تعديل الكمية حسب المخزون المتوفر.");
  };
  const remove = (key) =>
    commit(entriesRef.current.filter((e) => e.key !== key));
  return (
    <CartContext.Provider
      value={{
        items,
        add,
        update,
        remove,
        clear: () => commit([]),
        count: items.reduce((s, i) => s + i.quantity, 0),
        subtotal: items.reduce((s, i) => s + i.product.price * i.quantity, 0),
        itemKey,
      }}
    >
      {children}
      <div className={`toast ${notice ? "visible" : ""}`} role="status">
        {notice}
      </div>
    </CartContext.Provider>
  );
}
export const useCart = () => useContext(CartContext);
