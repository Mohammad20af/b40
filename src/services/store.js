import { products } from "../data/products";
import { deliveryZones } from "../data/branches";

// Replace these adapters with API requests when the backend is available.
export const catalogService = {
  list: () => products,
  get: (id) => products.find((p) => p.id === id),
};
export const deliveryService = {
  zones: () => deliveryZones,
  quote: (zoneId) => deliveryZones.find((z) => z.id === zoneId)?.price ?? 0,
};
export const orderService = {
  preview: async (order) => ({
    ...order,
    id: `B40-${Date.now().toString(36).toUpperCase()}`,
    simulated: true,
  }),
};
