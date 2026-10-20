import { useEffect, useRef, useState } from "react";
import { ImagePlus, Upload, ArrowUp, ArrowDown } from "lucide-react";
import { uploadProductImage } from "../../services/images";

export default function ProductImages({
  images,
  setImages,
  busy,
  setBusy,
  setError,
}) {
  const [dragging, setDragging] = useState(false);
  const request = useRef(0);
  useEffect(
    () => () => {
      request.current++;
    },
    [],
  );
  async function choose(files, replace = false) {
    if (!files.length) return;
    const version = ++request.current;
    setBusy(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of files) uploaded.push(await uploadProductImage(file));
      if (request.current === version)
        setImages((current) => [
          ...new Set(
            replace
              ? [uploaded[0], ...current.slice(1), ...uploaded.slice(1)]
              : [...current, ...uploaded],
          ),
        ]);
    } catch (error) {
      if (request.current === version) setError(error.message);
    } finally {
      if (request.current === version) setBusy(false);
    }
  }
  function remove(index) {
    request.current++;
    setBusy(false);
    setImages((current) => current.filter((_, i) => i !== index));
  }
  function move(from, to) {
    setImages((current) => {
      const next = [...current];
      next.splice(to, 0, next.splice(from, 1)[0]);
      return next;
    });
  }
  return (
    <>
      <div
        className={`admin-upload ${dragging ? "is-dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!busy) choose([...event.dataTransfer.files], true);
        }}
      >
        {images.length ? (
          <img
            className="admin-image-preview"
            src={images[0]}
            alt="معاينة صورة المنتج"
          />
        ) : (
          <ImagePlus size={34} aria-hidden="true" />
        )}
        <strong>صور المنتج</strong>
        <span className="small muted">
          الصورة الأولى هي الرئيسية. أضف صوراً أو اسحبها هنا.
        </span>
        <label className="button-outline admin-file-label">
          <Upload size={16} />
          {images.length ? "استبدال الصورة الرئيسية" : "اختيار صورة"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={busy}
            aria-label="اختيار صورة"
            onChange={(event) => {
              choose([...event.target.files], true);
              event.target.value = "";
            }}
          />
        </label>
        <label className="button-outline admin-file-label">
          <ImagePlus size={16} /> إضافة صور
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={busy}
            aria-label="إضافة صور"
            onChange={(event) => {
              choose([...event.target.files]);
              event.target.value = "";
            }}
          />
        </label>
        {(images.length > 0 || busy) && (
          <button
            type="button"
            className="text-button admin-danger"
            onClick={() => remove(0)}
          >
            إزالة الصورة
          </button>
        )}
        <span className="small muted">
          JPG / JPEG / PNG / WEBP · حتى 10 MB لكل صورة
        </span>
        {busy && <span role="status">جارٍ تجهيز الصورة…</span>}
      </div>
      {images.length > 0 && (
        <div className="admin-image-gallery" aria-label="صور المنتج">
          {images.map((src, index) => (
            <div className="admin-gallery-image" key={`${index}-${src}`}>
              <img
                src={src}
                alt={`صورة المنتج ${index + 1}`}
                width="110"
                height="100"
              />
              <button
                type="button"
                className="text-button"
                disabled={busy || index === 0}
                aria-label={`تعيين الصورة ${index + 1} كرئيسية`}
                onClick={() => move(index, 0)}
              >
                {index === 0 ? "الصورة الرئيسية" : "تعيين كرئيسية"}
              </button>
              <div className="admin-gallery-actions">
                <button
                  type="button"
                  className="icon-button"
                  disabled={busy || index === 0}
                  aria-label={`تقديم الصورة ${index + 1}`}
                  onClick={() => move(index, index - 1)}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  disabled={busy || index === images.length - 1}
                  aria-label={`تأخير الصورة ${index + 1}`}
                  onClick={() => move(index, index + 1)}
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  className="text-button admin-danger"
                  disabled={busy}
                  aria-label={`إزالة الصورة ${index + 1}`}
                  onClick={() => remove(index)}
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
