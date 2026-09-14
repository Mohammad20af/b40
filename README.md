# B40 Jericho frontend

Jericho-only Arabic RTL fashion storefront built with React, Vite, React Router, Framer Motion, and CSS. All catalog, delivery, checkout, and administration data is local and illustrative. The admin has a frontend-only demo login; no backend, production authentication, database, or real order submission is included.

## Run locally

Use Node.js 24 and npm. Dependencies have already been installed in this workspace. On a new checkout:

```powershell
cd C:\Users\ASUS\Desktop\b40
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173`.

```powershell
npm run build
npm run preview
```

The production bundle is written to `dist/`, which is excluded from Git. Deploy it to a static host with SPA fallback: all non-asset routes must serve `index.html`. A refresh on `/product/01` must resolve to the application. No environment variables or API keys are required.

## Implemented pages

| Route | Features |
| --- | --- |
| `/` | Fashion photography hero, five visual categories, latest products, compact brand section, Instagram image grid, WhatsApp CTA, minimal footer |
| `/shop` | Twelve products, Arabic search, category/price/size/availability filters, clear filters, price sorting, URL-based filter state |
| `/product/:id` | Image gallery, inspirational alternate view, price, sizes, colors, quantity, availability, add to bag, related products |
| `/cart` | Variant-aware cart, quantity updates, removal, subtotal, localStorage persistence |
| `/checkout` | Validated delivery form, mock delivery prices, fixed Jericho destination, cash on delivery, simulated confirmation, Arabic WhatsApp preview |
| `/branches` | Legacy URL redirects to the Jericho contact page |
| `/contact` | Jericho Instagram, WhatsApp and phone links |
| `/admin/login` | Arabic demo login with email, password, visibility toggle, and validation |
| `/admin` | Existing visual products, orders, categories and delivery preview, behind the demo login; logout added, preview actions unchanged |

Unknown routes/products and empty carts have useful recovery screens. The layout adapts to small phones, tablets and desktops, with keyboard focus indicators and reduced-motion support. Fonts and photographs are served locally. Product cards include a quick-add dialog with explicit size and color selection, keyboard dismissal, and focus restoration. Product links still open the full detail page.

## Demo admin login

With `npm run dev` on its default port:

- Login URL: `http://127.0.0.1:5173/admin/login`
- Demo email: `demo@b40.example`
- Demo password: `B40-Demo-2026!`
- Dashboard: `http://127.0.0.1:5173/admin`

These are intentionally public, fake presentation credentials. `src/services/demoAuth.js` compares them locally and saves only the `b40-demo-admin-auth` flag in localStorage. `src/components/ProtectedRoute.jsx` redirects visitors without that flag to `/admin/login`. Login redirects to the existing `/admin` page; refresh preserves the session. Logout removes only that flag, preserves the shopping cart, and redirects to the login page. Open tabs also respond to logout. Blocked localStorage displays an error instead of pretending a session was saved.

**DEMO ONLY:** this is not secure authentication. Credentials and the browser flag are visible and can be bypassed. The explicit developer comments in `demoAuth.js` and `ProtectedRoute.jsx` require replacing this flow with backend authentication and server-side authorization before production. No JWT, bcrypt, database, backend, or additional dependency was added.

Login styles are scoped in `src/styles/adminAuth.css`; the dashboard keeps its existing demo functionality and shares the Jericho visual theme.

## Project structure and customization

```text
public/images/            Original logo and local mock fashion photos
src/
  components/            Shared cards, headings, quantity controls, motion reveals
  data/products.js       Twelve mock products, variants, prices, image paths
  data/branches.js       Jericho contact details and mock delivery zones
  hooks/useCart.jsx      Cart context, persistence, notifications
  layouts/StoreLayout.jsx Navigation, mobile menu, footer
  pages/                 Storefront, existing admin, and demo login page
  services/store.js      Catalog, delivery, simulated-order adapters
  styles/global.css      Palette variables, typography, desktop/component styles
  styles/responsive.css  Phone/tablet layouts and reduced-motion overrides
  utils/shop.js          Filtering, cart sanitation, currency and WhatsApp message
  main.jsx               Routes, providers, lazy loading, error boundary
tests/
  shop.test.js           Cart/filter/message logic tests
  e2e/store.spec.js      Real-browser shopping and responsive checks
```

