# Product and order features

## Data and behavior

- **SKU:** `catalogService` normalizes codes to uppercase and trims whitespace. Create/edit rejects duplicate codes, including case-only differences. Empty codes receive an ID-based default such as `B40-P-001`. Startup migrates valid legacy product records and persists codes, preserving images, inventory and other fields. Invalid storage is not overwritten by migration. Existing explicit codes are reserved before defaults are assigned.
- **Images:** Products retain the existing ordered `images` array. `ProductImages` uses the existing browser image converter to accept multiple JPG/PNG/WEBP files, append images, replace the primary image, remove individual images, reorder images, or move an image to the first position. The first image remains the product-card image. Customer thumbnails select the large image and wrap on small screens. Single-image products remain supported.
- **Cart:** The existing `CartProvider` reads/writes through `cartService` in `services/store.js`. Stored lines contain only product ID, size, color and quantity. Product details and stock limits come from the catalog. The unchanged navbar badge sums line quantities and restores on page load.
- **Delivery and notes:** Checkout reuses the six configured regions and prices in `data/branches.js` through `deliveryService`; no prices were changed. Region changes immediately update delivery and total. Optional multiline notes remain in `order.customer.notes`, and blank notes are hidden from order details.
- **Orders and confirmation:** Orders remain in the existing order service with stable sequential `B40-1001`-style IDs. Existing IDs are retained. The service checks stock, calculates prices from the catalog and delivery configuration, and saves a product snapshot containing name, SKU, unit price and the primary image. Confirmation at `/checkout?order=<saved-id>` reads the saved order, including customer/address, variants, quantities, prices, region, delivery, total and notes. Refreshing this URL does not create another order. Missing orders show an empty state. Later catalog edits do not change order snapshots.
- **Admin orders:** Existing filters, search, counts and status controls are reused. Status IDs remain `new`, `preparing`, `ready`, `delivered`, `cancelled`; the preparing label is now `قيد التحضير`. Changes remain persistent.
- **Dashboard:** Four added cards use the reactive catalog/orders hooks. Counts are catalog length, order-list length (including the project's existing sample orders), zero-total-stock products, and products with total stock 1–2. Inventory and dashboard reuse `LOW_STOCK_THRESHOLD` and `isLowStock`. Existing order-status cards remain available.

## Storage

| Key | Contents |
| --- | --- |
| `b40-products-v1` | Existing catalog, including SKU, image arrays and per-size stock |
| `b40-cart-v1` | Minimal cart lines |
| `b40-orders-v1` | Saved orders, item snapshots, notes, region/pricing and status |

All data is local to the browser and site origin. Clearing site data removes it; image galleries share the browser's localStorage quota. Failed product/order saves keep the form available and show an error. Confirmation links resolve only where that order exists locally. This frontend does not provide shared stock, server authentication or cross-device SKU uniqueness. Inventory remains admin-managed; orders validate stock without automatically deducting it.

For a future backend, replace the catalog/cart/order/image adapters and connect the existing hooks to an asynchronous cache. Enforce unique SKUs and atomic order/stock operations on the server. No backend, new dependency, authentication change, category, branding or navbar redesign was added.

## Files

Created:

- `src/utils/catalog.js`
- `src/components/admin/ProductImages.jsx`
- `src/components/admin/DashboardStats.jsx`
- `src/components/OrderConfirmation.jsx`
- `tests/store.test.js`
- `tests/e2e/catalog-checkout.spec.js`
- `docs/catalog-checkout.md`

Modified:

- `src/services/store.js`, `src/hooks/useCart.jsx`, `src/main.jsx`
- `src/components/admin/ProductManager.jsx`, `InventoryManager.jsx`, `OrdersManager.jsx`
- `src/pages/Admin.jsx`, `Checkout.jsx`, `Product.jsx`
- `src/data/orders.js`, `src/utils/inventory.js`
- `src/styles/admin.css`, `src/styles/global.css`
- `tests/e2e/admin-management.spec.js`, `inventory.spec.js`, `store.spec.js`
- `playwright.config.js` (tablet coverage for the new feature flows)
- `docs/inventory.md`

## Verification

Run `npm test`, `npm run test:e2e`, `npm run build`, and `npm run format:check`. No lint script is configured. Coverage includes legacy SKU migration and collisions, unique SKU edits/search, gallery changes and single-image compatibility, cart quantity totals and reloads, all configured delivery prices, saved confirmation details, optional notes, status filters/transitions, live dashboard updates and responsive layouts.

Validation results: production build, all 14 unit tests, formatting and `git diff --check` passed. The 78 desktop/mobile browser cases and four tablet feature cases passed across the full run and focused reruns. Existing image-test selectors were made exact to distinguish the primary-image removal control from gallery controls. Multi-tab tests explicitly return focus before interacting with the original page; earlier reruns had intermittent background-page loading timeouts.
