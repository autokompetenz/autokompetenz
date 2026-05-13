import { useBreakpoint } from '../hooks/useBreakpoint';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderAPI } from '../services/api';
import { formatEuro, formatDate, timeAgo, STATUS_STEPS } from '../utils/helpers';
import { StatusBadge, Loader } from '../components/UI';
import { useLangStore } from '../store';

const STEP_ICONS = { pending:'📋', confirmed:'✅', processing:'🔧', shipped:'🚚', delivered:'🏠' };

const STATUS_LABELS_ML = {
  es:{ pending:'Pendiente', confirmed:'Confirmado', processing:'En proceso', shipped:'Enviado', delivered:'Entregado', cancelled:'Cancelado' },
  it:{ pending:'In attesa', confirmed:'Confermato', processing:'In elaborazione', shipped:'Spedito', delivered:'Consegnato', cancelled:'Annullato' },
  pt:{ pending:'Pendente', confirmed:'Confirmado', processing:'Em processamento', shipped:'Enviado', delivered:'Entregue', cancelled:'Cancelado' },
  fr:{ pending:'En attente', confirmed:'Confirmée', processing:'En traitement', shipped:'Expédiée', delivered:'Livrée', cancelled:'Annulée' },
  en:{ pending:'Pending', confirmed:'Confirmed', processing:'Processing', shipped:'Shipped', delivered:'Delivered', cancelled:'Cancelled' },
  de:{ pending:'Ausstehend', confirmed:'Bestätigt', processing:'In Bearbeitung', shipped:'Versandt', delivered:'Geliefert', cancelled:'Storniert' },
  ar:{ pending:'قيد الانتظار', confirmed:'مؤكد', processing:'قيد المعالجة', shipped:'تم الشحن', delivered:'تم التسليم', cancelled:'ملغي' },
};

const PAYMENT_ML = {
  es:{ full:'Pago completo (-5%)', deposit:'Señal 25%', monthly:'60 cuotas mensuales' },
  it:{ full:'Pagamento completo (-5%)', deposit:'Acconto 25%', monthly:'60 rate mensili' },
  pt:{ full:'Pagamento integral (-5%)', deposit:'Entrada 25%', monthly:'60 parcelas mensais' },
  fr:{ full:'Paiement intégral (-5%)', deposit:'Acompte 25%', monthly:'Mensualités 60 mois' },
  en:{ full:'Full payment (-5%)', deposit:'25% deposit', monthly:'60 monthly payments' },
  de:{ full:'Vollzahlung (-5%)', deposit:'Anzahlung 25%', monthly:'60 Raten' },
  ar:{ full:'دفع كامل (-5%)', deposit:'دفعة أولى 25%', monthly:'60 دفعة شهرية' },
};

