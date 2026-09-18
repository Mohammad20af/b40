import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, ShoppingBag, ArrowUpLeft } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { storeInfo } from "../data/branches";
import FloatingSocial from "../components/FloatingSocial";
import "../styles/storefrontTheme.css";

const links = [
  ["الرئيسية", "/"],
  ["المنتجات", "/shop"],
  ["من نحن", "/#about"],
  ["تواصل معنا", "/contact"],
];
export default function StoreLayout() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const location = useLocation();
  const isAdmin =
    location.pathname === "/admin" || location.pathname.startsWith("/admin/");
  const menuButton = useRef(null);
  const reduced = useReducedMotion();
  function followLink(to) {
    setOpen(false);
    if (
      to === "/#about" &&
      location.pathname === "/" &&
      location.hash === "#about"
    ) {
      document
        .getElementById("about")
        ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
    }
  }
  useEffect(() => {
    setOpen(false);
    if (!location.hash) window.scrollTo({ top: 0, behavior: "instant" });
    else {
      const frame = requestAnimationFrame(() =>
        document
          .getElementById(location.hash.slice(1))
          ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" }),
      );
      return () => cancelAnimationFrame(frame);
    }
  }, [location.pathname, location.hash, reduced]);
  useEffect(() => {
    setOpen(false);
  }, [location.search]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <div className={isAdmin ? "admin-layout" : "public-layout"}>
      <a className="skip-link" href="#main">
        انتقل إلى المحتوى
      </a>
      <header className="header">
        <div className="nav-shell">
          <Link to="/" className="brand" aria-label="B40 Jericho الرئيسية">
            <img
              src="/images/b40-logo.png"
              alt="B40 SPORTS"
              width="56"
              height="56"
            />
            <span>
              B40<span className="brand-small">JERICHO</span>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="التنقل الرئيسي">
            {links.map(([label, to]) => (
              <NavLink
                key={label}
                to={to}
                onClick={() => followLink(to)}
                end
                className={() =>
                  (
                    to === "/#about"
                      ? location.pathname === "/" && location.hash === "#about"
                      : location.pathname === to && !location.hash
                  )
                    ? "active"
                    : ""
                }
              >
                {label}
              </NavLink>
            ))}
            <Link
              to="/admin/login"
              className="nav-admin"
              onClick={() => followLink("/admin/login")}
            >
              دخول الإدارة
            </Link>
          </nav>
          <div className="nav-actions">
            <Link
              to="/cart"
              className="bag"
              aria-label={`حقيبة التسوق، ${count} قطع`}
            >
              <ShoppingBag size={22} />
              <span>{count}</span>
            </Link>
            <button
              ref={menuButton}
              className="menu-button icon-button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.nav
              id="mobile-nav"
              className="mobile-nav"
              aria-label="قائمة الهاتف"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
            >
              {links.map(([label, to]) => (
                <Link key={label} to={to} onClick={() => followLink(to)}>
                  {label}
                  <ArrowUpLeft size={18} />
                </Link>
              ))}
              <Link
                to="/admin/login"
                className="nav-admin"
                onClick={() => followLink("/admin/login")}
              >
                دخول الإدارة
                <ArrowUpLeft size={18} />
              </Link>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      <main
        id="main"
        className={
          location.pathname === "/admin" ||
          location.pathname.startsWith("/admin/")
            ? undefined
            : "storefront-theme"
        }
        tabIndex={-1}
      >
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container footer-main">
          <Link className="footer-wordmark" to="/" dir="ltr">
            B40 <span>JERICHO</span>
          </Link>
          <a
            href={storeInfo.instagramUrl}
            target="_blank"
            rel="noreferrer"
            dir="ltr"
          >
            Instagram: @{storeInfo.instagram}
          </a>
          <a
            href={storeInfo.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            dir="ltr"
          >
            WhatsApp: {storeInfo.phone}
          </a>
          <Link to="/admin" className="footer-admin" dir="rtl">
            دخول الإدارة
          </Link>
        </div>
        <div className="container footer-bottom" dir="ltr">
          This site was created by <span>Nexaura</span>
        </div>
      </footer>
      {!isAdmin && <FloatingSocial />}
    </div>
  );
}
