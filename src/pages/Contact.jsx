import { ArrowUpLeft, MessageCircle, Phone, Camera } from "lucide-react";
import { storeInfo } from "../data/branches";
import { TextReveal } from "../components/ScrollMotion";
export default function Contact() {
  return (
    <div className="container page contact-layout">
      <div className="contact-photo">
        <img
          src="/images/editorial.jpg"
          alt="B40 Jericho — ستايل كل يوم"
          width="1000"
          height="1250"
        />
      </div>
      <TextReveal className="contact-copy">
        <span className="eyebrow" dir="ltr">
          B40 JERICHO
        </span>
        <h1>تواصل معنا</h1>
        <p>عندك سؤال عن قطعة أو مقاس؟</p>
        <a
          className="button"
          href={storeInfo.whatsappUrl}
          target="_blank"
          rel="noreferrer"
        >
          تواصل عبر واتساب <MessageCircle size={19} />
        </a>
        <div className="contact-links">
          <a href={storeInfo.instagramUrl} target="_blank" rel="noreferrer">
            <Camera size={19} />
            <bdi>@{storeInfo.instagram}</bdi>
            <ArrowUpLeft size={18} />
          </a>
          <a href={"tel:" + storeInfo.phone}>
            <Phone size={19} />
            <bdi>{storeInfo.phone}</bdi>
            <ArrowUpLeft size={18} />
          </a>
        </div>
      </TextReveal>
    </div>
  );
}
