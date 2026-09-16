import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  Clock3,
  CircleCheck,
  Truck,
  Search,
  ArrowLeft,
} from "lucide-react";
import { orderStatuses } from "../../data/orders";
import { orderService } from "../../services/store";
import { money } from "../../utils/shop";
import AdminDialog from "./AdminDialog";

const statIcons = [ShoppingBag, Clock3, CircleCheck, Truck];
export function OrderStats({ orders, productCount }) {
  return (
    <div
      className={`admin-stat-grid ${productCount !== undefined ? "with-products" : ""}`}
    >
      {productCount !== undefined && (
        <article className="admin-stat">
          <span className="admin-stat-icon">
            <Package size={21} />
          </span>
          <span>عدد المنتجات</span>
          <strong>{productCount}</strong>
        </article>
      )}
      {orderStatuses.slice(0, 4).map((s, i) => {
        const Icon = statIcons[i];
        return (
          <article className={`admin-stat stat-${s.id}`} key={s.id}>
            <span className="admin-stat-icon">
              <Icon size={21} />
            </span>
            <span>{s.stat}</span>
            <strong>{orders.filter((o) => o.status === s.id).length}</strong>
          </article>
        );
      })}
    </div>
  );
}
export default function OrdersManager({ orders }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const normalize = (value) =>
    String(value)
      .toLowerCase()
      .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
      .replace(/[\s()+-]/g, "");
  const query = normalize(search);
  const filtered = [...orders]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .filter(
      (o) =>
        (filter === "all" || o.status === filter) &&
        [o.id, o.customer.name, o.customer.phone].some((v) =>
          normalize(v).includes(query),
        ),
    );
  return (
    <>
      <OrderStats orders={orders} />
      <div className="section-heading">
        <h2>إدارة الطلبات</h2>
        <span className="muted small">{orders.length} طلب</span>
      </div>
      <label className="search admin-order-search">
        <Search size={19} />
        <input
          aria-label="البحث في الطلبات"
          placeholder="ابحث برقم الطلب أو اسم العميل أو رقم الهاتف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <div
        className="admin-order-filters"
        role="group"
        aria-label="تصفية الطلبات"
      >
        {[{ id: "all", label: "الكل" }, ...orderStatuses].map((s) => (
          <button
            key={s.id}
            aria-pressed={filter === s.id}
            onClick={() => setFilter(s.id)}
          >
            {s.label}
            <span>
              {s.id === "all"
                ? orders.length
                : orders.filter((o) => o.status === s.id).length}
            </span>
          </button>
        ))}
      </div>
      <p className="admin-result-count" role="status">
        {filtered.length} طلب مطابق
      </p>
      <OrderList orders={filtered} />
    </>
  );
}

export function OrderList({ orders, compact = false }) {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cancel, setCancel] = useState(null);
  function transition(order, status) {
    setError("");
    try {
      orderService.setStatus(order.id, status);
      setNotice(
        `تم تحديث الطلب ${order.id} إلى ${orderStatuses.find((s) => s.id === status).label}.`,
      );
      setCancel(null);
    } catch {
      setError(
        "تعذّر تحديث الطلب. تحقق من مساحة التخزين وحدّث الصفحة ثم حاول مجدداً.",
      );
    }
  }
  return (
    <>
      {error && !cancel && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <p role="status" className="admin-notice">
        {notice}
      </p>
      {!orders.length ? (
        <div className="admin-empty">
          <ShoppingBag size={30} />
          <h3>لا توجد طلبات</h3>
          <p>جرّب تغيير البحث أو التصفية.</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {orders.map((order) => {
            const status = orderStatuses.find((s) => s.id === order.status);
            if (compact)
              return (
                <article className="admin-order-summary" key={order.id}>
                  <div>
                    <Link to="/admin/orders">
                      <strong dir="ltr">{order.id}</strong>
                    </Link>
                    <span className="small muted">{order.customer.name}</span>
                  </div>
                  <span className={`status-badge status-${status.id}`}>
                    {status.label}
                  </span>
                  <div>
                    <strong>{money(order.subtotal + order.delivery)}</strong>
                    <span className="small muted">
                      {new Intl.DateTimeFormat("ar", {
                        dateStyle: "medium",
                      }).format(new Date(order.createdAt))}
                    </span>
                  </div>
                </article>
              );
            return (
              <article
                className="admin-order-card"
                key={order.id}
                aria-label={`الطلب ${order.id}`}
              >
                <header>
                  <div>
                    <strong dir="ltr">{order.id}</strong>
                    <span className="small muted">
                      {new Intl.DateTimeFormat("ar", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(order.createdAt))}
                      {order.simulated && " · تجريبي"}
                    </span>
                  </div>
                  <span className={`status-badge status-${status.id}`}>
                    {status.label}
                  </span>
                </header>
                <div className="admin-order-detail">
                  <div>
                    <span className="admin-detail-label">العميل</span>
                    <strong>{order.customer.name}</strong>
                    <a
                      className="admin-phone"
                      dir="ltr"
                      href={`tel:${order.customer.phone}`}
                    >
                      {order.customer.phone}
                    </a>
                  </div>
                  <div>
                    <span className="admin-detail-label">
                      المنطقة / العنوان
                    </span>
                    <span>
                      {order.zone.name} · {order.customer.area}
                    </span>
                    <span>{order.customer.address}</span>
                  </div>
                  <div>
                    <span className="admin-detail-label">الفرع</span>
                    <strong>{order.branch.name}</strong>
                  </div>
                </div>
                <div className="admin-order-items">
                  {order.items.map((item, index) => (
                    <div key={index}>
                      <span>
                        <strong>{item.product.name}</strong>
                        <small className="muted">
                          المقاس: {item.size} · اللون: {item.color} · الكمية:{" "}
                          {item.quantity}
                        </small>
                      </span>
                      <span>{money(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                {order.customer.notes && (
                  <p className="small muted">ملاحظات: {order.customer.notes}</p>
                )}
                <footer>
                  <div>
                    <span className="small muted">
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} قطع
                      · التوصيل {money(order.delivery)}
                    </span>
                    <strong>
                      الإجمالي: {money(order.subtotal + order.delivery)}
                    </strong>
                  </div>
                  <div className="admin-order-actions">
                    {status.next && (
                      <>
                        <button
                          className="button"
                          onClick={() => transition(order, status.next)}
                        >
                          {status.action}
                          <ArrowLeft size={16} />
                        </button>
                        <button
                          className="text-button admin-danger"
                          onClick={() => {
                            setError("");
                            setCancel(order);
                          }}
                        >
                          إلغاء الطلب
                        </button>
                      </>
                    )}
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      )}
      {cancel && (
        <AdminDialog title="إلغاء الطلب" close={() => setCancel(null)}>
          <p>
            هل تريد إلغاء الطلب <bdi>{cancel.id}</bdi>؟
          </p>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <div className="admin-dialog-actions">
            <button
              className="button admin-delete-button"
              onClick={() => transition(cancel, "cancelled")}
            >
              تأكيد إلغاء الطلب
            </button>
            <button className="button-outline" onClick={() => setCancel(null)}>
              تراجع
            </button>
          </div>
        </AdminDialog>
      )}
    </>
  );
}
