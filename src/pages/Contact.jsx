import { useState } from "react";
import { branches } from "../data/branches";
import BranchCard from "../components/BranchCard";
export default function Contact() {
  const [id, setId] = useState(branches[0].id);
  const index = branches.findIndex((b) => b.id === id);
  return (
    <div className="container page contact-layout">
      <div className="page-heading">
        <span className="eyebrow">حديث بسيط. إطلالة مختلفة.</span>
        <h1>
          نحكي <span className="accent">ستايل؟</span>
        </h1>
        <p>
          عندك سؤال عن مقاس، قطعة، أو طلب؟
          <br />
          اختار الفرع وتواصل معنا مباشرة.
        </p>
        <label>
          اختر الفرع
          <select
            aria-label="اختر الفرع"
            value={id}
            onChange={(e) => setId(e.target.value)}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <BranchCard branch={branches[index]} index={index} />
    </div>
  );
}
