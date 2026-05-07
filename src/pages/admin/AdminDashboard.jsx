import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api';
import { formatEuro, formatDate } from '../../utils/helpers';
import { StatusBadge, Loader } from '../../components/UI';

const STATUS_FR = { pending:'En attente', confirmed:'Confirmée', processing:'En traitement', shipped:'Expédiée', delivered:'Livrée', cancelled:'Annulée' };
const PAYMENT_FR = { full:'Intégral', deposit:'Acompte', monthly:'Mensualités' };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.stats().then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:40 }}><Loader text="Chargement du tableau de bord..." /></div>;
  if (!data) return null;

  const { stats, recentOrders } = data;

  const statCards = [
    { icon:'👥', label:'Clients', value:stats?.totalClients || 0, color:'#60A5FA', sub:'Total inscrits' },
    { icon:'📦', label:'Commandes', value:stats?.totalOrders || 0, color:'#C084FC', sub:'Total des commandes' },
    { icon:'💶', label:'Chiffre d\'affaires', value:formatEuro(stats?.totalRevenue || 0), color:'#C8102E', sub:'Hors annulées', wide:true },
    { icon:'⏳', label:'En attente', value:stats?.pendingOrders || 0, color:(stats?.pendingOrders || 0) > 0 ? '#FFAA00' : '#22C55E', sub:(stats?.pendingOrders || 0) > 0 ? 'Action requise' : 'Aucune en attente' },
    { icon:'🚗', label:'Véhicules actifs', value:stats?.totalCars || 0, color:'#22C55E', sub:'En catalogue' },
  ];

  const TABLE_COLS = ['N° Commande','Client','Date','Montant','Paiement','Statut',''];

  return (
    <div style={{ padding:'48px 44px 60px', minHeight:'100vh', background:'var(--black)' }}>
      <div style={{ marginBottom:40 }}>
        <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E', marginBottom:10 }}>Administration</p>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:52, color:'#fff', letterSpacing:'-0.02em' }}>Tableau de bord</h1>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:40 }}>
        {statCards.map(({ icon, label, value, color, sub, wide }, i) => (
          <motion.div key={label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
            style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'22px 20px', gridColumn:wide?'span 2':'span 1', transition:'border-color 0.3s' }}
            onMouseOver={e => e.currentTarget.style.borderColor=`rgba(200,16,46,0.2)`}
            onMouseOut={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <span style={{ fontSize:26 }}>{icon}</span>
              {label==='En attente' && (stats?.pendingOrders || 0) > 0 && (
                <span style={{ fontSize:10, background:'rgba(255,170,0,0.15)', color:'#FFAA00', padding:'3px 10px', borderRadius:12, fontWeight:800, letterSpacing:'0.1em' }}>ACTION</span>
              )}
            </div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:38, color, lineHeight:1, letterSpacing:'-0.02em' }}>{value}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:6, fontWeight:600 }}>{label}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)', marginTop:2 }}>{sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent orders */}
      <div style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'20px 28px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E' }}>Dernières commandes</p>
          <Link to="/admin/orders" style={{ fontSize:13, color:'rgba(255,255,255,0.4)', textDecoration:'none', fontWeight:600, transition:'color 0.2s' }}
            onMouseOver={e => e.target.style.color='#C8102E'} onMouseOut={e => e.target.style.color='rgba(255,255,255,0.4)'}>
            Voir tout →
          </Link>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                {TABLE_COLS.map(h => (
                  <th key={h} style={{ textAlign:'left', fontSize:11, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)', padding:'14px 20px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)', transition:'background 0.15s', cursor:'default' }}
                  onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                  onMouseOut={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'14px 20px' }}>
                    <span style={{ fontFamily:'monospace', color:'#C8102E', fontSize:13, fontWeight:700, letterSpacing:'0.04em' }}>{order.orderNumber}</span>
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    <p style={{ fontSize:14, color:'#fff', fontWeight:600 }}>{order.user?.firstName} {order.user?.lastName}</p>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{order.user?.email}</p>
                  </td>
                  <td style={{ padding:'14px 20px', color:'rgba(255,255,255,0.4)', fontSize:13 }}>{formatDate(order.createdAt)}</td>
                  <td style={{ padding:'14px 20px', fontWeight:700, color:'#fff', fontSize:15 }}>{formatEuro(order.totalPrice)}</td>
                  <td style={{ padding:'14px 20px' }}>
                    <span style={{ fontSize:11, background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.4)', padding:'4px 10px', borderRadius:4, fontWeight:600 }}>
                      {PAYMENT_FR[order.paymentType]}
                    </span>
                  </td>
                  <td style={{ padding:'14px 20px' }}><StatusBadge status={order.status} /></td>
                  <td style={{ padding:'14px 20px' }}>
                    <Link to={`/admin/orders/${order.id}`} className="btn-gold" style={{ fontSize:12, padding:'8px 16px' }}>Gérer</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
