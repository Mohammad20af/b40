import { useState } from "react";
import { Plus, Pencil, Trash2, X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { catalogService, deliveryService } from "../services/store";
import { categories } from "../data/products";
import { money } from "../utils/shop";
import { logoutDemo } from "../services/demoAuth";
import "../styles/adminAuth.css";

export default function Admin() {
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState("");
  function logout() {
    try {
      logoutDemo();
      navigate("/admin/login", { replace: true });
    } catch {
      setLogoutError(
        "تعذّر تسجيل الخروج. اسمح بالتخزين المحلي في المتصفح ثم حاول مجدداً.",
      );
    }
  }
  const [tab, setTab] = useState("المنتجات"),
    [preview, setPreview] = useState(null);
  const products = catalogService.list();
  return (
    <div className="container page">
      <div className="page-heading">
        <span className="eyebrow">B40 JERICHO / مساحة الإدارة</span>
        <h1>لوحة التحكم</h1>
        <p>معاينة تصميم فقط — جميع البيانات تجريبية والتغييرات غير محفوظة.</p>
        <button
          className="button-outline admin-logout"
          type="button"
          onClick={logout}
        >
          <LogOut size={17} /> تسجيل الخروج
        </button>
        {logoutError && (
          <p className="error admin-logout-error" role="alert">
            {logoutError}
          </p>
        )}
      </div>
      <div className="admin-tabs" role="tablist" aria-label="أقسام الإدارة">
        {["المنتجات", "الطلبات", "التصنيفات", "مناطق التوصيل"].map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            aria-controls="admin-panel"
            id={`tab-${t}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="admin-panel" aria-labelledby={`tab-${tab}`}>
        <div className="section-heading">
          <h2>{tab}</h2>
          {tab === "المنتجات" && (
            <button
              className="button"
              onClick={() => setPreview({ type: "edit", product: null })}
            >
              <Plus size={18} /> إضافة منتج
            </button>
          )}
        </div>
        {tab === "المنتجات" ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {[
                    "الصور",
                    "اسم المنتج",
                    "السعر",
                    "القسم",
                    "المقاسات",
                    "الألوان",
                    "حالة التوفر",
                    "الإجراءات",
                  ].map((t) => (
                    <th key={t}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        width="45"
                        height="56"
                      />
                    </td>
                    <td>{p.name}</td>
                    <td>{money(p.price)}</td>
                    <td>{p.category}</td>
                    <td dir="ltr">{p.sizes.join(" / ")}</td>
                    <td>{p.colors.map((c) => c.name).join("، ")}</td>
                    <td>
                      <span className={p.available ? "stock" : "muted"}>
                        {p.available ? "متوفر" : "غير متوفر"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-button"
                          aria-label={`تعديل ${p.name}`}
                          onClick={() =>
                            setPreview({ type: "edit", product: p })
                          }
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`حذف ${p.name}`}
                          onClick={() =>
                            setPreview({ type: "delete", product: p })
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === "الطلبات" ? (
          <div className="admin-empty">
            <h3>معاينة الطلبات</h3>
            <p>لا توجد طلبات حقيقية. تظهر هنا بيانات تجريبية للتصميم.</p>
            <div className="summary-line">
              <span>B40-DEMO-01 · عميل تجريبي</span>
              <span>قيد التجهيز · ٣٤٩ ₪</span>
            </div>
          </div>
        ) : tab === "التصنيفات" ? (
          <div className="admin-stats">
            {categories.map((c) => (
              <div className="summary" key={c}>
                <h3>{c}</h3>
                <p>{products.filter((p) => p.category === c).length} منتجات</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-stats">
            {deliveryService.zones().map((z) => (
              <div className="summary" key={z.id}>
                <h3>{z.name}</h3>
                <p>{money(z.price)} · سعر تجريبي</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {preview && (
        <PreviewDialog preview={preview} close={() => setPreview(null)} />
      )}
    </div>
  );
}
function PreviewDialog({ preview, close }) {
  return (
    <div className="modal-backdrop" onClick={close}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="معاينة إجراء الإدارة"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
          if (e.key === "Tab") {
            const buttons = [
              ...e.currentTarget.querySelectorAll("button,input,select"),
            ];
            const first = buttons[0],
              last = buttons.at(-1);
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <button
          autoFocus
          className="icon-button modal-close"
          aria-label="إغلاق"
          onClick={close}
        >
          <X />
        </button>
        <h2>
          {preview.type === "delete"
            ? "معاينة حذف منتج"
            : preview.product
              ? "تعديل منتج"
              : "إضافة منتج"}
        </h2>
        <p>واجهة تجريبية. لن تتغير بيانات المنتجات.</p>
        {preview.type === "edit" ? (
          <div className="form-grid">
            <label className="wide">
              اسم المنتج
              <input defaultValue={preview.product?.name || ""} />
            </label>
            <label>
              السعر
              <input
                type="number"
                min="0"
                defaultValue={preview.product?.price || ""}
              />
            </label>
            <label>
              القسم
              <select defaultValue={preview.product?.category || categories[0]}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="wide">
              الصور
              <input
                placeholder="رابط صورة تجريبي"
                defaultValue={preview.product?.images[0] || ""}
              />
            </label>
            <label>
              المقاسات
              <input
                defaultValue={
                  preview.product?.sizes.join(", ") || "S, M, L, XL"
                }
              />
            </label>
            <label>
              الألوان
              <input defaultValue="أسود، رمادي" />
            </label>
            <label>
              حالة التوفر
              <select
                defaultValue={
                  preview.product?.available === false ? "no" : "yes"
                }
              >
                <option value="yes">متوفر</option>
                <option value="no">غير متوفر</option>
              </select>
            </label>
          </div>
        ) : (
          <p>{preview.product.name} — لن يتم حذف هذه القطعة.</p>
        )}
        <button className="button full" onClick={close}>
          إغلاق المعاينة
        </button>
      </section>
    </div>
  );
}
