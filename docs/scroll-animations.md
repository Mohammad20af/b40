# Scroll animation behavior

Shared components in src/components/ScrollMotion.jsx retain the existing Framer Motion implementation.

- Reveal: once-per-mount fade and an 18px entrance over 650ms.
- TextReveal: short text enters with a 75ms stagger.
- Product and category cards reveal individually as they enter the viewport.
- ImageReveal: subtle scale and opacity transitions with hover zoom.
- ParallaxImage: the compact brand-section photo moves by ±1%, with 2.5% overscan.
- The hero photograph stays still; its short copy reveals once.

Keyboard focus reveals interactive content. Reduced-motion preferences disable stagger, zoom, and parallax. Browser tests verify viewport entry, non-replaying reveals, bounded parallax, and reduced-motion behavior on desktop and mobile.
