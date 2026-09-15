import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpLeft, Camera, MessageCircle } from "lucide-react";
import {
  Reveal,
  TextReveal,
  ImageReveal,
  ParallaxImage,
} from "../components/ScrollMotion";
import ProductCard from "../components/ProductCard";
import { catalogService } from "../services/store";
import { storeInfo } from "../data/branches";

const categories = [
  ["تيشيرتات", "tee"],
  ["بناطيل", "cargo"],
  ["هوديز", "hoodie"],
  ["جاكيتات", "jacket"],
  ["أحذية", "shoe"],
];
const socialImages = [
  ["editorial", "إطلالة يومية من B40"],
  ["shoe", "تفاصيل الأحذية"],
  ["hoodie", "ستايل الهوديز"],
  ["tee", "أساسيات كل يوم"],
];
export default function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <TextReveal>
            <span className="eyebrow" dir="ltr">
              B40 JERICHO
            </span>
            <h1 id="hero-title">
              ستايلك يبدأ <br />
              من هنا<span className="accent">.</span>
            </h1>
            <Link to="/shop" className="button">
              تسوق الآن <ArrowLeft size={19} />
            </Link>
          </TextReveal>
        </div>
        <div className="hero-art">
          <img
            src="/images/b40-hero.jpg"
            alt="تشكيلة ملابس وأحذية B40 السوداء في متجر بإضاءة برتقالية"
            width="941"
            height="1672"
            fetchPriority="high"
          />
          <span className="hero-photo-label" dir="ltr">
            EVERYDAY. YOUR WAY.
          </span>
        </div>
      </section>
      <section
        className="container category-section"
        aria-label="تسوق حسب التصنيف"
      >
        <div className="category-grid">
          {categories.map(([name, photo], i) => (
            <Reveal key={name} delay={i * 0.04}>
              <Link
                className="category-card"
                to={"/shop?category=" + encodeURIComponent(name)}
              >
                <div className="category-photo">
                  <ImageReveal
                    src={"/images/" + photo + ".jpg"}
                    alt=""
                    width="400"
                    height="500"
                    loading="lazy"
                  />
                </div>
                <span>
                  {name}
                  <ArrowUpLeft size={17} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <section
        className="container section arrivals"
        id="arrivals"
        aria-labelledby="arrivals-title"
      >
        <div className="section-heading">
          <TextReveal>
            <h2 id="arrivals-title">أحدث المنتجات</h2>
          </TextReveal>
          <Link className="text-link" to="/shop">
            كل المنتجات <ArrowLeft size={17} />
          </Link>
        </div>
        <div className="product-grid">
          {catalogService
            .list()
            .filter((p) => p.featured)
            .slice(0, 4)
            .map((p, i) => (
              <ProductCard product={p} index={i} key={p.id} />
            ))}
        </div>
      </section>
      <section className="brand-story container" id="about" aria-label="من نحن">
        <div className="brand-story-photo">
          <ParallaxImage
            src="/images/jacket.jpg"
            alt="تفاصيل تشكيلة الجاكيتات"
            loading="lazy"
            width="1000"
            height="1000"
          />
        </div>
        <TextReveal className="brand-story-copy">
          <h2 dir="ltr">
            B40 <span>JERICHO</span>
          </h2>
          <p>أحدث الستايلات في مكان واحد.</p>
        </TextReveal>
      </section>
      <section
        className="container section instagram-section"
        aria-labelledby="instagram-title"
      >
        <div className="section-heading">
          <TextReveal>
            <h2 id="instagram-title">
              تابعنا على <span lang="en">Instagram</span>
            </h2>
            <a
              className="instagram-handle"
              dir="ltr"
              href={storeInfo.instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              @{storeInfo.instagram}
            </a>
          </TextReveal>
          <a
            className="button-outline"
            href={storeInfo.instagramUrl}
            target="_blank"
            rel="noreferrer"
          >
            تابعنا <ArrowUpLeft size={17} />
          </a>
        </div>
        <div className="instagram-grid">
          {socialImages.map(([photo, alt], i) => (
            <Reveal key={photo} delay={i * 0.04}>
              <a
                href={storeInfo.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={alt + " — Instagram"}
              >
                <ImageReveal
                  src={"/images/" + photo + ".jpg"}
                  alt={alt}
                  loading="lazy"
                  width="500"
                  height="625"
                />
                <Camera size={22} />
              </a>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="whatsapp-cta">
        <div className="container">
          <TextReveal>
            <h2>عندك سؤال؟</h2>
            <p>تواصل معنا مباشرة عبر واتساب</p>
          </TextReveal>
          <a
            className="button"
            href={storeInfo.whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            تواصل عبر واتساب <MessageCircle size={19} />
          </a>
        </div>
      </section>
    </>
  );
}
