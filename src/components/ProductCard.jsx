import { Link } from "react-router-dom";
import { useRef, useState, useId } from "react";
import { createPortal } from "react-dom";
import { Plus, X, ShoppingBag } from "lucide-react";
import { money } from "../utils/shop";
import { useCart } from "../hooks/useCart";
import { Reveal, ImageReveal } from "./ScrollMotion";
import { canPurchase, remainingStock, sizeStock } from "../utils/inventory.js";
import { itemKey } from "../utils/shop";

export default function ProductCard({ product, index = 0 }) {
  const delay = (index % 4) * 0.055;
  const dialog = useRef(null);
  const titleId = useId();
  const [size, setSize] = useState("");
  const [color, setColor] = useState(product.colors[0].name);
  const { add, items } = useCart();
  const purchasable = canPurchase(product);
  const inLine =
    items.find((i) => i.key === itemKey(product.id, size, color))?.quantity ||
    0;
  const limit = Math.min(10 - inLine, remainingStock(product, size, items));
  return (
    <Reveal as="article" className="product-card" delay={delay}>
      <Link
        className="product-photo"
        to={`/product/${product.id}`}
        aria-label={`عرض ${product.name}`}
      >
        <ImageReveal
          delay={delay + 0.04}
          hoverScale={1.055}
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          width="600"
          height="750"
        />
        {!purchasable && <span className="tag sold-out">نفد من المخزون</span>}
      </Link>
      <div className="product-meta">
        <div>
          <h3>
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <span className="price">{money(product.price)}</span>
        </div>
        <button
          className="quick-add"
          aria-label={`اختيار مقاس وإضافة ${product.name}`}
          aria-haspopup="dialog"
          disabled={!purchasable}
          onClick={() => {
            setSize("");
            setColor(product.colors[0].name);
            dialog.current.showModal();
          }}
        >
          <Plus size={20} />
        </button>
      </div>
      {createPortal(
        <dialog
          className="quick-dialog"
          ref={dialog}
          aria-labelledby={titleId}
          onClick={(e) => {
            if (e.target === dialog.current) {
              const r = dialog.current.getBoundingClientRect();
              if (
                e.clientX < r.left ||
                e.clientX > r.right ||
                e.clientY < r.top ||
                e.clientY > r.bottom
              )
                dialog.current.close();
            }
          }}
        >
          <button
            className="icon-button quick-close"
            aria-label="إغلاق"
            onClick={() => dialog.current.close()}
          >
            <X size={21} />
          </button>
          <div className="quick-preview">
            <img
              src={product.images[0]}
              alt={product.name}
              width="120"
              height="150"
            />
            <div>
              <h2 id={titleId}>{product.name}</h2>
              <span className="price">{money(product.price)}</span>
            </div>
          </div>
          <fieldset>
            <legend>اختر المقاس</legend>
            <div className="size-options">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  aria-pressed={size === s && sizeStock(product, s) > 0}
                  disabled={sizeStock(product, s) === 0}
                  onClick={() => setSize(s)}
                >
                  {s}
                  {sizeStock(product, s) === 0 ? " - نفد" : ""}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>اللون: {color}</legend>
            <div className="color-options">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  aria-label={c.name}
                  aria-pressed={color === c.name}
                  style={{ "--swatch": c.hex }}
                  onClick={() => setColor(c.name)}
                />
              ))}
            </div>
          </fieldset>
          <button
            className="button full"
            disabled={!size || !purchasable || limit === 0}
            onClick={() => {
              if (add(product, size, color)) dialog.current.close();
            }}
          >
            <ShoppingBag size={18} />
            أضف إلى الحقيبة
          </button>
          {size && purchasable && limit === 0 && (
            <p className="small muted">
              لا توجد كمية إضافية متوفرة لهذا المقاس.
            </p>
          )}
        </dialog>,
        document.body,
      )}
    </Reveal>
  );
}
