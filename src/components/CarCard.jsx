import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatEuro } from '../utils/helpers';
import { useAuthStore, useCartStore, useToastStore, useLangStore } from '../store';
import { t } from '../utils/i18n';

export default function CarCard({ car, index = 0 }) {
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [hovered, setHovered] = useState(false);
  const l = lang || 'fr';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return navigate('/login');
    try {
      setAdding(true);
      await addItem(car.id, 'full');
      addToast(`${car.make} ${car.model} — ${t('add_to_cart', l)} ✓`, 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Error', 'error');
    } finally { setAdding(false); }
  };

  const isOutOfStock = car.stock === 0;

  return (
    <motion.div
      initial={{ opacity:0, y:24 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay:index*0.06, duration:0.55, ease:[0.16,1,0.3,1] }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      className="car-card"
      style={{
        background:'var(--bg-card)', borderRadius:12, overflow:'hidden',
        border:`1px solid ${hovered?'rgba(200,16,46,0.3)':'var(--border)'}`,
        transition:'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        transform:hovered?'translateY(-5px)':'translateY(0)',
        boxShadow:hovered?'var(--shadow-md)':'var(--shadow-sm)',
      }}>

      {/* Image */}
      <Link to={`/cars/${car.id}`} style={{ display:'block', position:'relative', overflow:'hidden' }}>
        <img src={car.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=70'}
          alt={`${car.make} ${car.model}`}
          className="car-img-zoom"
          style={{ width:'100%', height:190, objectFit:'cover', display:'block' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 55%)' }} />

        {/* Badges */}
        <div style={{ position:'absolute', top:12, left:12, display:'flex', gap:7 }}>
          {car.featured && (
            <span style={{ background:'#C8102E', color:'#fff', fontSize:9, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', padding:'4px 10px', borderRadius:3 }}>★ Top</span>
          )}
          {isOutOfStock && (
            <span style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', color:'#EF4444', fontSize:9, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', padding:'4px 10px', borderRadius:3, border:'1px solid rgba(239,68,68,0.3)' }}>
              {t('out_of_stock', l)}
            </span>
          )}
        </div>
        <span style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)', color:'rgba(255,255,255,0.75)', fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', padding:'4px 10px', borderRadius:3 }}>
          {car.category}
        </span>

        {/* Hover overlay */}
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'flex-end', padding:14, opacity:hovered?1:0, transition:'opacity 0.25s' }}>
          <Link to={`/cars/${car.id}`} onClick={e => e.stopPropagation()}
            style={{ width:'100%', textAlign:'center', background:'rgba(255,255,255,0.14)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', padding:'10px 0', borderRadius:6, fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', textDecoration:'none' }}>
            {t('view_vehicle', l)} →
          </Link>
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding:'18px 20px 20px' }}>
        <Link to={`/cars/${car.id}`} style={{ textDecoration:'none' }}>
          <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:20, color:'var(--text)', letterSpacing:'-0.01em', marginBottom:3, lineHeight:1.1, transition:'color 0.2s' }}
            onMouseOver={e=>e.target.style.color='var(--red)'} onMouseOut={e=>e.target.style.color='var(--text)'}>
            {car.make} {car.model}
          </h3>
        </Link>
        <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:14, fontWeight:500 }}>
          {car.year} · {car.fuelType} · {car.transmission}
        </p>

        <div style={{ display:'flex', gap:14, marginBottom:16, paddingBottom:16, borderBottom:'1px solid var(--border)' }}>
          {car.power && (
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, color:'var(--text-3)' }}>
              <span style={{ color:'var(--red)' }}>⚡</span> {car.power} hp
            </div>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:13 }}>
            <span style={{ color:'var(--red)' }}>📦</span>
            <span style={{ color:car.stock>0?'var(--green)':'#DC2626', fontWeight:600 }}>
              {car.stock>0?`${car.stock} ${t('in_stock', l)}`:t('out_of_stock', l)}
            </span>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:10 }}>
          <div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:26, color:'var(--text)', letterSpacing:'-0.02em', lineHeight:1 }}>
              {formatEuro(car.price)}
            </div>
            {car.monthlyPayment && (
              <div style={{ fontSize:12, color:'var(--text-3)', marginTop:3, fontWeight:500 }}>
                {t('or', l)} {formatEuro(car.monthlyPayment)}{t('per_month', l)}
              </div>
            )}
          </div>
          <button onClick={handleAddToCart} disabled={isOutOfStock||adding}
            style={{ padding:'10px 16px', borderRadius:6, fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', cursor:isOutOfStock?'not-allowed':'pointer', border:'none', fontFamily:"'Outfit',sans-serif", transition:'all 0.2s', background:isOutOfStock?'var(--bg-card2)':adding?'rgba(200,16,46,0.5)':'var(--red)', color:isOutOfStock?'var(--text-3)':'#fff', flexShrink:0 }}
            onMouseOver={e=>{ if(!isOutOfStock&&!adding) e.currentTarget.style.background='var(--red-dark)'; }}
            onMouseOut={e=>{ if(!isOutOfStock&&!adding) e.currentTarget.style.background='var(--red)'; }}>
            {adding?'...':isOutOfStock?t('out_of_stock',l):'+ '+t('add_to_cart',l).split(' ')[0]}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
