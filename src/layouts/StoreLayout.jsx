import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Menu,
  X,
  ShoppingBag,
  ArrowUpLeft,
  Camera as Instagram,
} from "lucide-react";
import { useCart } from "../hooks/useCart";
import { branches } from "../data/branches";

const links = [
  ["الرئيسية", "/"],
  ["المنتجات", "/shop"],
  ["الملابس", "/shop?category=clothing"],
  ["الأحذية", "/shop?category=أحذية"],
  ["الفروع", "/branches"],
  ["تواصل معنا", "/contact"],
];
export default function StoreLayout() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const location = useLocation();
  const menuButton = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
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
    <>
      <a className="skip-link" href="#main">
        انتقل إلى المحتوى
      </a>
      <div className="announcement">
        إطلالة جديدة. ثقة مختلفة. <span>اكتشف عالم B40</span>
      </div>
      <header className="header">
        <div className="nav-shell">
          <Link to="/" className="brand" aria-label="B40 الرئيسية">
            <img
              src="/images/b40-logo.png"
              alt="B40 SPORTS"
              width="56"
              height="56"
            />
            <span>
              B40<span className="brand-small">ملابس وأحذية</span>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="التنقل الرئيسي">
            {links.map(([label, to]) => (
              <NavLink
                key={label}
                to={to}
                end
                className={() =>
                  location.pathname + location.search === to ? "active" : ""
                }
              >
                {label}
              </NavLink>
            ))}
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
                <Link key={label} to={to}>
                  {label}
                  <ArrowUpLeft size={18} />
                </Link>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Link className="footer-wordmark" to="/">
              B40<span>®</span>
            </Link>
            <p>
              ستايلك يحكي عنك.
              <br />
              خلي إطلالتك تترك أثر.
            </p>
          </div>
          <div>
            <h3>اكتشف</h3>
            <Link to="/shop">كل المنتجات</Link>
            <Link to="/shop?category=clothing">الملابس</Link>
            <Link to="/shop?category=أحذية">الأحذية</Link>
            <Link to="/contact">تواصل معنا</Link>
          </div>
          <div>
            <h3>فروعنا</h3>
            {branches.map((b) => (
              <Link to="/branches" key={b.id}>
                {b.name}
              </Link>
            ))}
            <Link to="/admin">معاينة الإدارة</Link>
          </div>
          <div>
            <h3>خلّيك قريب</h3>
            <p>آخر القطع، وأحدث الإطلالات.</p>
            <a
              href="https://www.instagram.com/b.40.s/"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={17} /> إنستغرام
              <ArrowUpLeft size={15} />
            </a>
            <a
              href="https://wa.me/972522760661"
              target="_blank"
              rel="noreferrer"
            >
              واتساب
              <ArrowUpLeft size={15} />
            </a>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} B40. جميع الحقوق محفوظة.</span>
          <span dir="ltr">
            This site was created by <span className="accent">Nexaura</span>
          </span>
        </div>
      </footer>
    </>
  );
}
