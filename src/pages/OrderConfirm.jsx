import { useBreakpoint } from '../hooks/useBreakpoint';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderAPI } from '../services/api';
import { formatEuro, formatDate } from '../utils/helpers';
import { Loader } from '../components/UI';
import { useLangStore } from '../store';

export default function OrderConfirm() {
  const { orderNumber } = useParams();
  const { lang } = useLangStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getByNumber(orderNumber).then(r => { setOrder(r.data.order); setLoading(false); }).catch(() => setLoading(false));
  }, [orderNumber]);

  const PL = { fr:{full:'Paiement intégral (-5%)',deposit:'Acompte 25%',monthly:'Mensualités 60 mois'}, en:{full:'Full payment (-5%)',deposit:'25% deposit',monthly:'60 monthly payments'}, de:{full:'Vollzahlung (-5%)',deposit:'Anzahlung 25%',monthly:'60 Raten'}, ar:{full:'دفع كامل (-5%)',deposit:'دفعة أولى 25%',monthly:'60 دفعة شهرية'}, es:{full:'Pago completo (-5%)',deposit:'Señal 25%',monthly:'60 cuotas'}, it:{full:'Pagamento completo (-5%)',deposit:'Acconto 25%',monthly:'60 rate'}, pt:{full:'Pagamento integral (-5%)',deposit:'Entrada 25%',monthly:'60 parcelas'} };
  const L = {
    title:   { fr:'Commande confirmée !', en:'Order confirmed!', de:'Bestellung bestätigt!', ar:'تم تأكيد الطلب!' },
    email:   { fr:'Un email de confirmation a été envoyé à votre adresse.', en:'A confirmation email has been sent to your address.', de:'Eine Bestätigungs-E-Mail wurde gesendet.', ar:'تم إرسال بريد تأكيد إلى عنوانك.' },
    bcLabel: { fr:'Numéro de bon de commande', en:'Order number', de:'Bestellnummer', ar:'رقم الطلب' },
    placed:  { fr:'Passée le', en:'Placed on', de:'Bestellt am', ar:'تم الطلب في' },
    vehicles:{ fr:'Véhicules commandés', en:'Ordered vehicles', de:'Bestellte Fahrzeuge', ar:'السيارات المطلوبة' },
    finance: { fr:'Récapitulatif financier', en:'Financial summary', de:'Finanzübersicht', ar:'الملخص المالي' },
    mode:    { fr:'Mode de paiement', en:'Payment method', de:'Zahlungsart', ar:'طريقة الدفع' },
    discount:{ fr:'Remise appliquée', en:'Discount applied', de:'Rabatt', ar:'الخصم المطبق' },
    deposit: { fr:'Acompte (25%)', en:'Deposit (25%)', de:'Anzahlung (25%)', ar:'الدفعة الأولى (25%)' },
    monthly2:{ fr:'Mensualité ×', en:'Monthly ×', de:'Rate ×', ar:'القسط ×' },
    total:   { fr:'Total', en:'Total', de:'Gesamt', ar:'الإجمالي' },
    track:   { fr:'📍 Suivre ma commande', en:'📍 Track my order', de:'📍 Bestellung verfolgen', ar:'📍 تتبع طلبي' },
    continue:{ fr:'Continuer mes achats', en:'Continue shopping', de:'Weiter einkaufen', ar:'مواصلة التسوق' },
  };

  if (loading) return <div style={{ paddingTop:100, background:'var(--bg)', minHeight:'100vh' }}><Loader /></div>;
  if (!order) return <div style={{ paddingTop:120, textAlign:'center', background:'var(--bg)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><div><p style={{ fontSize:80, fontWeight:900, color:'#C8102E', fontFamily:"'Outfit',sans-serif" }}>404</p><Link to="/" className="btn-primary" style={{ marginTop:20, display:'inline-flex' }}>Accueil</Link></div></div>;

  const PLang = PL[lang] || PL.fr;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:76 }}>
      <div style={{ maxWidth:680, margin:'0 auto', padding:'72px 6%' }}>
        {/* Success icon */}
        <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', damping:14, stiffness:200 }}
          style={{ width:88, height:88, borderRadius:'50%', background:'rgba(34,197,94,0.1)', border:'2px solid rgba(34,197,94,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 36px', fontSize:40 }}>
          ✓
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.6 }} style={{ textAlign:'center', marginBottom:40 }}>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(36px,5vw,56px)', color:'#fff', letterSpacing:'-0.02em', marginBottom:12 }}>{L.title[lang]}</h1>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.4)', lineHeight:1.6 }}>{L.email[lang]}</p>
        </motion.div>

        {/* Order number */}
        <div style={{ background:'rgba(200,16,46,0.06)', border:'1px solid rgba(200,16,46,0.2)', borderRadius:12, padding:'28px 32px', textAlign:'center', marginBottom:20 }}>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.35em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:10 }}>{L.bcLabel[lang]}</p>
          <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:40, color:'#C8102E', letterSpacing:'0.08em' }}>{order.orderNumber}</p>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.3)', marginTop:8 }}>{L.placed[lang]} {formatDate(order.createdAt)}</p>
        </div>

        {/* Vehicles */}
        <div style={{ background:'var(--bg-card)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:24, marginBottom:16 }}>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:18 }}>{L.vehicles[lang]}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {order.items?.map(item => (
              <div key={item.id} style={{ display:'flex', gap:16, alignItems:'center' }}>
                <img src={item.car.imageUrl} alt="" style={{ width:90, height:64, objectFit:'cover', borderRadius:8, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:700, color:'#fff', fontSize:16 }}>{item.car.make} {item.car.model} {item.car.year}</p>
                  <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginTop:3 }}>{item.car.fuelType} · {item.car.transmission}</p>
                </div>
                <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:22, color:'#C8102E', flexShrink:0 }}>{formatEuro(item.unitPrice)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Financial summary */}
        <div style={{ background:'var(--bg-card)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:24, marginBottom:32 }}>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:18 }}>{L.finance[lang]}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12, fontSize:15 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'rgba(255,255,255,0.4)' }}>{L.mode[lang]}</span>
              <span style={{ color:'#fff', fontWeight:600 }}>{PLang[order.paymentType]}</span>
            </div>
            {order.discountAmount && (
              <div style={{ display:'flex', justifyContent:'space-between', color:'#22C55E' }}>
                <span>{L.discount[lang]}</span><span>- {formatEuro(order.discountAmount)}</span>
              </div>
            )}
            {order.depositAmount && (
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'rgba(255,255,255,0.4)' }}>{L.deposit[lang]}</span>
                <span style={{ color:'#C8102E', fontWeight:700 }}>{formatEuro(order.depositAmount)}</span>
              </div>
            )}
            {order.monthlyAmount && (
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'rgba(255,255,255,0.4)' }}>{L.monthly2[lang]} {order.monthlyDuration}</span>
                <span style={{ color:'#C8102E', fontWeight:700 }}>{formatEuro(order.monthlyAmount)}/mo</span>
              </div>
            )}
            <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'4px 0' }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
              <span style={{ fontWeight:700, color:'#fff' }}>{L.total[lang]}</span>
              <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:34, color:'#fff', letterSpacing:'-0.02em' }}>{formatEuro(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display:'flex', gap:14 }}>
          <Link to={`/track/${order.orderNumber}`} className="btn-primary" style={{ flex:1, justifyContent:'center', fontSize:14 }}>{L.track[lang]}</Link>
          <Link to="/catalog" className="btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:14 }}>{L.continue[lang]}</Link>
        </div>
      </div>
    </div>
  );
}
