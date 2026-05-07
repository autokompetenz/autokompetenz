import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { orderAPI } from '../services/api';
import { useCartStore, useToastStore, useLangStore } from '../store';
import { formatEuro, calculateOrderTotals } from '../utils/helpers';
import { Loader, EmptyState } from '../components/UI';
import { t } from '../utils/i18n';

export default function Cart() {
  const { cartItems, total, loading, fetchCart, removeItem } = useCartStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState('full');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => { 
    console.log('=== Cart Component Mount ===');
    console.log('Initial cartItems:', cartItems);
    fetchCart(); 
  }, []);

  useEffect(() => {
    console.log('=== Cart Component Update ===');
    console.log('cartItems changed:', cartItems);
    console.log('cartItems length:', cartItems?.length || 0);
  }, [cartItems]);

  const handleRemove = async (carId, carName) => {
    try { await removeItem(carId); addToast(`${carName} ${lang==='fr'?'retiré du panier':lang==='en'?'removed from cart':lang==='de'?'entfernt':'تم الإزالة'}`, 'info'); }
    catch { addToast('Erreur', 'error'); }
  };

  const totals = calculateOrderTotals(total, selectedPayment);

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      addToast(lang==='fr'?'Veuillez saisir votre adresse':lang==='en'?'Please enter your address':lang==='de'?'Bitte Adresse eingeben':'أدخل عنوانك', 'warning');
      return;
    }
    try {
      setPlacing(true);
      const { data } = await orderAPI.create({ paymentType: selectedPayment, shippingAddress, notes });
      fetchCart();
      navigate(`/order-confirm/${data.orderNumber}`);
    } catch (err) { addToast(err.response?.data?.error || 'Erreur', 'error'); }
    finally { setPlacing(false); }
  };

  const L = {
    title:    { fr:'Mon Panier',                en:'My Cart',                de:'Warenkorb',              ar:'سلتي' },
    empty:    { fr:'Votre panier est vide',      en:'Your cart is empty',     de:'Warenkorb leer',         ar:'سلتك فارغة' },
    emptySub: { fr:'Découvrez nos véhicules et ajoutez-les à votre panier.', en:'Discover our vehicles and add them to your cart.', de:'Entdecken Sie unsere Fahrzeuge.', ar:'اكتشف سياراتنا وأضفها إلى سلتك.' },
    discover: { fr:'Découvrir nos véhicules',   en:'Discover vehicles',       de:'Fahrzeuge entdecken',    ar:'اكتشف سياراتنا' },
    remove:   { fr:'Retirer',                   en:'Remove',                  de:'Entfernen',              ar:'إزالة' },
    payment:  { fr:'Mode de paiement',          en:'Payment method',          de:'Zahlungsart',            ar:'طريقة الدفع' },
    summary:  { fr:'Récapitulatif',             en:'Summary',                 de:'Zusammenfassung',        ar:'ملخص' },
    subtotal: { fr:'Sous-total',                en:'Subtotal',                de:'Zwischensumme',          ar:'المجموع الفرعي' },
    discount: { fr:'Remise (-5%)',              en:'Discount (-5%)',          de:'Rabatt (-5%)',           ar:'خصم (-5%)' },
    monthly:  { fr:'Mensualité',                en:'Monthly rate',            de:'Monatsrate',             ar:'القسط الشهري' },
    contract: { fr:'Total contrat',             en:'Contract total',          de:'Gesamtbetrag',           ar:'إجمالي العقد' },
    deposit:  { fr:'Acompte à régler',          en:'Deposit to pay',          de:'Anzahlung',              ar:'الدفعة الأولى' },
    total:    { fr:'Total',                     en:'Total',                   de:'Gesamt',                 ar:'الإجمالي' },
    delivery: { fr:'Livraison',                 en:'Delivery',                de:'Lieferung',              ar:'التوصيل' },
    address:  { fr:'Adresse de livraison *',    en:'Delivery address *',      de:'Lieferadresse *',        ar:'عنوان التسليم *' },
    addrPH:   { fr:'Rue, code postal, ville...', en:'Street, postcode, city...', de:'Straße, PLZ, Stadt...', ar:'الشارع، الرمز البريدي، المدينة...' },
    notesL:   { fr:'Notes (optionnel)',          en:'Notes (optional)',        de:'Anmerkungen (optional)', ar:'ملاحظات (اختياري)' },
    notesPH:  { fr:'Instructions particulières...', en:'Special instructions...', de:'Besondere Hinweise...', ar:'تعليمات خاصة...' },
    validate: { fr:'Valider ma commande',        en:'Place my order',          de:'Bestellung aufgeben',    ar:'تأكيد الطلب' },
    confirm:  { fr:'Un email de confirmation vous sera envoyé', en:'A confirmation email will be sent', de:'Bestätigungs-E-Mail wird gesendet', ar:'سيتم إرسال بريد تأكيد' },
    full:     { fr:'Paiement intégral',         en:'Full payment',             de:'Vollzahlung',            ar:'الدفع الكامل' },
    fullSub:  { fr:'5% de remise immédiate',    en:'5% immediate discount',   de:'5% Sofortrabatt',        ar:'خصم فوري 5%' },
    dep:      { fr:'Acompte 25%',               en:'25% Deposit',             de:'Anzahlung 25%',          ar:'دفعة أولى 25%' },
    depSub:   { fr:'25% maintenant, solde à livraison', en:'25% now, balance on delivery', de:'25% jetzt, Rest bei Lieferung', ar:'25% الآن، الباقي عند التسليم' },
    month:    { fr:'Mensualités 60 mois',       en:'60 monthly payments',     de:'60 Raten',               ar:'60 دفعة شهرية' },
    monthSub: { fr:'Taux 6%/an',                en:'Rate 6%/year',            de:'6% p.a.',                ar:'معدل 6% سنوياً' },
  };

  if (loading) return <div style={{ paddingTop:100, background:'var(--black)', minHeight:'100vh' }}><Loader text={lang==='fr'?'Chargement du panier...':lang==='en'?'Loading cart...':'Wird geladen...'} /></div>;

  return (
    <div style={{ minHeight:'100vh', background:'var(--black)', paddingTop:76 }}>
      <div style={{ padding:'64px 6% 32px', background:'var(--dark)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="section-eyebrow">{L.title[lang]}</div>
        <h1 style={{ fontFamily:"'Outfit', sans-serif", fontWeight:900, fontSize:'clamp(42px,6vw,76px)', color:'#fff', letterSpacing:'-0.02em' }}>
          {L.title[lang]}
        </h1>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'48px 6%' }}>
        {(!Array.isArray(cartItems) || cartItems.length === 0) ? (
          <EmptyState icon="🛒" title={L.empty[lang]} subtitle={L.emptySub[lang]}
            action={<Link to="/catalog" className="btn-primary" style={{ fontSize:14 }}>{L.discover[lang]}</Link>} />
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 400px', gap:36 }}>

            {/* ── Items ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <AnimatePresence>
                {cartItems.map(item => (
                  <motion.div key={item?.id || item.carId} layout initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20, height:0 }}
                    style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:20, display:'flex', gap:18 }}>
                    <Link to={`/cars/${item?.carId}`} style={{ width:140, flexShrink:0, borderRadius:8, overflow:'hidden', display:'block' }}>
                      <img src={item?.car?.imageUrl || '/placeholder-car.jpg'} alt={`${item?.car?.make || ''} ${item?.car?.model || ''}`}
                        style={{ width:'100%', height:100, objectFit:'cover', transition:'transform 0.4s', display:'block' }}
                        onMouseOver={e => e.target.style.transform='scale(1.06)'}
                        onMouseOut={e => e.target.style.transform='scale(1)'} />
                    </Link>
                    <div style={{ flex:1, minWidth:0 }}>
                      <Link to={`/cars/${item?.carId}`} style={{ textDecoration:'none' }}>
                        <h3 style={{ fontFamily:"'Outfit', sans-serif", fontWeight:800, fontSize:22, color:'#fff', marginBottom:4, letterSpacing:'-0.01em', transition:'color 0.2s' }}
                          onMouseOver={e => e.target.style.color='#C8102E'} onMouseOut={e => e.target.style.color='#fff' }>
                          {item?.car?.make || ''} {item?.car?.model || ''}
                        </h3>
                      </Link>
                      <p style={{ fontSize:14, color:'rgba(255,255,255,0.35)', marginBottom:10 }}>{item?.car?.year || ''} · {item?.car?.fuelType || ''} · {item?.car?.transmission || ''}</p>
                      <span style={{ display:'inline-block', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', background:'rgba(200,16,46,0.1)', color:'#C8102E', border:'1px solid rgba(200,16,46,0.2)', padding:'4px 12px', borderRadius:20 }}>
                        {t('payment_'+(item?.paymentType || 'full'), lang)}
                      </span>
                    </div>
                    <div style={{ textAlign:'right', display:'flex', flexDirection:'column', justifyContent:'space-between', flexShrink:0 }}>
                      <p style={{ fontFamily:"'Outfit', sans-serif", fontWeight:900, fontSize:24, color:'#fff', letterSpacing:'-0.01em' }}>{formatEuro(item?.car?.price || 0)}</p>
                      <button onClick={() => handleRemove(item?.carId, `${item?.car?.make || ''} ${item?.car?.model || ''}`)}
                        style={{ fontSize:13, color:'rgba(239,68,68,0.7)', background:'none', border:'none', cursor:'pointer', fontFamily:"'Outfit', sans-serif", fontWeight:600, transition:'color 0.2s', textAlign:'right' }}
                        onMouseOver={e => e.target.style.color='#EF4444'} onMouseOut={e => e.target.style.color='rgba(239,68,68,0.7)'}>
                        ✕ {L.remove[lang]}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ── Checkout ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Payment type */}
              <div style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:22 }}>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E', marginBottom:16 }}>{L.payment[lang]}</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {[
                    { id:'full',    icon:'💎', label:L.full[lang],  sub:L.fullSub[lang] },
                    { id:'deposit', icon:'🔑', label:L.dep[lang],   sub:L.depSub[lang] },
                    { id:'monthly', icon:'📅', label:L.month[lang], sub:L.monthSub[lang] },
                  ].map(opt => (
                    <label key={opt.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:8, cursor:'pointer', transition:'all 0.2s', border:`1.5px solid ${selectedPayment===opt.id?'#C8102E':'rgba(255,255,255,0.07)'}`, background:selectedPayment===opt.id?'rgba(200,16,46,0.06)':'transparent' }}>
                      <input type="radio" name="payment" value={opt.id} checked={selectedPayment===opt.id} onChange={() => setSelectedPayment(opt.id)} style={{ accentColor:'#C8102E', width:16, height:16, flexShrink:0 }} />
                      <span style={{ fontSize:22 }}>{opt.icon}</span>
                      <div>
                        <p style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{opt.label}</p>
                        <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{opt.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:22 }}>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E', marginBottom:16 }}>{L.summary[lang]}</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10, fontSize:15 }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'rgba(255,255,255,0.4)' }}>{L.subtotal[lang]}</span>
                    <span style={{ color:'#fff', fontWeight:600 }}>{formatEuro(total)}</span>
                  </div>
                  {selectedPayment==='full' && totals.discount && (
                    <div style={{ display:'flex', justifyContent:'space-between', color:'#22C55E' }}>
                      <span>{L.discount[lang]}</span><span>- {formatEuro(totals.discount)}</span>
                    </div>
                  )}
                  {selectedPayment==='monthly' && totals.monthly && (
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'rgba(255,255,255,0.4)' }}>{L.monthly[lang]}</span>
                      <span style={{ color:'#C8102E', fontWeight:700 }}>{formatEuro(totals.monthly)}/mo</span>
                    </div>
                  )}
                  <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'4px 0' }} />
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                    <span style={{ fontSize:14, color:'rgba(255,255,255,0.4)' }}>
                      {selectedPayment==='deposit'?L.deposit[lang]:selectedPayment==='monthly'?L.contract[lang]:L.total[lang]}
                    </span>
                    <span style={{ fontFamily:"'Outfit', sans-serif", fontWeight:900, fontSize:28, color:'#fff', letterSpacing:'-0.02em' }}>
                      {selectedPayment==='deposit'?formatEuro(totals.deposit):formatEuro(totals.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery form */}
              <form onSubmit={handleOrder} style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:22, display:'flex', flexDirection:'column', gap:16 }}>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E' }}>{L.delivery[lang]}</p>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:8 }}>{L.address[lang]}</label>
                  <textarea value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} required rows={3}
                    placeholder={L.addrPH[lang]} className="input-luxury" style={{ resize:'none', fontSize:15 }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:8 }}>{L.notesL[lang]}</label>
                  <input value={notes} onChange={e => setNotes(e.target.value)} placeholder={L.notesPH[lang]} className="input-luxury" style={{ fontSize:15 }} />
                </div>
                <button type="submit" disabled={placing} className="btn-primary" style={{ justifyContent:'center', padding:16, fontSize:14 }}>
                  {placing?'⏳ ...' : '✓ '+L.validate[lang]}
                </button>
                <p style={{ fontSize:12, textAlign:'center', color:'rgba(255,255,255,0.2)' }}>{L.confirm[lang]}</p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
