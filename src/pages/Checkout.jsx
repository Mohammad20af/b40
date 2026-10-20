import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, CreditCard } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { Empty } from "../components/UI";
import { storeInfo as branch } from "../data/branches";
import { deliveryService, orderService } from "../services/store";
import { money } from "../utils/shop";
import { useOrders } from "../hooks/useStore";
import OrderConfirmation from "../components/OrderConfirmation";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const [params, setParams] = useSearchParams();
  const orders = useOrders();
  const orderId = params.get("order");
  const order = orders.find((entry) => entry.id === orderId);
  const zones = deliveryService.zones();
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    area: zones.find((z) => z.id === "jericho").name,
    address: "",
    notes: "",
  });
  const [zoneId, setZoneId] = useState("jericho"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const zone = zones.find((z) => z.id === zoneId),
    delivery = deliveryService.quote(zoneId);
  const field = (key, label, props = {}) => (
    <label className={props.wide ? "wide" : ""}>
      {label}
      <input
        name={key}
        value={customer[key]}
        onChange={(e) => setCustomer({ ...customer, [key]: e.target.value })}
        required
        minLength={key === "name" ? 2 : key === "address" ? 5 : 2}
        maxLength={key === "address" ? 250 : 100}
        autoComplete={props.autoComplete}
        type={props.type || "text"}
        pattern={props.pattern}
      />
    </label>
  );
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (
      !customer.name.trim() ||
      !customer.area.trim() ||
      customer.address.trim().length < 5
    ) {
      setError("يرجى إدخال الاسم والمنطقة والعنوان بشكل صحيح.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = {
        customer,
        items: items.map((i) => ({ ...i })),
        branch,
        zone,
        delivery,
        subtotal,
      };
      const savedOrder = await orderService.create(payload);
      setParams({ order: savedOrder.id }, { replace: true });
      clear();
    } catch (error) {
      setError(
        error.code === "STOCK_CHANGED"
          ? error.message
          : "تعذّر حفظ الطلب. تحقق من مساحة التخزين وإعدادات المتصفح ثم حاول مرة أخرى.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (order) return <OrderConfirmation order={order} />;
  if (orderId)
    return (
      <Empty
        title="الطلب غير موجود"
        detail="تعذّر العثور على هذا الطلب في المتصفح الحالي."
      />
    );
  if (!items.length)
    return (
      <Empty
        title="أضف قطعة أولاً"
        detail="حقيبتك فارغة. اختر إطلالتك قبل إتمام الطلب."
      />
    );
  return (
    <div className="container page">
      <div className="page-heading">
        <span className="eyebrow" dir="ltr">
          B40 JERICHO
        </span>
        <h1>إتمام الطلب</h1>
        <p>أدخل بياناتك لتأكيد طلبك داخل الموقع.</p>
      </div>
      <form className="checkout-layout" onSubmit={submit}>
        <div className="checkout-fields">
          <h2>
            <span className="accent">01 /</span> بيانات التوصيل
          </h2>
          <div className="form-grid">
            {field("name", "الاسم الكامل", { autoComplete: "name" })}
            {field("phone", "رقم الهاتف", {
              type: "tel",
              autoComplete: "tel",
              pattern: "[+0-9 \\(\\)\\-]{9,20}",
            })}
            <label>
              منطقة التوصيل
              <select
                required
                value={zoneId}
                onChange={(e) => {
                  setZoneId(e.target.value);
                  setCustomer({
                    ...customer,
                    area: zones.find((z) => z.id === e.target.value).name,
                  });
                }}
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </label>
            {field("address", "العنوان بالتفصيل", {
              wide: true,
              autoComplete: "street-address",
            })}
            <label className="wide">
              ملاحظات على الطلب
              <textarea
                placeholder="مثال: يرجى الاتصال قبل التوصيل"
                rows={3}
                maxLength={500}
                value={customer.notes}
                onChange={(e) =>
                  setCustomer({ ...customer, notes: e.target.value })
                }
              />
            </label>
          </div>
          <h2>
            <span className="accent">02 /</span> طريقة الدفع
          </h2>
          <div className="payment-option">
            <CreditCard size={22} />
            <div>
              <strong>الدفع عند الاستلام</strong>
            </div>
            <Check size={18} />
          </div>
        </div>
        <aside className="summary">
          <h2>طلبك</h2>
          {items.map((i) => (
            <div className="order-item" key={i.key}>
              <img src={i.product.images[0]} alt="" width="54" height="68" />
              <div>
                <strong>{i.product.name}</strong>
                <small>
                  {i.size} · {i.color} · الكمية {i.quantity}
                </small>
              </div>
              <span>{money(i.product.price * i.quantity)}</span>
            </div>
          ))}
          <div className="summary-line">
            <span>المجموع الفرعي</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="summary-line">
            <span>التوصيل</span>
            <span>{money(delivery)}</span>
          </div>
          <div className="summary-line total">
            <span>الإجمالي</span>
            <strong>{money(subtotal + delivery)}</strong>
          </div>
          <button className="button full" disabled={busy} type="submit">
            {busy ? "جارٍ حفظ الطلب…" : "تأكيد الطلب"}
          </button>
          <p className="error" role="alert">
            {error}
          </p>
        </aside>
      </form>
    </div>
  );
}
