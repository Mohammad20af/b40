# Frontend validation — 2026-09-09

- `npm run build`: passed; production assets generated successfully.
- `npm run format:check`: passed.
- `npm test`: 4 logic tests passed.
- `npm run test:e2e`: 14 Chrome browser tests passed.
- Main browser profiles: 1440 × 1000 desktop and 390 × 844 touch/mobile.
- Additional layout checks: 320, 375, 768, and 1024 px widths.
- All eight pages, unknown routes, and missing products render without JavaScript console errors or broken images.
- Checked Arabic RTL, horizontal overflow, reduced motion, gallery changes, navigation, product filters, cart variants/quantity/persistence/removal, corrupt localStorage recovery, unavailable stock, checkout field validation, delivery totals, WhatsApp message/branch selection, contact links, and admin dialogs/menu keyboard dismissal.
- Inspected rendered desktop and mobile homepage screenshots. The generated concept is separately stored in `docs/b40-concept.png` and is not an application screenshot.
- Source scan found no common API-token/private-key signatures. No environment files, dependencies, build output, or private-key files are tracked. Supplied branch contact numbers are intentional public content.

Issues corrected: unavailable Instagram icon export (replaced with a camera icon), missing favicon, unwanted scroll resets during filtering, explicit contact selector labeling, and Arabic numerals differing between browser and Node runtimes. Test locators were refined to distinguish quantity outputs from toast announcements and wait for router filter updates.

Limitations: mock stock, mock delivery pricing, illustrative product photos, simulated orders, and visual-only admin. External social links and WhatsApp URLs were validated without sending messages. No backend or payment processing is present. Browser coverage is Chrome, not a claim of testing every browser or physical device.
