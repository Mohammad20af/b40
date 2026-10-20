import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { categories } from "../../data/products";
import { storeInfo } from "../../data/branches";
import { catalogService } from "../../services/store";
import { money } from "../../utils/shop";
import AdminDialog from "./AdminDialog";
import ProductImages from "./ProductImages";

export default function ProductManager({ products }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dialog, setDialog] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const counts = new Map(categories.map((name) => [name, 0]));
  for (const product of products)
    counts.set(product.category, (counts.get(product.category) || 0) + 1);
  const categoryCount = category ? counts.get(category) || 0 : products.length;
  const filtered = products.filter(
    (p) =>
      (!category || p.category === category) &&
      `${p.name} ${p.category} ${p.sku}`
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase()),
  );
  function addProduct() {
    setDialog({ type: "edit", initialCategory: category });
    setNotice("");
  }
  function remove() {
    try {
      catalogService.remove(dialog.product.id);
      setDialog(null);
      setNotice("تم حذف المنتج.");
    } catch {
      setError("تعذّر حفظ الحذف. تحقق من مساحة التخزين وإعدادات المتصفح.");
    }
  }
  return (
    <>
      <div
        className="admin-product-filters"
        role="group"
        aria-label="تصنيف المنتجات"
      >
        <button
          type="button"
          aria-pressed={category === ""}
          onClick={() => setCategory("")}
        >
          كل المنتجات <span>({products.length})</span>
        </button>
        {categories.map((name) => (
          <button
            type="button"
            key={name}
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
          >
            {name} <span>({counts.get(name)})</span>
          </button>
        ))}
      </div>
      <div className="admin-toolbar">
        <label className="search">
          <Search size={19} />
          <input
            aria-label="ابحث عن منتج"
            placeholder="ابحث باسم المنتج أو التصنيف أو SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <button className="button" onClick={addProduct}>
          <Plus size={18} /> إضافة منتج
        </button>
      </div>
      <p className="admin-result-count">
        {filtered.length} من {categoryCount} منتج
      </p>
      <p role="status" className="admin-notice">
        {notice}
      </p>
      {filtered.length ? (
        <div className="admin-product-grid">
          {filtered.map((p) => (
            <article className="admin-product-card" key={p.id}>
              <img src={p.images[0]} alt={p.name} width="280" height="210" />
              <div className="admin-product-body">
                <div className="admin-product-meta">
                  <span>{p.category}</span>
                  <span
                    className={`status-badge ${p.available ? "status-ready" : "status-cancelled"}`}
                  >
                    {p.available ? "متوفر" : "غير متوفر"}
                  </span>
                </div>
                <h2>{p.name}</h2>
                <p className="small muted">
                  SKU: <bdi>{p.sku}</bdi>
                </p>
                <strong className="admin-product-price">
                  {money(p.price)}
                </strong>
                <p className="small muted">
                  الفرع: {p.branch?.name || storeInfo.name}
                </p>
                <p className="small muted">
                  المقاسات: <bdi>{p.sizes.join(" / ")}</bdi>
                </p>
                <p className="small muted">
                  الألوان: {p.colors.map((c) => c.name).join("، ")}
                </p>
                <div className="admin-product-actions">
                  <button
                    className="button-outline"
                    aria-label={`تعديل ${p.name}`}
                    onClick={() => setDialog({ type: "edit", product: p })}
                  >
                    <Pencil size={16} /> تعديل
                  </button>
                  <button
                    className="icon-button admin-danger"
                    aria-label={`حذف ${p.name}`}
                    onClick={() => {
                      setError("");
                      setDialog({ type: "delete", product: p });
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-empty">
          <h2>
            {category && categoryCount === 0
              ? "لا توجد منتجات في هذا التصنيف"
              : "لا توجد منتجات بهذا البحث"}
          </h2>
          <p>أضف منتجاً أو غيّر كلمات البحث.</p>
          <button type="button" className="button" onClick={addProduct}>
            <Plus size={18} /> إضافة منتج
          </button>
        </div>
      )}
      {dialog?.type === "edit" && (
        <ProductEditor
          product={dialog.product}
          initialCategory={dialog.initialCategory}
          close={() => setDialog(null)}
          saved={() => {
            setDialog(null);
            setNotice("تم حفظ المنتج بنجاح.");
          }}
        />
      )}
      {dialog?.type === "delete" && (
        <AdminDialog title="حذف منتج" close={() => setDialog(null)}>
          <p>
            هل تريد حذف «{dialog.product.name}» من المتجر؟ تبقى تفاصيله في
            الطلبات السابقة.
          </p>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <div className="admin-dialog-actions">
            <button className="button admin-delete-button" onClick={remove}>
              تأكيد الحذف
            </button>
            <button className="button-outline" onClick={() => setDialog(null)}>
              تراجع
            </button>
          </div>
        </AdminDialog>
      )}
    </>
  );
}

function ProductEditor({ product, initialCategory, close, saved }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    price: product?.price ?? "",
    category: product?.category || initialCategory || categories[0],
    sizes: product?.sizes.join(", ") || "S, M, L, XL",
    colors: product?.colors.map((c) => c.name).join("، ") || "أسود، رمادي",
    description: product?.description || "",
    available: product?.available ?? true,
  });
  const [images, setImages] = useState(product?.images || []);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const change = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  function submit(e) {
    e.preventDefault();
    if (busy) return;
    const split = (value) => [
      ...new Set(
        value
          .split(/[,،\s]+/)
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ];
    const sizes = split(form.sizes);
    const colorNames = [
      ...new Set(
        form.colors
          .split(/[,،]+/)
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ];
    if (
      !form.name.trim() ||
      !sizes.length ||
      !colorNames.length ||
      !images.length ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      setError(
        "أدخل اسم المنتج والسعر والمقاسات والألوان واختر صورة قبل الحفظ.",
      );
      return;
    }
    try {
      catalogService.save({
        ...product,
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        sizes,
        colors: colorNames.map(
          (name) =>
            product?.colors.find((c) => c.name === name) || {
              name,
              hex: name === "رمادي" ? "#858580" : "#242424",
            },
        ),
        images,
        branch: product?.branch || storeInfo,
      });
      saved();
    } catch (error) {
      setError(
        error.code === "INVALID_SKU"
          ? error.message
          : "تعذّر حفظ المنتج. قد تكون مساحة التخزين ممتلئة؛ جرّب صورة أصغر وتحقق من إعدادات المتصفح.",
      );
    }
  }
  return (
    <AdminDialog title={product ? "تعديل منتج" : "إضافة منتج"} close={close}>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label className="wide">
            رمز المنتج / SKU
            <input
              dir="ltr"
              maxLength={80}
              value={form.sku}
              placeholder="يُنشأ تلقائياً عند تركه فارغاً"
              onChange={(event) => change("sku", event.target.value)}
            />
          </label>
          <label className="wide">
            اسم المنتج
            <input
              required
              maxLength={120}
              value={form.name}
              onChange={(e) => change("name", e.target.value)}
            />
          </label>
          <label>
            السعر
            <input
              type="number"
              min="0"
              max="1000000"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => change("price", e.target.value)}
            />
          </label>
          <label>
            التصنيف
            <select
              value={form.category}
              onChange={(e) => change("category", e.target.value)}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            الفرع
            <select value={product?.branch?.id || storeInfo.id} readOnly>
              <option value={product?.branch?.id || storeInfo.id}>
                {product?.branch?.name || storeInfo.name}
              </option>
            </select>
          </label>
          <label>
            حالة المنتج
            <select
              value={form.available ? "yes" : "no"}
              onChange={(e) => change("available", e.target.value === "yes")}
            >
              <option value="yes">متوفر</option>
              <option value="no">غير متوفر</option>
            </select>
          </label>
          <label>
            المقاسات
            <input
              required
              maxLength={150}
              dir="ltr"
              value={form.sizes}
              onChange={(e) => change("sizes", e.target.value)}
            />
          </label>
          <label>
            الألوان
            <input
              required
              maxLength={150}
              value={form.colors}
              onChange={(e) => change("colors", e.target.value)}
            />
          </label>
          <label className="wide">
            الوصف
            <textarea
              maxLength={2000}
              rows={3}
              value={form.description}
              onChange={(e) => change("description", e.target.value)}
            />
          </label>
        </div>
        <ProductImages
          images={images}
          setImages={setImages}
          busy={busy}
          setBusy={setBusy}
          setError={setError}
        />
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="admin-dialog-actions">
          <button className="button" type="submit" disabled={busy}>
            حفظ المنتج
          </button>
          <button type="button" className="button-outline" onClick={close}>
            إلغاء
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}
