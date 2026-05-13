import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { orderAPI } from '../services/api';
import { useCartStore, useToastStore, useLangStore } from '../store';
import { formatEuro, calculateOrderTotals } from '../utils/helpers';
import { Loader, EmptyState } from '../components/UI';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks/useBreakpoint';

const PAYMENT_OPTIONS = [
  { id:'full',    icon:'💎', labelKey:'payment_full',    subFr:'−5% de remise immédiate', subEn:'5% immediate discount', subDe:'5% Sofortrabatt', subEs:'5% de descuento inmediato', subIt:'5% di sconto immediato', subPt:'5% de desconto imediato' },
  { id:'deposit', icon:'🔑', labelKey:'payment_deposit', subFr:'25% maintenant, solde à livraison', subEn:'25% now, balance on delivery', subDe:'25% jetzt, Rest bei Lieferung', subEs:'25% ahora, resto a la entrega', subIt:'25% ora, saldo alla consegna', subPt:'25% agora, saldo na entrega' },
  { id:'monthly', icon:'📅', labelKey:'payment_monthly', subFr:'60 mensualités à 6%/an', subEn:'60 monthly payments at 6%/yr', subDe:'60 Raten à 6%/Jahr', subEs:'60 cuotas al 6%/año', subIt:'60 rate al 6%/anno', subPt:'60 parcelas a 6%/ano' },
];

function getPaymentSub(opt, lang) {
  return opt[`sub${lang.charAt(0).toUpperCase() + lang.slice(1)}`] || opt.subFr;
}

