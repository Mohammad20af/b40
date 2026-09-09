import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { money } from "../utils/shop";

export function Reveal({ children, className = "", delay = 0 }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55, delay }}
    >
      {children}
    </motion.div>
  );
}
export function Heading({ eyebrow, title, link, to = "/shop" }) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {link && (
        <Link className="text-link" to={to}>
          {link}
          <ArrowLeft size={18} />
        </Link>
      )}
    </div>
  );
}
export function Price({ product }) {
  return (
    <span className="price">
      {money(product.price)}{" "}
      {product.oldPrice && <del>{money(product.oldPrice)}</del>}
    </span>
  );
}
export function Quantity({ value, onChange }) {
  return (
    <div className="quantity">
      <button
        type="button"
        aria-label="تقليل الكمية"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={15} />
      </button>
      <output aria-label="الكمية">{value}</output>
      <button
        type="button"
        aria-label="زيادة الكمية"
        disabled={value >= 10}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
export function Empty({ title, detail }) {
  return (
    <div className="empty">
      <span className="eyebrow">B40</span>
      <h2>{title}</h2>
      <p>{detail}</p>
      <Link className="button" to="/shop">
        اكتشف المنتجات
        <ArrowLeft size={18} />
      </Link>
    </div>
  );
}
