import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { money } from "../utils/shop";

export default function OrderConfirmation({ order }) {
  return (
    <div className="container page order-success">
      <div className="success-icon">
        <Check size={34} />
      </div>
      <h1>تم استلام طلبك</h1>
      <p>
        رقم طلبك: <bdi>{order.id}</bdi>
      </p>
      <section
        className="summary confirmation-customer"
        aria-label="بيانات العميل"
      >
        <h2>بيانات العميل</h2>
        <p>{order.customer.name}</p>
        <p>
          <bdi>{order.customer.phone}</bdi>
        </p>
        {order.customer.area && <p>{order.customer.area}</p>}
        <p>{order.customer.address}</p>
      </section>
      <section className="summary" aria-label="ملخص الطلب">
        <h2>ملخص الطلب</h2>
        {order.items.map((item, index) => (
          <div className="order-item" key={item.key || index}>
            {item.product.images?.[0] && (
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                width="54"
                height="68"
              />
            )}
            <div>
              <strong>{item.product.name}</strong>
              <small>
                المقاس: <bdi>{item.size}</bdi>
                {item.color && <> · اللون: {item.color}</>} · الكمية:{" "}
                {item.quantity}
              </small>
              <small>سعر القطعة: {money(item.product.price)}</small>
            </div>
            <span>{money(item.product.price * item.quantity)}</span>
          </div>
        ))}
        <div className="summary-line">
          <span>المجموع الفرعي</span>
          <span>{money(order.subtotal)}</span>
        </div>
        <div className="summary-line">
          <span>منطقة التوصيل</span>
          <span>{order.zone.name}</span>
        </div>
        <div className="summary-line">
          <span>التوصيل</span>
          <span>{money(order.delivery)}</span>
        </div>
        <div className="summary-line total">
          <span>الإجمالي</span>
          <strong>{money(order.subtotal + order.delivery)}</strong>
        </div>
        {order.customer.notes?.trim() && (
          <div className="order-notes">
            <h2>ملاحظات على الطلب</h2>
            <p>{order.customer.notes}</p>
          </div>
        )}
      </section>
      <Link className="text-link" to="/shop">
        العودة للتسوق
      </Link>
    </div>
  );
}