export default function Track() {
  const { orderNumber: paramNum } = useParams();
  const navigate = useNavigate();
  const { lang } = useLangStore();
  const [input, setInput] = useState(paramNum || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!paramNum);
  const [error, setError] = useState('');

  const SL = STATUS_LABELS_ML[lang] || STATUS_LABELS_ML.fr;
  const PL = PAYMENT_ML[lang] || PAYMENT_ML.fr;

  const fetchOrder = async (num) => {
    setLoading(true); setError(''); setOrder(null);
    try { const { data } = await orderAPI.track(num.trim().toUpperCase()); setOrder(data.order); }
    catch (err) { setError(err.response?.data?.error || (lang==='fr' ? 'Commande introuvable.' : lang==='en' ? 'Order not found.' : lang==='de' ? 'Bestellung nicht gefunden.' : 'الطلب غير موجود.')); }
    finally { setLoading(false); }
  };

  useState(() => { if (paramNum) fetchOrder(paramNum); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim()) { navigate(`/track/${input.trim().toUpperCase()}`, { replace:true }); fetchOrder(input.trim()); }
  };

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;
  const isCancelled = order?.status === 'cancelled';

  const L = {
    title:   { fr:'Suivre ma commande', en:'Track my order', de:'Bestellung verfolgen', ar:'تتبع طلبي' },
    label:   { fr:'Suivi de commande',  en:'Order tracking',  de:'Bestellverfolgung',   ar:'تتبع الطلب' },
    sub:     { fr:'Entrez votre numéro de bon de commande', en:'Enter your order number', de:'Bestellnummer eingeben', ar:'أدخل رقم طلبك' },
    search:  { fr:'Rechercher',         en:'Search',          de:'Suchen',               ar:'بحث' },
    order:   { fr:'Bon de commande',    en:'Order number',    de:'Bestellnummer',        ar:'رقم الطلب' },
    placed:  { fr:'Passée le',          en:'Placed on',       de:'Bestellt am',          ar:'تم الطلب في' },
    cancelled: { fr:'Commande annulée', en:'Order cancelled', de:'Bestellung storniert', ar:'الطلب ملغي' },
    cancelSub: { fr:'Contactez-nous pour plus d\'informations.', en:'Contact us for more information.', de:'Kontaktieren Sie uns für weitere Informationen.', ar:'تواصل معنا لمزيد من المعلومات.' },
    vehicles:{ fr:'Véhicules commandés',en:'Ordered vehicles', de:'Bestellte Fahrzeuge',  ar:'السيارات المطلوبة' },
    payment: { fr:'Récapitulatif paiement', en:'Payment summary', de:'Zahlungsübersicht', ar:'ملخص الدفع' },
    history: { fr:'Historique',         en:'History',         de:'Verlauf',              ar:'السجل' },
    discount:{ fr:'Remise (-5%)',       en:'Discount (-5%)',  de:'Rabatt (-5%)',         ar:'خصم (-5%)' },
    deposit2:{ fr:'Acompte (25%)',      en:'Deposit (25%)',   de:'Anzahlung (25%)',      ar:'دفعة أولى (25%)' },
    monthly: { fr:'Mensualité ×',       en:'Monthly ×',       de:'Rate ×',               ar:'الدفعة × ' },
    total:   { fr:'Total',              en:'Total',           de:'Gesamt',               ar:'الإجمالي' },
    progress:{ fr:'Progression',        en:'Progress',        de:'Fortschritt',          ar:'التقدم' },
    contact: { fr:'Nous contacter',     en:'Contact us',      de:'Kontaktieren',         ar:'تواصل معنا' },
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:76 }}>
      {/* Header */}
      <div style={{ padding:'72px 6% 60px', background:'var(--bg-card2)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="section-eyebrow">{L.label[lang]}</div>
        <h1 style={{ fontFamily:"'Outfit', sans-serif", fontWeight:900, fontSize:'clamp(42px,6vw,80px)', color:'var(--text)', letterSpacing:'-0.02em', marginBottom:28 }}>
          {L.title[lang]}
        </h1>
        <form onSubmit={handleSearch} style={{ display:'flex', gap:14, maxWidth:520 }}>
          <input value={input} onChange={e => setInput(e.target.value.toUpperCase())} placeholder="AK20241215ABC123"
            className="input-luxury" style={{ flex:1, fontFamily:'monospace', letterSpacing:'0.08em', fontSize:17 }} />
          <button type="submit" className="btn-primary" style={{ padding:'14px 28px', flexShrink:0, fontSize:15 }}>
            {L.search[lang]}
          </button>
        </form>
      </div>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'48px 6%' }}>
        {loading && <Loader text={lang==='fr' ? 'Recherche...' : lang==='en' ? 'Searching...' : lang==='de' ? 'Suche...' : 'جارٍ البحث...'} />}

        {error && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ padding:'20px 24px', background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, textAlign:'center', fontSize:16, color:'#EF4444' }}>
            {error}
          </motion.div>
        )}

        {order && !loading && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:[0.16,1,0.3,1] }} style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Header card */}
            <div style={{ background:'var(--bg-card)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:28, display:'flex', flexWrap:'wrap', alignItems:'flex-start', justifyContent:'space-between', gap:20 }}>
              <div>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:8 }}>{L.order[lang]}</p>
                <p style={{ fontFamily:"'Outfit', sans-serif", fontWeight:900, fontSize:36, color:'#C8102E', letterSpacing:'0.05em' }}>{order.orderNumber}</p>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginTop:6 }}>{L.placed[lang]} {formatDate(order.createdAt)}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <StatusBadge status={order.status} />
                <p style={{ fontFamily:"'Outfit', sans-serif", fontWeight:900, fontSize:32, color:'var(--text)', marginTop:10, letterSpacing:'-0.02em' }}>{formatEuro(order.totalPrice)}</p>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginTop:4 }}>{PL[order.paymentType]}</p>
              </div>
            </div>

            {/* Progress */}
            {!isCancelled && (
              <div style={{ background:'var(--bg-card)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:32 }}>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:40 }}>{L.progress[lang]}</p>
                <div style={{ position:'relative', display:'flex', justifyContent:'space-between' }}>
                  {/* Background line */}
                  <div style={{ position:'absolute', top:22, left:0, right:0, height:2, background:'rgba(255,255,255,0.06)', zIndex:0 }} />
                  {/* Progress line */}
                  <div style={{ position:'absolute', top:22, left:0, height:2, background:'linear-gradient(90deg, #9B0B22, #C8102E)', zIndex:0, transition:'width 0.8s cubic-bezier(0.16,1,0.3,1)', width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }} />

                  {STATUS_STEPS.map((step, i) => {
                    const done = i < currentStep, active = i === currentStep;
                    return (
                      <div key={step} style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', zIndex:1 }}>
                        <div style={{
                          width:46, height:46, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:20, transition:'all 0.4s',
                          background: done ? '#C8102E' : active ? 'rgba(200,16,46,0.12)' : 'var(--dark)',
                          border: `2px solid ${done ? '#C8102E' : active ? '#C8102E' : 'rgba(255,255,255,0.08)'}`,
                          boxShadow: active ? '0 0 0 6px rgba(200,16,46,0.12)' : 'none',
                        }}>
                          {done ? <span style={{ color:'var(--text)', fontWeight:900, fontSize:18 }}>✓</span> : STEP_ICONS[step]}
                        </div>
                        <p style={{ fontSize:11, marginTop:10, textAlign:'center', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color: active ? '#C8102E' : done ? '#22C55E' : 'rgba(255,255,255,0.2)', maxWidth:70, lineHeight:1.3 }}>
                          {SL[step]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isCancelled && (
              <div style={{ padding:28, textAlign:'center', background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:12 }}>
                <p style={{ fontSize:48, marginBottom:12 }}>❌</p>
                <p style={{ fontWeight:800, fontSize:20, color:'#EF4444', marginBottom:8 }}>{L.cancelled[lang]}</p>
                <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', marginBottom:20 }}>{L.cancelSub[lang]}</p>
                <a href="https://wa.me/4915788823274" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display:'inline-flex', fontSize:14 }}>
                  💬 {L.contact[lang]}
                </a>
              </div>
            )}

            {/* Vehicles */}
            <div style={{ background:'var(--bg-card)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:28 }}>
              <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:20 }}>{L.vehicles[lang]}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                {order.items?.map(item => (
                  <div key={item.id} style={{ display:'flex', gap:18, alignItems:'center' }}>
                    <img src={item.car.imageUrl} alt="" style={{ width:90, height:64, objectFit:'cover', borderRadius:8, flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:700, color:'var(--text)', fontSize:17 }}>{item.car.make} {item.car.model} {item.car.year}</p>
                      <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginTop:3 }}>{item.car.fuelType} · {item.car.transmission}</p>
                    </div>
                    <p style={{ fontFamily:"'Outfit', sans-serif", fontWeight:800, fontSize:22, color:'#C8102E', flexShrink:0 }}>{formatEuro(item.unitPrice)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment summary */}
            <div style={{ background:'var(--bg-card)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:28 }}>
              <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:20 }}>{L.payment[lang]}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:12, fontSize:16 }}>
                {order.discountAmount && (
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'#22C55E' }}>{L.discount[lang]}</span>
                    <span style={{ color:'#22C55E', fontWeight:700 }}>- {formatEuro(order.discountAmount)}</span>
                  </div>
                )}
                {order.depositAmount && (
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'rgba(255,255,255,0.45)' }}>{L.deposit2[lang]}</span>
                    <span style={{ color:'#C8102E', fontWeight:700 }}>{formatEuro(order.depositAmount)}</span>
                  </div>
                )}
                {order.monthlyAmount && (
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'rgba(255,255,255,0.45)' }}>{L.monthly[lang]} {order.monthlyDuration}</span>
                    <span style={{ color:'#C8102E', fontWeight:700 }}>{formatEuro(order.monthlyAmount)}/mo</span>
                  </div>
                )}
                <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'4px 0' }} />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                  <span style={{ fontWeight:700, color:'var(--text)', fontSize:17 }}>{L.total[lang]}</span>
                  <span style={{ fontFamily:"'Outfit', sans-serif", fontWeight:900, fontSize:32, color:'var(--text)', letterSpacing:'-0.02em' }}>{formatEuro(order.totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* History timeline */}
            {order.tracking?.length > 0 && (
              <div style={{ background:'var(--bg-card)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:28 }}>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:28 }}>{L.history[lang]}</p>
                <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
                  {order.tracking.map(event => (
                    <div key={event.id} className="timeline-item">
                      <div className="timeline-dot"><div style={{ width:8, height:8, borderRadius:'50%', background:'#C8102E' }} /></div>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
                        <div>
                          <StatusBadge status={event.status} />
                          {event.comment && <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', marginTop:8, lineHeight:1.6 }}>{event.comment}</p>}
                        </div>
                        <p style={{ fontSize:12, color:'rgba(255,255,255,0.2)', flexShrink:0 }}>{timeAgo(event.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
