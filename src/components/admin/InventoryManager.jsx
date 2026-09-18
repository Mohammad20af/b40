import { useState } from "react";
import {
  Package,
  Boxes,
  TriangleAlert,
  PackageX,
  Search,
  Minus,
  Plus,
} from "lucide-react";
import { catalogService } from "../../services/store";
import { sizeStock, stockStatus, totalStock } from "../../utils/inventory.js";

function StockBadge({ quantity }) {
  const status = stockStatus(quantity);
  return (
    <span className={`status-badge ${status.className}`}>{status.label}</span>
  );
}

function StockControl({ product, size, save }) {
  const quantity = sizeStock(product, size);
  const [draft, setDraft] = useState(null);
  function submit() {
    if (draft === null) return;
    const value = Number(draft);
    if (draft.trim() && Number.isSafeInteger(value) && value >= 0)
      save(product.id, size, value);
    setDraft(null);
  }
  return (
    <div className="inventory-size">
      <div className="inventory-size-label">
        <bdi>{size}</bdi>
        <StockBadge quantity={quantity} />
      </div>
      <div className="inventory-controls" dir="ltr">
        <button
          type="button"
          className="icon-button"
          aria-label={`تقليل مخزون ${size}`}
          disabled={quantity === 0}
          onClick={() =>
            save(
              product.id,
              size,
              Math.max(0, sizeStock(catalogService.get(product.id), size) - 1),
            )
          }
        >
          <Minus size={16} />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min="0"
          max={Number.MAX_SAFE_INTEGER}
          step="1"
          aria-label={`مخزون ${size}`}
          value={draft ?? quantity}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={submit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
            if (event.key === "Escape") setDraft(null);
          }}
        />
        <button
          type="button"
          className="icon-button"
          aria-label={`زيادة مخزون ${size}`}
          disabled={quantity === Number.MAX_SAFE_INTEGER}
          onClick={() =>
            save(
              product.id,
              size,
              sizeStock(catalogService.get(product.id), size) + 1,
            )
          }
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default function InventoryManager({ products }) {
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const totals = products.map(totalStock);
  const stats = [
    ["إجمالي المنتجات", products.length, Package],
    ["إجمالي القطع في المخزون", totals.reduce((sum, n) => sum + n, 0), Boxes],
    [
      "منتجات مخزونها منخفض",
      totals.filter((n) => n > 0 && n <= 2).length,
      TriangleAlert,
    ],
    ["منتجات نفدت من المخزون", totals.filter((n) => n === 0).length, PackageX],
  ];
  const query = search.trim().toLocaleLowerCase();
  const filtered = products.filter((p) =>
    `${p.name} ${p.category}`.toLocaleLowerCase().includes(query),
  );
  function save(id, size, quantity) {
    setError("");
    setNotice("");
    try {
      catalogService.setStock(id, size, quantity);
      setNotice("تم حفظ المخزون.");
    } catch {
      setError(
        "تعذّر حفظ المخزون. تحقق من مساحة التخزين وإعدادات المتصفح ثم حاول مجدداً.",
      );
    }
  }
  return (
    <>
      <div className="admin-stat-grid">
        {stats.map(([label, value, Icon]) => (
          <article className="admin-stat" key={label}>
            <span className="admin-stat-icon">
              <Icon size={21} />
            </span>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <div className="admin-toolbar">
        <label className="search">
          <Search size={19} />
          <input
            aria-label="بحث في المخزون"
            placeholder="بحث في المخزون..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      <p className="admin-result-count">
        {filtered.length} من {products.length} منتج
      </p>
      <p className="admin-notice" role="status">
        {notice}
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {filtered.length ? (
        <div className="inventory-grid">
          {filtered.map((product) => (
            <article
              className="admin-panel inventory-card"
              key={product.id}
              aria-label={product.name}
            >
              <header className="inventory-product">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  width="72"
                  height="90"
                  loading="lazy"
                />
                <div>
                  <span className="small muted">{product.category}</span>
                  <h2>{product.name}</h2>
                  {!product.available && (
                    <p className="small muted">المنتج غير متاح للبيع</p>
                  )}
                </div>
              </header>
              <div className="inventory-sizes">
                {product.sizes.map((size) => (
                  <StockControl
                    key={size}
                    product={product}
                    size={size}
                    save={save}
                  />
                ))}
              </div>
              <footer>
                <span>
                  إجمالي المخزون: <strong>{totalStock(product)}</strong>
                </span>
                <StockBadge quantity={totalStock(product)} />
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-empty">
          <h2>لا توجد منتجات بهذا البحث</h2>
        </div>
      )}
    </>
  );
}
