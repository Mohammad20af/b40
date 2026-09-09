export const categories = ['تيشيرتات', 'بناطيل', 'هوديز', 'جاكيتات', 'أحذية'];
const img = (name) => `/images/${name}.jpg`;
const records = [
  ['01', 'تيشيرت أساسي أوفرسايز', 129, 159, 'تيشيرتات', 'tee', true],
  ['02', 'حذاء إير ستريت', 349, 399, 'أحذية', 'shoe', true],
  ['03', 'هودي ذا أورجينال', 219, null, 'هوديز', 'hoodie', true],
  ['04', 'بنطال كارغو إيربان', 189, null, 'بناطيل', 'cargo', true],
  ['05', 'جاكيت ستريت كلاسيك', 299, 349, 'جاكيتات', 'jacket', true],
  ['06', 'تيشيرت دايلي', 99, null, 'تيشيرتات', 'tee', false],
  ['07', 'حذاء سيتي رانر', 279, null, 'أحذية', 'shoe2', true],
  ['08', 'هودي نايت', 239, 269, 'هوديز', 'hoodie', false],
  ['09', 'بنطال ريلاكس فيت', 169, null, 'بناطيل', 'cargo', false],
  ['10', 'جاكيت ميدنايت', 329, null, 'جاكيتات', 'jacket', false],
  ['11', 'تيشيرت سيجنتشر', 149, null, 'تيشيرتات', 'tee', false],
  ['12', 'حذاء كلاود', 319, 359, 'أحذية', 'shoe2', false],
];
export const products = records.map(([id, name, price, oldPrice, category, photo, featured], i) => ({
  id, name, price, oldPrice, category, featured, available: i !== 9,
  images: [img(photo), img(photo === 'shoe' ? 'shoe2' : photo === 'shoe2' ? 'shoe' : 'editorial')],
  sizes: category === 'أحذية' ? ['40', '41', '42', '43', '44'] : ['S', 'M', 'L', 'XL'],
  colors: [{ name: 'أسود', hex: '#242424' }, { name: 'رمادي', hex: '#858580' }],
  description: 'تفاصيل بسيطة. حضور مختلف. قطعة بتصميم عصري وقصّة مريحة تكمل إطلالتك اليومية، من الشارع إلى كل مكان. الصور والمنتجات للعرض التجريبي.',
}));
