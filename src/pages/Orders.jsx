import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderAPI } from '../services/api';
import { formatEuro, formatDate } from '../utils/helpers';
import { StatusBadge, Loader, EmptyState } from '../components/UI';
import { useLangStore } from '../store';

const PL = { fr:{full:'Paiement intégral (-5%)',deposit:'Acompte 25%',monthly:'Mensualités 60 mois'}, en:{full:'Full payment (-5%)',deposit:'25% deposit',monthly:'60 monthly payments'}, de:{full:'Vollzahlung',deposit:'Anzahlung',monthly:'60 Raten'}, ar:{full:'دفع كامل',deposit:'دفعة أولى',monthly:'أقساط'} };

export default function Orders() {
  const { lang } = useLangStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { orderAPI.getMy().then(r => { setOrders(r.data.orders); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const L = {
    label:   { fr:'Mon historique', en:'My history', de:'Mein Verlauf', ar:'سجلي' },
    title:   { fr:'Mes Commandes', en:'My Orders', de:'Meine Bestellungen', ar:'طلباتي' },
    empty:   { fr:'Aucune commande', en:'No orders', de:'Keine Bestellungen', ar:'لا توجد طلبات' },
    emptySub:{ fr:"Vous n'avez pas encore passé de commande.", en:"You haven't placed any orders yet.", de:'Noch keine Bestellungen.', ar:'لم تقم بأي طلب حتى الآن.' },
    discover:{ fr:'Découvrir nos véhicules', en:'Discover our vehicles', de:'Fahrzeuge entdecken', ar:'اكتشف سياراتنا' },
    track:   { fr:'📍 Suivre', en:'📍 Track', de:'📍 Verfolgen', ar:'📍 تتبع' },
  };

  const PLang = PL[lang] || PL.fr;

  return (
    <div style={{ minHeight:'100vh', background:'var(--black)', paddingTop:76 }}>
      <div style={{ padding:'64px 6% 48px', background:'var(--dark)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="section-eyebrow">{L.label[lang]}</div>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(42px,6vw,76px)', color:'#fff', letterSpacing:'-0.02em' }}>{L.title[lang]}</h1>
      </div>

      <div style={{ maxWidth:960, margin:'0 auto', padding:'48px 6%' }}>
        {loading ? <Loader text={lang==='fr'?'Chargement...':lang==='en'?'Loading...':'Wird geladen...'} /> :
         orders.length === 0 ? (
          <EmptyState icon="📦" title={L.empty[lang]} subtitle={L.emptySub[lang]}
            action={<Link to="/catalog" className="btn-primary" style={{ fontSize:14 }}>{L.discover[lang]}</Link>} />
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {orders.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06, duration:0.5 }}
                style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:24, transition:'border-color 0.3s' }}
                onMouseOver={e => e.currentTarget.style.borderColor='rgba(200,16,46,0.2)'}
                onMouseOut={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>
                <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:18 }}>
                  <div>
                    <p style={{ fontFamily:'monospace', fontSize:18, color:'#C8102E', fontWeight:700, letterSpacing:'0.05em' }}>{order.orderNumber}</p>
                    <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginTop:4 }}>{formatDate(order.createdAt)} · {PLang[order.paymentType]}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <StatusBadge status={order.status} />
                    <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:26, color:'#fff', marginTop:8, letterSpacing:'-0.01em' }}>{formatEuro(order.totalPrice)}</p>
                  </div>
                </div>
                {/* Thumbnails */}
                <div style={{ display:'flex', gap:10, marginBottom:18, overflow:'hidden' }}>
                  {Array.isArray(order.items) && order.items.slice(0,4).map(item => (
                    <img key={item.id} src={item.car.imageUrl} alt="" style={{ width:80, height:56, objectFit:'cover', borderRadius:6, flexShrink:0 }} />
                  ))}
                  {order.items?.length > 4 && (
                    <div style={{ width:80, height:56, borderRadius:6, background:'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'rgba(255,255,255,0.3)', fontWeight:600 }}>+{order.items.length-4}</div>
                  )}
                </div>
                <Link to={`/track/${order.orderNumber}`} className="btn-gold" style={{ fontSize:13, padding:'10px 22px' }}>{L.track[lang]}</Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
