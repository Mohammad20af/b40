import { useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Tags,
  Truck,
  LogOut,
  ArrowUpLeft,
} from "lucide-react";
import { useCatalog, useOrders } from "../hooks/useStore";
import { deliveryService } from "../services/store";
import { categories } from "../data/products";
import { money } from "../utils/shop";
import { logoutDemo } from "../services/demoAuth";
import ProductManager from "../components/admin/ProductManager";
import InventoryManager from "../components/admin/InventoryManager";
import DashboardStats from "../components/admin/DashboardStats";
import OrdersManager, {
  OrderStats,
  OrderList,
} from "../components/admin/OrdersManager";
import "../styles/admin.css";

const sections = [
  ["", "لوحة التحكم", LayoutDashboard],
  ["products", "المنتجات", Package],
  ["inventory", "المخزون", Boxes],
  ["orders", "الطلبات", ShoppingBag],
  ["categories", "التصنيفات", Tags],
  ["delivery", "مناطق التوصيل", Truck],
];
export default function Admin() {
  const navigate = useNavigate();
  const { section = "" } = useParams();
  const products = useCatalog();
  const orders = useOrders();
  const [error, setError] = useState("");
  const current = sections.find(([id]) => id === section);
  function logout() {
    try {
      logoutDemo();
      navigate("/admin/login", { replace: true });
    } catch {
      setError("تعذّر تسجيل الخروج. اسمح بالتخزين المحلي ثم حاول مجدداً.");
    }
  }
  return (
    <div className="admin-shell" dir="rtl">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span>B40</span>
          <small>مساحة الإدارة</small>
        </div>
        <nav aria-label="أقسام الإدارة">
          {sections.map(([id, label, Icon]) => (
            <NavLink key={id} end to={`/admin${id ? `/${id}` : ""}`}>
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <NavLink to="/shop">
            <ArrowUpLeft size={18} /> زيارة المتجر
          </NavLink>
          <button type="button" onClick={logout}>
            <LogOut size={18} /> تسجيل الخروج
          </button>
        </div>
      </aside>
      <div className="admin-content">
        <header className="admin-heading">
          <div>
            <span className="eyebrow">B40 / إدارة المتجر</span>
            <h1>{current?.[1] || "القسم غير موجود"}</h1>
          </div>
          <span className="admin-demo-label">نسخة تجريبية</span>
        </header>
        <p className="admin-demo-note">
          تُحفظ المنتجات والطلبات في هذا المتصفح فقط. الطلبات المعروضة تجريبية.
        </p>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {section === "" ? (
          <>
            <DashboardStats products={products} orders={orders} />
            <OrderStats orders={orders} />
            <div className="admin-welcome">
              <div>
                <span className="eyebrow">كل التفاصيل في مكان واحد</span>
                <h2>جاهز ليوم جديد في B40؟</h2>
                <p>تابع الطلبات وحدّث تشكيلتك بسهولة.</p>
              </div>
              <NavLink className="button" to="/admin/products">
                إدارة المنتجات <ArrowUpLeft size={18} />
              </NavLink>
            </div>
            <div className="section-heading">
              <h2>آخر الطلبات</h2>
              <NavLink className="text-link" to="/admin/orders">
                عرض جميع الطلبات <ArrowUpLeft size={16} />
              </NavLink>
            </div>
            <OrderList
              compact
              orders={[...orders]
                .sort(
                  (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
                )
                .slice(0, 5)}
            />
          </>
        ) : section === "products" ? (
          <ProductManager products={products} />
        ) : section === "orders" ? (
          <OrdersManager orders={orders} />
        ) : section === "inventory" ? (
          <InventoryManager products={products} />
        ) : section === "categories" ? (
          <div className="admin-reference-grid">
            {categories.map((c) => (
              <article className="admin-panel" key={c}>
                <Tags size={22} />
                <h2>{c}</h2>
                <p>{products.filter((p) => p.category === c).length} منتجات</p>
              </article>
            ))}
          </div>
        ) : section === "delivery" ? (
          <div className="admin-reference-grid">
            {deliveryService.zones().map((z) => (
              <article className="admin-panel" key={z.id}>
                <Truck size={22} />
                <h2>{z.name}</h2>
                <p>{money(z.price)} · سعر تجريبي</p>
              </article>
            ))}
          </div>
        ) : (
          <NavLink className="button" to="/admin">
            العودة إلى لوحة التحكم
          </NavLink>
        )}
      </div>
    </div>
  );
}
