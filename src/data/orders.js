import { products } from "./products";
import { storeInfo, deliveryZones } from "./branches";

export const orderStatuses = [
  {
    id: "new",
    label: "جديد",
    stat: "الطلبات الجديدة",
    next: "preparing",
    action: "بدء التجهيز",
  },
  {
    id: "preparing",
    label: "قيد التجهيز",
    stat: "قيد التجهيز",
    next: "ready",
    action: "الطلب جاهز",
  },
  {
    id: "ready",
    label: "جاهز",
    stat: "الطلبات الجاهزة",
    next: "delivered",
    action: "تم التسليم",
  },
  { id: "delivered", label: "تم التسليم", stat: "الطلبات المكتملة" },
  { id: "cancelled", label: "ملغي" },
];
// Clearly marked sample orders, used until this browser has saved orders.
export const demoOrders = orderStatuses.map((status, index) => ({
  id: `B40-DEMO-0${index + 1}`,
  simulated: true,
  status: status.id,
  createdAt: `2026-09-${String(16 - index).padStart(2, "0")}T09:30:00.000Z`,
  customer: {
    name: `عميل تجريبي ${index + 1}`,
    phone: "0500000000",
    area: "وسط المدينة",
    address: "عنوان تجريبي — الشارع الرئيسي",
    notes: "طلب توضيحي لتجربة إدارة الطلبات",
  },
  items: [
    {
      product: products[index],
      quantity: 1,
      size: products[index].sizes[0],
      color: "أسود",
    },
  ],
  branch: storeInfo,
  zone: deliveryZones[1],
  subtotal: products[index].price,
  delivery: deliveryZones[1].price,
}));
