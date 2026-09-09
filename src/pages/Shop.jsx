import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import ProductCard from "../components/ProductCard";
import { categories } from "../data/products";
import { catalogService } from "../services/store";
import { filterProducts, money } from "../utils/shop";
import { TextReveal } from "../components/ScrollMotion";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filters = {
    search: params.get("q") || "",
    category: params.get("category") || "",
    size: params.get("size") || "",
    maxPrice: params.get("price") || 400,
    available: params.get("available") === "true",
    sort: params.get("sort") || "new",
  };
  const update = (key, value) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  const results = filterProducts(catalogService.list(), filters);
  return (
    <div className="container page">
      <TextReveal className="page-heading">
        <span className="eyebrow">اكتشف ما يشبهك</span>
        <h1>
          كل قطعة. <span className="accent">حكاية.</span>
        </h1>
        <p>ملابس وأحذية تختارها على طريقتك.</p>
      </TextReveal>
      <div className="shop-toolbar">
        <label className="search">
          <Search size={19} />
          <input
            aria-label="ابحث عن منتج"
            placeholder="ابحث عن قطعتك القادمة..."
            value={filters.search}
            onChange={(e) => update("q", e.target.value)}
          />
        </label>
        <button
          className="filter-toggle button-outline"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersHorizontal size={18} /> تصفية
        </button>
        <label className="sort-label">
          ترتيب حسب
          <select
            aria-label="ترتيب المنتجات"
            value={filters.sort}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="new">الأحدث</option>
            <option value="low">السعر: الأقل أولاً</option>
            <option value="high">السعر: الأعلى أولاً</option>
          </select>
        </label>
      </div>
      <div className="shop-layout">
        <aside className={`filters ${filtersOpen ? "filters-open" : ""}`}>
          <div className="filter-title">
            <h2>تصفية النتائج</h2>
            <button className="text-button" onClick={() => setParams({})}>
              مسح الكل
            </button>
          </div>
          <fieldset>
            <legend>التصنيف</legend>
            {[
              ["", "كل المنتجات"],
              ["clothing", "كل الملابس"],
              ...categories.map((c) => [c, c]),
            ].map(([value, label]) => (
              <label className="check-label" key={value}>
                <input
                  type="radio"
                  name="category"
                  value={value}
                  checked={filters.category === value}
                  onChange={() => update("category", value)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>السعر حتى {money(filters.maxPrice)}</legend>
            <input
              className="range"
              aria-label="الحد الأعلى للسعر"
              type="range"
              min="50"
              max="400"
              step="10"
              value={filters.maxPrice}
              onChange={(e) => update("price", e.target.value)}
            />
            <div className="range-labels">
              <span>50 ₪</span>
              <span>400 ₪</span>
            </div>
          </fieldset>
          <fieldset>
            <legend>المقاس</legend>
            <div className="size-options">
              {["S", "M", "L", "XL", "40", "41", "42", "43", "44"].map(
                (size) => (
                  <button
                    key={size}
                    aria-pressed={filters.size === size}
                    onClick={() =>
                      update("size", filters.size === size ? "" : size)
                    }
                  >
                    {size}
                  </button>
                ),
              )}
            </div>
          </fieldset>
          <label className="check-label">
            <input
              type="checkbox"
              checked={filters.available}
              onChange={(e) =>
                update("available", e.target.checked ? "true" : "")
              }
            />{" "}
            المتوفر فقط
          </label>
        </aside>
        <div>
          <p className="results-count" aria-live="polite">
            {results.length} قطعة بانتظارك
          </p>
          {results.length ? (
            <div className="product-grid shop-products">
              {results.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <h2>لم نجد قطعاً بهذا الاختيار</h2>
              <p>جرّب تغيير البحث أو إزالة بعض الفلاتر.</p>
              <button className="button" onClick={() => setParams({})}>
                مسح الفلاتر
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
