import { createContext, useContext, useEffect, useState } from "react";
import { products } from "../data/products";
import { itemKey, sanitizeCart } from "../utils/shop";

const CartContext = createContext(null);
const storageKey = "b40-cart-v1";
export function CartProvider({ children }) {
  const [entries, setEntries] = useState(() => {
    try {
      return sanitizeCart(
        JSON.parse(localStorage.getItem(storageKey) || "[]"),
        products,
      );
    } catch {
      return [];
    }
  });
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(entries));
    } catch {
      /* Cart remains usable when storage is unavailable. */
    }
  }, [entries]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  const items = entries.map((e) => ({
    ...e,
    product: products.find((p) => p.id === e.id),
  }));
  const add = (product, size, color, quantity = 1) => {
    if (!product.available) return;
    setEntries((current) =>
      sanitizeCart(
        [...current, { id: product.id, size, color, quantity }],
        products,
      ),
    );
    setNotice(`تمت إضافة ${product.name} إلى الحقيبة`);
  };
  const update = (key, quantity) =>
    setEntries((current) =>
      current.map((e) =>
        e.key === key
          ? { ...e, quantity: Math.max(1, Math.min(10, quantity)) }
          : e,
      ),
    );
  const remove = (key) =>
    setEntries((current) => current.filter((e) => e.key !== key));
  return (
    <CartContext.Provider
      value={{
        items,
        add,
        update,
        remove,
        clear: () => setEntries([]),
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
