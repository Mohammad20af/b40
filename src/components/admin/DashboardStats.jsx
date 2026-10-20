import { Package, ShoppingBag, PackageX, TriangleAlert } from "lucide-react";
import { isLowStock, totalStock } from "../../utils/inventory.js";

export default function DashboardStats({ products, orders }) {
  const totals = products.map(totalStock);
  const stats = [
    ["إجمالي المنتجات", products.length, Package],
    ["إجمالي الطلبات", orders.length, ShoppingBag],
    ["المنتجات النافدة", totals.filter((n) => n === 0).length, PackageX],
    ["المخزون المنخفض", totals.filter(isLowStock).length, TriangleAlert],
  ];
  return (
    <div className="admin-stat-grid dashboard-stats">
      {stats.map(([label, count, Icon]) => (
        <article className="admin-stat" key={label}>
          <span className="admin-stat-icon">
            <Icon size={21} />
          </span>
          <span>{label}</span>
          <strong>{count}</strong>
        </article>
      ))}
    </div>
  );
}
