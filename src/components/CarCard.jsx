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

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return navigate('/login');
    try {
      setAdding(true);
      await addItem(car.id, 'full');
      addToast(`${car.make} ${car.model} ${t('add_to_cart', lang).toLowerCase().includes('ajout') ? 'ajouté au panier' : 'added to cart'}`, 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Error', 'error');
    } finally { setAdding(false); }
  };

  const isOutOfStock = car.stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.6, ease: [0.16,1,0.3,1] }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      style={{
        background: 'var(--dark-2)', borderRadius: 12, overflow: 'hidden',
        border: `1px solid ${hovered ? 'rgba(200,16,46,0.3)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 24px 60px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Image */}
      <Link to={`/cars/${car.id}`} style={{ display: 'block', position: 'relative', overflow: 'hidden', aspectRatio: '16/10' }}>
        <img
          src={car.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80'}
          alt={`${car.make} ${car.model}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)', transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
          loading="lazy"
        />
        {/* Overlay gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />

        {/* Badges top */}
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 8 }}>
          {car.featured && (
            <span style={{ background: '#C8102E', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 3 }}>
              ★ Top
            </span>
          )}
          {isOutOfStock && (
            <span style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: '#EF4444', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 3, border: '1px solid rgba(239,68,68,0.3)' }}>
              {t('out_of_stock', lang)}
            </span>
          )}
        </div>

        {/* Category badge */}
        <span style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
          {car.category}
        </span>

        {/* Hover CTA overlay */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', padding: 16, opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }}>
          <Link to={`/cars/${car.id}`} onClick={e => e.stopPropagation()} style={{ width: '100%', textAlign: 'center', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '11px 0', borderRadius: 6, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', transition: 'background 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}>
            {t('view_vehicle', lang)} →
          </Link>
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: '20px 22px 22px' }}>
        <Link to={`/cars/${car.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: '-0.01em', marginBottom: 4, transition: 'color 0.2s', lineHeight: 1.1 }}
            onMouseOver={e => e.target.style.color = '#C8102E'} onMouseOut={e => e.target.style.color = '#fff'}>
            {car.make} {car.model}
          </h3>
        </Link>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 16, fontWeight: 500 }}>
          {car.year} · {car.fuelType} · {car.transmission}
        </p>

        {/* Specs */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {car.power && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
              <span style={{ color: '#C8102E' }}>⚡</span> {car.power} hp
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <span style={{ color: '#C8102E' }}>📦</span>
            <span style={{ color: car.stock > 0 ? '#22C55E' : '#EF4444', fontWeight: 600 }}>
              {car.stock > 0 ? `${car.stock} ${t('in_stock', lang)}` : t('out_of_stock', lang)}
            </span>
          </div>
        </div>

        {/* Price + CTA */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 28, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {formatEuro(car.price)}
            </div>
            {car.monthlyPayment && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4, fontWeight: 500 }}>
                {t('or', lang)} {formatEuro(car.monthlyPayment)}{t('per_month', lang)}
              </div>
            )}
          </div>

          <button onClick={handleAddToCart} disabled={isOutOfStock || adding}
            style={{
              padding: '11px 18px', borderRadius: 6, fontSize: 12, fontWeight: 800,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              border: 'none', fontFamily: "'Outfit', sans-serif", transition: 'all 0.25s',
              background: isOutOfStock ? 'rgba(255,255,255,0.05)' : adding ? 'rgba(200,16,46,0.5)' : '#C8102E',
              color: isOutOfStock ? '#555' : '#fff',
              transform: adding ? 'scale(0.96)' : 'scale(1)',
            }}
            onMouseOver={e => { if (!isOutOfStock && !adding) e.currentTarget.style.background = '#9B0B22'; }}
            onMouseOut={e => { if (!isOutOfStock && !adding) e.currentTarget.style.background = '#C8102E'; }}>
            {adding ? '...' : isOutOfStock ? t('out_of_stock', lang) : '+ ' + t('add_to_cart', lang).split(' ')[0]}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
