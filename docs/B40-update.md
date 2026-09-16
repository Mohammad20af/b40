# B40 store update

The existing public design, logo, twelve initial products, branch/contact data, Instagram links, cart, checkout and demo login remain in place. The admin now supports persistent local product and order management in Arabic RTL. The development server is available at http://127.0.0.1:4173 while its process is running.

## Features

- Floating WhatsApp and Instagram links on public pages, with orange hover/focus states, Arabic tooltips, reduced-motion support and mobile placement.
- Admin overview, product management and order management routes, plus the existing category and delivery information.
- File-based image selection and preview, replacement, removal and drag-and-drop. JPG/JPEG, PNG and WEBP files are validated and resized for local storage. Removing a main image preserves the remaining gallery images.
- Persistent product creation, editing, availability and deletion; storefront/cart updates also propagate across tabs.
- Orders include customer, telephone, items, variants, quantities, totals, address, branch and date. Status actions progress through new, preparing, ready and delivered, with cancellation for active orders.
- Status colors, counters, filtering and search by order number, customer name or phone, including Arabic digits.
- Checkout previews are saved as simulated dashboard orders while retaining the existing manual WhatsApp flow.

## Demo storage

Data stays in this browser's localStorage; no backend or production authentication was added. Five clearly labeled sample orders demonstrate the status workflow. Storage failures display errors and preserve the form. Image upload and persistence are isolated behind service adapters for a future backend connection.

Login uses the existing demo credentials: `demo@b40.example` / `B40-Demo-2026!`.

## Files added or changed

| File | Summary |
| --- | --- |
| `src/components/FloatingSocial.jsx` | Shared contact buttons using existing branch URLs and Lucide rendering. |
| `src/styles/floatingSocial.css` | Floating positions, mobile spacing, orange interactions and tooltips. |
| `src/layouts/StoreLayout.jsx` | Mounts contact buttons on public routes and scopes public/admin layouts. |
| `src/main.jsx` | Adds protected admin section routes. |
| `src/pages/Admin.jsx` | Replaces the preview with sidebar navigation, overview, statistics and retained reference sections. |
| `src/components/admin/AdminDialog.jsx` | Reusable accessible dialog with Escape dismissal, focus containment/restoration and scroll locking. |
| `src/components/admin/ProductManager.jsx` | Product cards, search, validated editor, image controls and confirmed deletion. |
| `src/components/admin/OrdersManager.jsx` | Reusable statistics, compact recent orders, full order cards, transitions, cancellation and search/filter controls. |
| `src/styles/admin.css` | Scoped black/orange dashboard styling and phone/tablet/desktop layouts. |
| `src/data/orders.js` | Shared status definitions and five explicitly simulated initial orders. |
| `src/services/store.js` | Persistent catalog/orders, validation, change subscriptions, safe writes and allowed order transitions. |
| `src/services/images.js` | Image type/size validation, decoding, resizing and WEBP storage adapter. |
| `src/hooks/useStore.js` | React subscriptions to product/order changes within and across tabs. |
| `src/hooks/useCart.jsx` | Resolves the live catalog and excludes invalid, deleted or unavailable cart entries. |
| `src/pages/Home.jsx` | Uses the live catalog for the existing featured product section. |
| `src/pages/Shop.jsx` | Uses the live catalog while preserving the existing shop filters and layout. |
| `src/pages/Product.jsx` | Reacts to catalog updates and falls back safely if the selected gallery index changes. |
| `src/pages/Checkout.jsx` | Displays a useful error when a simulated order cannot be saved. |
| `tests/e2e/admin-management.spec.js` | Browser coverage for product CRUD, uploads, drag-and-drop, gallery preservation, cross-tab updates, storage failures, order management, routes and social controls. |
| `tests/e2e/admin-auth.spec.js` | Updates the product-list assertion for the new protected products route. |
| `tests/e2e/store.spec.js` | Updates admin navigation checks and verifies checkout orders appear in the dashboard. |
| `README.md` | Documents routes, persistence, uploads, demo behavior and backend connection points. |
| `docs/B40-update.md` | This implementation and file-by-file summary. |

## Verification

- Production build and formatting checks.
- Existing four unit checks for cart, filters and WhatsApp messages.
- Chrome browser checks on desktop and mobile, including 320 px layouts, existing routes, login/logout, cart/checkout, social destinations, runtime/console errors and uploaded images.
- Product create/edit/delete and refresh persistence, JPG/PNG/WEBP upload, drag-and-drop, image replacement/removal, gallery retention and cross-tab catalog updates.
- Order transitions, cancellation, refreshed counters, filters/search and checkout-to-dashboard integration.
- Visual review of desktop dashboards and phone product management, upload preview and public contact controls.

Screenshots and traces are generated under the ignored `test-results/` directory. Production output is generated in the ignored `dist/` directory.
