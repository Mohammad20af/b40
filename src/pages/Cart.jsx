import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { Empty, Quantity } from "../components/UI";
import { money } from "../utils/shop";

export default function Cart() {
  const { items, count, subtotal, update, remove } = useCart();
  if (!items.length)
    return (
      <Empty title="حقيبتك تنتظر أول قطعة" detail="اكتشف التشكيلة الجديدة." />
    );
  return (
    <div className="container page">
      <div className="page-heading">
        <h1>
          حقيبة التسوق <span className="accent">({count})</span>
        </h1>
      </div>
      <div className="checkout-layout">
        <div className="cart-items">
          {items.map((i) => (
            <article className="cart-item" key={i.key}>
              <Link to={`/product/${i.id}`}>
                <img
                  src={i.product.images[0]}
                  alt={i.product.name}
                  width="140"
                  height="175"
                />
              </Link>
              <div className="cart-item-info">
                <span className="eyebrow">{i.product.category}</span>
                <h2>
                  <Link to={`/product/${i.id}`}>{i.product.name}</Link>
                </h2>
                <p>
                  المقاس: <bdi>{i.size}</bdi> · اللون: {i.color}
                </p>
                <Quantity
                  value={i.quantity}
                  onChange={(n) => update(i.key, n)}
                />
              </div>
              <div className="cart-item-total">
                <strong>{money(i.product.price * i.quantity)}</strong>
                <button
                  className="text-button"
                  aria-label={`حذف ${i.product.name}`}
                  onClick={() => remove(i.key)}
                >
                  <Trash2 size={16} /> حذف
                </button>
              </div>
            </article>
          ))}
          <Link className="text-link" to="/shop">
            أكمل التسوق
            <ArrowLeft size={18} />
          </Link>
        </div>
        <aside className="summary">
          <ShoppingBag size={24} />
          <h2>ملخص الحقيبة</h2>
          <div className="summary-line">
            <span>المجموع الفرعي</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="summary-line">
            <span>التوصيل</span>
            <span>يُحسب في الخطوة التالية</span>
          </div>
          <div className="summary-line total">
            <span>الإجمالي قبل التوصيل</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <Link className="button full" to="/checkout">
            إتمام الطلب
            <ArrowLeft size={18} />
          </Link>
          <p className="small muted">
            الدفع عند الاستلام · أسعار التوصيل تجريبية
          </p>
        </aside>
      </div>
    </div>
  );
}
