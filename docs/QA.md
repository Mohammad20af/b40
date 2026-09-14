# B40 Jericho review

Updated September 14, 2026.

## Storefront

- Existing React/Vite project retained, including catalog, filters, variants, gallery, persistent cart, checkout preview, and demo administration.
- Jericho is the sole store identity. Instagram: @b40.jericho. Phone/WhatsApp: +972533781655.
- Minimal four-link navigation and accessible cart. About navigation goes to the compact homepage brand section.
- Homepage: photographic hero, five existing catalog categories, four featured products, compact brand section, Instagram-style image grid, WhatsApp CTA, minimal footer.
- Product cards have a native modal quick-add flow. Explicit size selection is required; color and size are preserved in the cart. Escape and close restore focus.
- Contact and checkout no longer offer store selection. The old /branches URL redirects to /contact.
- Existing logo, locally hosted font and photography retained. No backend or new dependencies added.

## Verification

- Production build and formatting checks pass.
- Four unit tests cover cart sanitation, variant merging, filters, and Arabic order totals.
- All 34 desktop and mobile browser tests pass. Coverage includes all routes, missing products/pages, images, RTL, overflow, contact destinations, category navigation, quick add, cart persistence, checkout validation, Jericho WhatsApp message, demo login/admin, and reduced motion.
- Viewports include 320, 375, 390, 768, 1024, and 1440px. A populated cart, checkout, and quick-add dialog are explicitly checked at 320px.
- Runtime and browser console error assertions pass on the route audit and narrow-screen shopping flow.
- Screenshots are generated in ignored test-results/ for visual review.
- Source and documentation scan found no obsolete store names, handles, or phone numbers.

## Existing frontend limitations

Catalog photography and merchandise data remain illustrative. Delivery prices and order confirmation remain a local demo. WhatsApp opens a prefilled message for the customer to review and send. Instagram tiles use local photography and link to the Jericho profile; they are not a live account feed. Demo admin authentication and actions remain frontend-only.
