import { Link } from 'react-router-dom';
import { Plus, ArrowUpLeft } from 'lucide-react';
import { Price } from './UI';

export default function ProductCard({ product }) {
  return <article className="product-card"><Link className="product-photo" to={`/product/${product.id}`} aria-label={`عرض ${product.name}`}><img src={product.images[0]} alt={product.name} loading="lazy" width="600" height="750"/>{product.oldPrice && <span className="tag">سعر خاص</span>}{!product.available && <span className="tag sold-out">نفد المخزون</span>}<span className="product-view">اكتشف القطعة<ArrowUpLeft size={20}/></span></Link><div className="product-meta"><span>{product.category}</span><Link to={`/product/${product.id}`} className="quick-add" aria-label={`اختيار مقاس وإضافة ${product.name}`}><Plus size={20}/></Link></div><h3><Link to={`/product/${product.id}`}>{product.name}</Link></h3><Price product={product}/></article>;
}
