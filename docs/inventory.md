# Frontend inventory

Open **Admin → المخزون** (`/admin/inventory`). Each product shows its existing image, category and sizes, per-size quantities and status, and total stock. Use − / + for immediate updates, or enter a nonnegative whole number and press Enter or leave the field. Search matches product names and categories. Summary cards use the full catalog, regardless of search; low-stock products have a total of 1–2 pieces.

Inventory extends the existing product records with `stockBySize`, for example `{ "S": 5, "M": 0, "40": 3 }`. The original `sizes` array and product availability setting remain intact. Missing quantities default to 5 for products available for sale and 0 for unavailable products. Defaults are normalized on read and persisted by the startup catalog migration or the next catalog/inventory write. Invalid stored quantities resolve to 0, while explicit zero quantities stay zero. Product edits preserve the latest inventory, initialize added sizes and remove obsolete size entries.

`catalogService.setStock(id, size, quantity)` writes to the existing **`b40-products-v1` localStorage key**. There is no separate inventory catalog or new storage key. Updates notify the existing `useCatalog` subscribers within the page and through storage events in other tabs. Failed writes show an Arabic error without claiming success. Storage remains local to this browser and origin.

Product details, quick-add and availability filtering use the same inventory helpers. Stock is shared across colors of each size. Cart additions and quantity changes read the current catalog, preserve the existing 10-per-cart-line limit, and respect the remaining stock. When stock drops, cart quantities are reduced (or sold-out lines removed), persisted, and announced in Arabic. Checkout revalidates stock immediately before saving an order. Existing order creation and statuses are retained; orders do not automatically deduct or reserve inventory.

For a future API, replace the catalog service persistence methods and adapt the existing hook to an asynchronous server cache. Keep `stockBySize` and the pure inventory helpers as the UI contract. The server should authoritatively validate and atomically reserve/deduct inventory with order creation; localStorage cannot coordinate stock across devices.

Verification: `npm test`, `npm run test:e2e`, `npm run build`, and `npm run format:check`. Inventory coverage is in `tests/inventory.test.js` and `tests/e2e/inventory.spec.js`.
