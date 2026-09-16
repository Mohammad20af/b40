import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function AdminDialog({ title, close, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current.querySelector("button")?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  function onKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
    if (e.key !== "Tab") return;
    const elements = [
      ...ref.current.querySelectorAll(
        "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]",
      ),
    ].filter((el) => el.getClientRects().length);
    const first = elements[0],
      last = elements.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        className="modal admin-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        ref={ref}
        onKeyDown={onKeyDown}
      >
        <button
          type="button"
          className="icon-button modal-close"
          aria-label="إغلاق"
          onClick={close}
        >
          <X />
        </button>
        <h2 id="admin-dialog-title">{title}</h2>
        {children}
      </section>
    </div>
  );
}
