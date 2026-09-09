# Scroll animation behavior

Shared components live in `src/components/ScrollMotion.jsx` and preserve the existing HTML elements and layout classes.

- `Reveal`: once-per-mount viewport fade with an 18 px upward entrance, lasting 650 ms.
- `TextReveal`: staggered direct text elements, separated by 75 ms. Decorative elements marked `aria-hidden` keep their original transforms.
- Product cards: each card observes its own viewport entry, with delays of 0–165 ms. Later rows stay hidden until they enter view; filtering and shopping behavior remain unchanged.
- `ImageReveal`: a small scale-down and fade, with the existing image hover scaling retained.
- `ParallaxImage`: only the two collection photos, with travel of ±1% and 2.5% overscan to avoid exposed edges. Motion values update transforms without React state updates on every scroll.

Viewport entrances run once when 12% of the element is visible. Keyboard focus reveals interactive content. Reduced-motion users receive immediately visible, stationary content with no stagger or collection parallax. No dimensions, spacing, colors, copy, routes, product data, or checkout logic were changed. No new dependencies were added.

Validation includes viewport gating, non-replaying reveals, image scaling, bounded parallax, and reduced-motion behavior on desktop and touch/mobile, plus the existing storefront regression suite.

Build, formatting, and whitespace checks passed. All 18 browser scenarios passed: 16 in the initial run, and two page-loading checks on a targeted serial rerun after initial local-server timeouts.
