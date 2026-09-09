import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUpLeft,
  Truck,
  ShieldCheck,
  Camera as Instagram,
} from "lucide-react";
import { useRef } from "react";
import { Reveal, Heading } from "../components/UI";
import ProductCard from "../components/ProductCard";
import { catalogService } from "../services/store";
import { branches } from "../data/branches";

export default function Home() {
  const reduced = useReducedMotion();
  const hero = useRef(null);
  const heroVisible = useInView(hero);
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const rotateY = useSpring(x, { stiffness: 70, damping: 20 }),
    rotateX = useSpring(y, { stiffness: 70, damping: 20 });
  const { scrollYProgress } = useScroll({
    target: hero,
    offset: ["start start", "end start"],
  });
  const parallax = useTransform(scrollYProgress, [0, 1], [0, 85]);
  const products = catalogService.list();
  function tilt(e) {
    if (reduced || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(((e.clientX - rect.left) / rect.width) * 10 - 5);
    y.set(5 - ((e.clientY - rect.top) / rect.height) * 10);
  }
  return (
    <>
      <section className="hero" ref={hero}>
        <div className="hero-grid container">
          <div className="hero-copy">
            <Reveal>
              <span className="eyebrow">
                <span className="live-dot" /> حضورك. بأسلوبك.
              </span>
              <h1>
                ستايلك يبدأ
                <br />
                من <span>هنا.</span>
              </h1>
              <p>
                قطع تشبهك. وتفاصيل تفرق.
                <br />
                اكتشف عالم الملابس والأحذية بروح الشارع.
              </p>
              <div className="hero-ctas">
                <Link to="/shop" className="button">
                  تسوق الآن
                  <ArrowLeft size={20} />
                </Link>
                <Link className="text-link" to="/shop?category=أحذية">
                  اكتشف الأحذية
                  <ArrowUpLeft size={18} />
                </Link>
              </div>
              <div className="hero-note">
                <span>01 —</span> إطلالتك القادمة بانتظارك
              </div>
            </Reveal>
          </div>
          <motion.div
            className="hero-art"
            onPointerMove={tilt}
            onPointerLeave={() => {
              x.set(0);
              y.set(0);
            }}
            style={reduced ? {} : { y: parallax }}
          >
            <span className="art-coordinate">B40 / ORIGINAL</span>
            <motion.img
              src="/images/b40-logo.png"
              alt="شعار B40 الأصلي بتاج ذهبي وإضاءة برتقالية"
              width="1254"
              height="1254"
              fetchPriority="high"
              animate={!reduced && heroVisible ? { y: [0, -8, 0] } : { y: 0 }}
              transition={
                !reduced && heroVisible
                  ? { duration: 8, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0 }
              }
              style={reduced ? {} : { rotateX, rotateY }}
            />
            <div className="art-label">
              <span className="live-dot" /> صُمّم لتكون مختلفاً<span>®</span>
            </div>
          </motion.div>
        </div>
        <div className="hero-bottom container">
          <a href="#arrivals">
            اسحب لاكتشاف المزيد
            <ArrowDown size={15} />
          </a>
          <span>
            ملابس <i /> أحذية <i /> ستريت وير
          </span>
          <span className="edition">B40 — COLLECTION 01</span>
        </div>
      </section>
      <div className="ticker" aria-hidden="true">
        <span>ثقة في كل خطوة</span>
        <b>✳</b>
        <span>ستايل خارج المألوف</span>
        <b>✳</b>
        <span>أنت تصنع الفرق</span>
        <b>✳</b>
        <span>ثقة في كل خطوة</span>
      </div>
      <section className="section container" id="arrivals">
        <Heading
          eyebrow="اختيارات جديدة"
          title="وصل حديثاً"
          link="شاهد كل القطع"
        />
        <div className="product-grid">
          {products.slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>
      <section className="container collections">
        <Reveal className="collection collection-clothes">
          <img
            src="/images/editorial.jpg"
            alt="إطلالة ستريت وير عصرية"
            loading="lazy"
            width="1000"
            height="1100"
          />
          <div>
            <span className="eyebrow">أسلوبك، بدون حدود</span>
            <h2>
              البسها
              <br />
              على طريقتك.
            </h2>
            <Link className="button button-white" to="/shop?category=clothing">
              تشكيلة الملابس
              <ArrowUpLeft size={19} />
            </Link>
          </div>
        </Reveal>
        <Reveal className="collection collection-shoes">
          <img
            src="/images/shoe2.jpg"
            alt="تشكيلة الأحذية الرياضية"
            loading="lazy"
            width="900"
            height="1100"
          />
          <div>
            <span className="eyebrow">خطوة تسبق الكل</span>
            <h2>
              كل خطوة.
              <br />
              لها حضور.
            </h2>
            <Link className="button button-white" to="/shop?category=أحذية">
              تشكيلة الأحذية
              <ArrowUpLeft size={19} />
            </Link>
          </div>
        </Reveal>
      </section>
      <section className="section container">
        <Heading
          eyebrow="قطع تستحق مكانها في خزانتك"
          title="اختيارات B40"
          link="اكتشف المزيد"
        />
        <div className="product-grid">
          {products
            .filter((p) => p.featured)
            .slice(2, 6)
            .map((p, i) => (
              <Reveal key={p.id} delay={i * 0.05}>
                <ProductCard product={p} />
              </Reveal>
            ))}
        </div>
      </section>
      <Reveal className="promo">
        <div className="container promo-inner">
          <span className="eyebrow">تفاصيل أكثر. حضور أقوى.</span>
          <h2>
            مو بس لبس.
            <br />
            <span>أسلوب حياة.</span>
          </h2>
          <Link className="button button-dark" to="/shop">
            اختار إطلالتك
            <ArrowLeft size={19} />
          </Link>
          <span className="promo-mark" aria-hidden="true">
            B40
          </span>
        </div>
      </Reveal>
      <section className="section container">
        <Heading
          eyebrow="قريبين منك"
          title="مرّ علينا. جرّب الفرق."
          link="كل الفروع"
          to="/branches"
        />
        <div className="branch-preview">
          {branches.map((b, i) => (
            <Link key={b.id} to="/branches">
              <span className="muted">0{i + 1}</span>
              <h3>{b.name}</h3>
              <ArrowUpLeft />
            </Link>
          ))}
        </div>
      </section>
      <section className="instagram-section container">
        <div>
          <Instagram size={28} />
          <h2>الإطلالة تكمل فيك.</h2>
          <p>تابعنا، وخليك أول من يشوف الجديد.</p>
        </div>
        <div className="social-handles">
          {branches.map((b) => (
            <a
              key={b.id}
              href={`https://www.instagram.com/${b.instagram}/`}
              target="_blank"
              rel="noreferrer"
            >
              <span dir="ltr">@{b.instagram}</span>
              <ArrowUpLeft size={20} />
            </a>
          ))}
        </div>
      </section>
      <div className="benefits container">
        <span>
          <Truck size={20} /> توصيل إلى بابك
        </span>
        <span>
          <ShieldCheck size={20} /> الدفع عند الاستلام
        </span>
        <span>
          <ShoppingIcon /> ثلاثة فروع. ستايل واحد.
        </span>
      </div>
    </>
  );
}
function ShoppingIcon() {
  return <span aria-hidden="true">✳</span>;
}