export default function Cart() {
  const { cartItems, total, loading, fetchCart, removeItem } = useCartStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();

  const [selectedPayment, setSelectedPayment] = useState('full');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => { fetchCart(); }, []);

  const handleRemove = async (carId, carName) => {
    try {
      await removeItem(carId);
      addToast(`${carName} ${t('remove', lang)}`, 'info');
    } catch { addToast('Erreur', 'error'); }
  };

  const totals = calculateOrderTotals(total, selectedPayment);

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      addToast(t('delivery_addr', lang).replace(' *', '') + ' ' + (lang === 'fr' ? 'requis' : 'required'), 'warning');
      return;
    }
    try {
      setPlacing(true);
      const { data } = await orderAPI.create({ paymentType: selectedPayment, shippingAddress, notes });
      fetchCart();
      navigate(`/order-confirm/${data.orderNumber}`);
    } catch (err) {
      addToast(err.response?.data?.error || 'Erreur', 'error');
    } finally { setPlacing(false); }
  };

  const l = lang || 'fr';
  const items = Array.isArray(cartItems) ? cartItems : [];

  /* ── Checkout panel (reused on both layouts) ── */
  const CheckoutPanel = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

      {/* Payment selector */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:20, boxShadow:'var(--shadow-sm)' }}>
        <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--red)', marginBottom:14 }}>{t('payment_method', l)}</p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {PAYMENT_OPTIONS.map(opt => (
            <label key={opt.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 14px', borderRadius:8, cursor:'pointer', transition:'all 0.2s', border:`1.5px solid ${selectedPayment===opt.id?'var(--red)':'var(--border)'}`, background:selectedPayment===opt.id?'var(--red-bg)':'transparent' }}>
              <input type="radio" name="payment" value={opt.id} checked={selectedPayment===opt.id} onChange={() => setSelectedPayment(opt.id)}
                style={{ accentColor:'var(--red)', width:15, height:15, flexShrink:0 }} />
              <span style={{ fontSize:20 }}>{opt.icon}</span>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{t(opt.labelKey, l)}</p>
                <p style={{ fontSize:12, color:'var(--text-3)', marginTop:1 }}>{getPaymentSub(opt, l)}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:20, boxShadow:'var(--shadow-sm)' }}>
        <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--red)', marginBottom:14 }}>{t('summary', l)}</p>
        <div style={{ display:'flex', flexDirection:'column', gap:9, fontSize:15 }}>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ color:'var(--text-3)' }}>{t('subtotal', l)}</span>
            <span style={{ color:'var(--text)', fontWeight:600 }}>{formatEuro(total)}</span>
          </div>
          {selectedPayment==='full' && totals.discount && (
            <div style={{ display:'flex', justifyContent:'space-between', color:'var(--green)' }}>
              <span>{t('discount', l)}</span><span>− {formatEuro(totals.discount)}</span>
            </div>
          )}
          {selectedPayment==='monthly' && totals.monthly && (
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--text-3)' }}>{t('monthly_rate', l)}</span>
              <span style={{ color:'var(--red)', fontWeight:700 }}>{formatEuro(totals.monthly)}{t('per_month', l)}</span>
            </div>
          )}
          <div style={{ height:1, background:'var(--border)', margin:'4px 0' }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <span style={{ fontSize:14, color:'var(--text-3)' }}>
              {selectedPayment==='deposit' ? t('deposit_due', l) : selectedPayment==='monthly' ? t('contract_total', l) : t('total', l)}
            </span>
            <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:28, color:'var(--text)', letterSpacing:'-0.02em' }}>
              {selectedPayment==='deposit' ? formatEuro(totals.deposit) : formatEuro(totals.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery form — FIXED textarea */}
      <form onSubmit={handleOrder} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:20, display:'flex', flexDirection:'column', gap:14, boxShadow:'var(--shadow-sm)' }}>
        <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--red)' }}>
          {lang==='fr'?'Livraison':lang==='en'?'Delivery':lang==='de'?'Lieferung':lang==='es'?'Entrega':lang==='it'?'Consegna':'Entrega'}
        </p>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>
            {t('delivery_addr', l)}
          </label>
          {/* KEY FIX: use uncontrolled defaultValue + onChange to prevent letter-by-letter issue */}
          <textarea
            key="shipping-address"
            defaultValue={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            rows={4}
            required
            placeholder={t('delivery_ph', l)}
            className="input-luxury"
            style={{ resize:'vertical', minHeight:100, lineHeight:1.6, fontSize:16 }}
          />
        </div>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>
            {t('notes_label', l)}
          </label>
          <input
            key="notes-field"
            defaultValue={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('notes_ph', l)}
            className="input-luxury"
            style={{ fontSize:16 }}
          />
        </div>
        <button type="submit" disabled={placing} className="btn-primary"
          style={{ justifyContent:'center', padding:'15px 20px', fontSize:14, width:'100%' }}>
          {placing ? '⏳ ...' : '✓ ' + t('place_order', l)}
        </button>
        <p style={{ fontSize:12, textAlign:'center', color:'var(--text-3)' }}>
          ✉ {t('order_email_note', l)}
        </p>
      </form>
    </div>
  );

  if (loading) return (
    <div style={{ paddingTop:100, background:'var(--bg)', minHeight:'100vh', display:'flex', justifyContent:'center' }}>
      <Loader />
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:72 }}>
      {/* Header */}
      <div style={{ padding: isMobile ? '36px 4% 24px' : '52px 6% 32px', background:'var(--bg-card2)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <div className="section-eyebrow">{t('nav_cart', l)}</div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(32px,5vw,64px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
            {t('cart_title', l)}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth:1160, margin:'0 auto', padding: isMobile ? '24px 4%' : '40px 6%' }}>
        {items.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:72, marginBottom:20 }}>🛒</div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:28, color:'var(--text)', marginBottom:12 }}>{t('cart_empty', l)}</h2>
            <p style={{ fontSize:16, color:'var(--text-3)', marginBottom:32 }}>
              {lang==='fr'?'Découvrez nos véhicules et ajoutez-les à votre panier.':lang==='en'?'Discover our vehicles and add them to your cart.':lang==='de'?'Entdecken Sie unsere Fahrzeuge.':lang==='es'?'Descubra nuestros vehículos.':lang==='it'?'Scopri i nostri veicoli.':'Descubra nossos veículos.'}
            </p>
            <Link to="/catalog" className="btn-primary">{t('discover', l)}</Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: isMobile ? 20 : 32 }}>

            {/* Items list */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:4 }}>
                {items.length} {t('found', l)}
              </p>
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div key={item?.id || item?.carId}
                    layout initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, height:0 }}
                    style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? 14 : 20, display:'flex', gap: isMobile ? 12 : 18, alignItems:'center', boxShadow:'var(--shadow-sm)' }}>
                    <Link to={`/cars/${item?.carId}`} style={{ width: isMobile ? 88 : 130, flexShrink:0, borderRadius:8, overflow:'hidden', display:'block' }}>
                      <img src={item?.car?.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=70'}
                        alt={`${item?.car?.make} ${item?.car?.model}`}
                        style={{ width:'100%', height: isMobile ? 64 : 95, objectFit:'cover', display:'block' }} />
                    </Link>
                    <div style={{ flex:1, minWidth:0 }}>
                      <Link to={`/cars/${item?.carId}`} style={{ textDecoration:'none' }}>
                        <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize: isMobile ? 16 : 20, color:'var(--text)', marginBottom:3, letterSpacing:'-0.01em' }}>
                          {item?.car?.make} {item?.car?.model}
                        </h3>
                      </Link>
                      <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:6 }}>{item?.car?.year} · {item?.car?.fuelType} · {item?.car?.transmission}</p>
                      <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize: isMobile ? 19 : 24, color:'var(--red)' }}>
                        {formatEuro(item?.car?.price || 0)}
                      </p>
                      <button onClick={() => handleRemove(item?.carId, `${item?.car?.make} ${item?.car?.model}`)}
                        style={{ marginTop:8, fontSize:13, color:'#DC2626', background:'none', border:'none', cursor:'pointer', fontFamily:"'Outfit',sans-serif", fontWeight:600, padding:0 }}>
                        ✕ {t('remove', l)}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Checkout */}
            <div>
              <CheckoutPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
