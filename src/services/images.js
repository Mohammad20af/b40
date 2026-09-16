// Return an image reference, so this adapter can later upload to an API/storage.
export async function uploadProductImage(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("اختر صورة بصيغة JPG أو PNG أو WEBP.");
  if (file.size > 10 * 1024 * 1024)
    throw new Error("حجم الصورة يجب ألا يتجاوز 10 ميغابايت.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/webp", 0.82);
  } catch {
    throw new Error("تعذّر قراءة الصورة. اختر ملف صورة صالحاً.");
  } finally {
    URL.revokeObjectURL(url);
  }
}
