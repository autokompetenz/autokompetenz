import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { formatEuro, formatDate } from '../../utils/helpers';
import { StatusBadge, Loader } from '../../components/UI';

const STATUS_LABELS = { pending:'En attente', confirmed:'Confirmée', processing:'En traitement', shipped:'Expédiée', delivered:'Livrée', cancelled:'Annulée' };
const PAYMENT_FR = { full:'Intégral (-5%)', deposit:'Acompte 25%', monthly:'Mensualités' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [statusCounts, setStatusCounts] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (status) => {
    setLoading(true);
    try {
      const { data } = await orderAPI.getAll({ status: status || undefined });
      setOrders(data.orders);
      setStatusCounts(data.statusCounts || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const countFor = (id) => statusCounts.find(s => s.status === id)?._count?.status || 0;
  const tabs = [{ id:'', label:'Toutes' }, ...Object.entries(STATUS_LABELS).map(([id,label]) => ({ id, label }))];

  const handleTab = (id) => { setActiveTab(id); fetchOrders(id); };

  return (
    <div style={{ padding:'48px 44px 60px', minHeight:'100vh', background:'var(--black)' }}>
      <div style={{ marginBottom:32 }}>
        <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E', marginBottom:10 }}>Gestion</p>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:52, color:'#fff', letterSpacing:'-0.02em' }}>Commandes</h1>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:28 }}>
        {tabs.map(({ id, label }) => (
          <button key={id} onClick={() => handleTab(id)}
            style={{ padding:'9px 18px', borderRadius:6, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Outfit',sans-serif", transition:'all 0.2s', border:`1px solid ${activeTab===id?'#C8102E':'rgba(255,255,255,0.08)'}`, background:activeTab===id?'rgba(200,16,46,0.15)':'rgba(255,255,255,0.03)', color:activeTab===id?'#C8102E':'rgba(255,255,255,0.45)' }}>
            {label}
            {id && countFor(id) > 0 && (
              <span style={{ marginLeft:8, background:activeTab===id?'rgba(200,16,46,0.3)':'rgba(255,255,255,0.1)', padding:'2px 7px', borderRadius:10, fontSize:11 }}>
                {countFor(id)}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <Loader text="Chargement des commandes..." /> : (
        <div style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  {['N° BC','Client','Date','Montant','Mode','Statut','Action'].map(h => (
                    <th key={h} style={{ textAlign:'left', fontSize:11, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)', padding:'14px 20px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)', transition:'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                    onMouseOut={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'14px 20px' }}><span style={{ fontFamily:'monospace', color:'#C8102E', fontSize:13, fontWeight:700 }}>{order.orderNumber}</span></td>
                    <td style={{ padding:'14px 20px' }}>
                      <p style={{ fontSize:14, color:'#fff', fontWeight:600 }}>{order.user?.firstName} {order.user?.lastName}</p>
                      <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{order.user?.email}</p>
                    </td>
                    <td style={{ padding:'14px 20px', color:'rgba(255,255,255,0.4)', fontSize:13 }}>{formatDate(order.createdAt)}</td>
                    <td style={{ padding:'14px 20px', fontWeight:700, color:'#fff', fontSize:15 }}>{formatEuro(order.totalPrice)}</td>
                    <td style={{ padding:'14px 20px' }}>
                      <span style={{ fontSize:11, background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.45)', padding:'4px 10px', borderRadius:4, fontWeight:600 }}>
                        {PAYMENT_FR[order.paymentType]}
                      </span>
                    </td>
                    <td style={{ padding:'14px 20px' }}><StatusBadge status={order.status} /></td>
                    <td style={{ padding:'14px 20px' }}>
                      <Link to={`/admin/orders/${order.id}`} className="btn-gold" style={{ fontSize:12, padding:'8px 16px' }}>Gérer →</Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={7} style={{ padding:'48px', textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:15 }}>Aucune commande trouvée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
