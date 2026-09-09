import { branches } from "../data/branches";
import BranchCard from "../components/BranchCard";
import { Reveal } from "../components/UI";
export default function Branches() {
  return (
    <div className="container page">
      <div className="page-heading">
        <span className="eyebrow">ثلاثة فروع. ستايل واحد.</span>
        <h1>
          تعال، <span className="accent">خلّينا نشوفك.</span>
        </h1>
        <p>
          جرّب القطع، اكتشف التفاصيل، واختار إطلالتك عن قرب.
          <br />
          تواصل مع الفرع لمعرفة الموقع وساعات الدوام.
        </p>
      </div>
      <div className="branch-grid">
        {branches.map((b, i) => (
          <Reveal key={b.id} delay={i * 0.1}>
            <BranchCard branch={b} index={i} />
          </Reveal>
        ))}
      </div>
      <div className="branch-banner">
        <span className="eyebrow">B40 / في كل مكان</span>
        <h2>
          قريبين منك.
          <br />
          ومن ستايلك.
        </h2>
      </div>
    </div>
  );
}
