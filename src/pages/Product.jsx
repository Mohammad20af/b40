import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ShoppingBag, Truck, ShieldCheck } from "lucide-react";
import { catalogService } from "../services/store";
import { useCatalog } from "../hooks/useStore";
import { useCart } from "../hooks/useCart";
import { Empty, Price, Quantity, Heading } from "../components/UI";
import ProductCard from "../components/ProductCard";
import {
  canPurchase,
  remainingStock,
  sizeStock,
  totalStock,
} from "../utils/inventory.js";
import { itemKey } from "../utils/shop";

export default function Product() {
  const { id } = useParams();
  const products = useCatalog();
  const product = products.find((p) => p.id === id);
  return product ? (
    <ProductContent key={id} product={product} />
  ) : (
    <Empty
      title="هذه القطعة غير موجودة"
      detail="اكتشف قطعاً أخرى من التشكيلة."
    />
  );
}
function ProductContent({ product }) {
  const [image, setImage] = useState(0),
    [size, setSize] = useState(""),
    [color, setColor] = useState(product.colors[0].name),
    [quantity, setQuantity] = useState(1),
    [error, setError] = useState("");
  const { add, items } = useCart();
  const purchasable = canPurchase(product);
  const inLine =
    items.find((i) => i.key === itemKey(product.id, size, color))?.quantity ||
    0;
  const limit = size
    ? Math.min(10 - inLine, remainingStock(product, size, items))
    : 0;
  const selectedQuantity = Math.min(quantity, Math.max(0, limit));
  const reduced = useReducedMotion();
  function addProduct() {
    if (!size) {
      setError("اختر المقاس أولاً");
      return;
    }
    add(product, size, color, selectedQuantity);
    setError("");
  }
  return (
    <div className="container page">
      <div className="breadcrumb">
        <Link to="/">الرئيسية</Link>
        <span>/</span>
        <Link to="/shop">المنتجات</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>
      <div className="product-detail">
        <div className="gallery">
          <div className="gallery-main">
            <AnimatePresence mode="wait">
              <motion.img
                key={image}
                initial={{ opacity: reduced ? 1 : 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: reduced ? 1 : 0 }}
                transition={{ duration: 0.18 }}
                src={product.images[image] || product.images[0]}
                alt={`${product.name} — ${image === 0 ? "صورة المنتج" : "صورة إلهام للإطلالة"}`}
                width="800"
                height="1000"
              />
            </AnimatePresence>
          </div>
          <div className="thumbnails">
            {product.images.map((src, i) => (
              <button
                key={src}
                onClick={() => setImage(i)}
                aria-label={i === 0 ? "صورة المنتج" : "صورة إلهام للإطلالة"}
                aria-pressed={image === i}
              >
                <img src={src} alt="" width="80" height="100" />
              </button>
            ))}
          </div>
          <p className="small muted">صور توضيحية؛ الصورة الثانية للإلهام.</p>
        </div>
        <div className="product-info">
          <span className="eyebrow">B40 JERICHO / {product.category}</span>
          <h1>{product.name}</h1>
          <Price product={product} />
          <p className="product-description">{product.description}</p>
          <p className={purchasable ? "stock" : "muted"}>
            {totalStock(product) === 0
              ? "نفد من المخزون"
              : product.available
                ? "● متوفر الآن"
                : "غير متوفر حالياً"}
          </p>
          <fieldset>
            <legend>المقاس</legend>
            <div className="size-options">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  aria-pressed={s === size && sizeStock(product, s) > 0}
                  disabled={sizeStock(product, s) === 0}
                  onClick={() => {
                    setSize(s);
                    setQuantity(1);
                    setError("");
                  }}
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
                  style={{ "--swatch": c.hex }}
                  key={c.name}
                  aria-label={c.name}
                  aria-pressed={c.name === color}
                  onClick={() => setColor(c.name)}
                />
              ))}
            </div>
          </fieldset>
          <div className="add-row">
            <Quantity
              value={size ? selectedQuantity : 1}
              max={limit}
              onChange={setQuantity}
            />
            <button
              className="button"
              disabled={!purchasable || (!!size && limit === 0)}
              onClick={addProduct}
            >
              <ShoppingBag size={18} /> أضف إلى الحقيبة
            </button>
          </div>
          {purchasable &&
            size &&
            limit === 0 &&
            sizeStock(product, size) > 0 && (
              <p className="small muted">
                كل الكمية المتوفرة لهذا المقاس موجودة في الحقيبة.
              </p>
            )}
          <p role="alert" className="error">
            {error}
          </p>
          <div className="product-promises">
            <span>
              <Truck size={18} /> التوصيل يُحسب عند إتمام الطلب
            </span>
            <span>
              <ShieldCheck size={18} /> الدفع عند الاستلام
            </span>
          </div>
        </div>
      </div>
      <section className="section">
        <Heading title="قد تعجبك أيضاً" />
        <div className="product-grid">
          {catalogService
            .list()
            .filter((p) => p.id !== product.id)
            .slice(0, 4)
            .map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
        </div>
      </section>
    </div>
  );
}