The supplied original artwork is already copied to `public/images/b40-logo.png`. Replace that file to update the main brand image. The second supplied screenshot could not be decoded reliably and is not required by the website. Branding has not been redrawn. The local catalog photographs are illustrative; replace them and the mock product descriptions/variants with the actual merchandise before using this as a live shop.

Colors are CSS variables at the top of `src/styles/global.css`, including `--accent`, `--bg`, `--panel`, `--text`, and `--border`. Breakpoints are in `src/styles/responsive.css`. Hero motion is in `src/pages/Home.jsx`.

## Future backend connection

- Replace `catalogService` in `src/services/store.js` with an API-backed catalog and add loading/error state at the page boundary; current catalog methods return local data synchronously.
- Replace delivery zone/quote adapters with API pricing and resolve asynchronous quotes in checkout.
- Replace `orderService.preview` with a real validated order endpoint. Server-side prices, stock and totals must become authoritative when the backend is introduced.
- Replace the current catalog-backed cart resolution with API products and availability checks.
- Replace `demoAuth.js`, `useDemoAuth.js`, and the presentation-only route guard with backend authentication and server-side authorization before converting the admin preview into real management functionality.

Checkout currently stores only the cart in localStorage. Customer information stays in React state and is not submitted. Simulated confirmation clears the cart and shows a message preview. Opening WhatsApp requires the customer's click, and the customer then sends the message manually. Refreshing the confirmation page does not retain the preview. Every checkout uses Jericho: `972533781655`. Instagram is `@b40.jericho`.

## Validation

```powershell
npm test
npm run test:e2e
npm run format:check
npm run build
```

Browser tests use locally installed Google Chrome in headless mode and automatically start Vite on port 4173. Screenshots/traces are written under ignored `test-results/`. If Chrome is unavailable, install it or change `channel` in `playwright.config.js` to your installed browser.

Checks cover route rendering, RTL, image loading, horizontal overflow, catalog filters, sizes/colors, cart refresh/quantities/removal, corrupt storage, unavailable products, checkout validation, totals, Jericho WhatsApp messages and quick-add variants, admin preview, keyboard navigation and mobile menus. QA fixed an unavailable icon export, the favicon request, query-filter scroll jumps, and browser-dependent Arabic number formatting.

`tests/e2e/admin-auth.spec.js` additionally checks direct-route redirects, valid/invalid demo login, password visibility, refresh persistence, logout, cart preservation, invalid stored flags, blocked storage, cross-tab logout, and the responsive login screen. Existing dashboard regression checks log in using `tests/e2e/helpers/admin.js` before exercising the original admin interface.

## Git and GitHub

Git was initialized before feature work, with separate commits for setup, storefront/shared foundations, catalog, cart/checkout, contact/admin pages, and QA. The `.gitignore` excludes dependencies, environment files, build output, logs, test artifacts, private key files, and local tooling directories. The empty pre-existing `main` file is left untouched and ignored.

Create a new **empty** GitHub repository called `b40` (do not initialize a README, license or gitignore), then run these PowerShell commands. The first line prompts for your actual GitHub username or organization:

```powershell
cd C:\Users\ASUS\Desktop\b40
$githubOwner = Read-Host 'GitHub username or organization'
git branch -M main
git remote add origin "https://github.com/$githubOwner/b40.git"
git push -u origin main
git status
```

No remote has been configured and nothing has been pushed. Authenticate through Git's normal browser/credential-manager flow when prompted. Do not put access tokens into source files or remote URLs. If you later add an origin yourself, use `git remote set-url origin ...` instead of `git remote add origin ...`.

For subsequent changes:

```powershell
git status
git add src
git commit -m "Describe the change"
git push
```

## Image sources

The logo is user-supplied. Illustrative fashion photography was downloaded from Unsplash and is stored locally. Source image identifiers:

| Local file | Source |
| --- | --- |
| `tee.jpg` | https://images.unsplash.com/photo-1521572163474-6864f9cf17ab |
| `shoe.jpg` | https://images.unsplash.com/photo-1542291026-7eec264c27ff |
| `hoodie.jpg` | https://images.unsplash.com/photo-1556821840-3a63f95609a7 |
| `cargo.jpg` | https://images.unsplash.com/photo-1473966968600-fa801b869a1a |
| `jacket.jpg` | https://images.unsplash.com/photo-1551028719-00167b16eac5 |
| `shoe2.jpg` | https://images.unsplash.com/photo-1549298916-b41d501d3772 |
| `editorial.jpg` | https://images.unsplash.com/photo-1488161628813-04466f872be2 |
