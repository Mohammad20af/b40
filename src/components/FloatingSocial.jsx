import { createLucideIcon, MessageCircle } from "lucide-react";
import { storeInfo } from "../data/branches";
import "../styles/floatingSocial.css";
// This Lucide release omits brand exports; use its renderer for the camera mark.
const InstagramMark = createLucideIcon("InstagramMark", [
  ["rect", { x: 3, y: 3, width: 18, height: 18, rx: 5, key: "frame" }],
  ["circle", { cx: 12, cy: 12, r: 4, key: "lens" }],
  [
    "circle",
    {
      cx: 17.5,
      cy: 6.5,
      r: 0.6,
      fill: "currentColor",
      stroke: "none",
      key: "flash",
    },
  ],
]);
export default function FloatingSocial() {
  return (
    <nav className="floating-social" aria-label="التواصل الاجتماعي">
      {[
        {
          label: "تواصل معنا عبر واتساب",
          href: storeInfo.whatsappUrl,
          Icon: MessageCircle,
        },
        {
          label: "تابعنا على إنستغرام",
          href: storeInfo.instagramUrl,
          Icon: InstagramMark,
        },
      ].map(({ label, href, Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
        >
          <Icon size={23} aria-hidden="true" />
          <span className="social-tooltip" aria-hidden="true">
            {label}
          </span>
        </a>
      ))}
    </nav>
  );
}
