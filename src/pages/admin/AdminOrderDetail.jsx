import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { useToastStore } from '../../store';
import { formatEuro, formatDate, timeAgo } from '../../utils/helpers';
import { StatusBadge, Loader } from '../../components/UI';

const STATUS_LABELS = { pending:'En attente', confirmed:'Confirmée', processing:'En traitement', shipped:'Expédiée', delivered:'Livrée', cancelled:'Annulée' };
const PAYMENT_LABELS = { full:'Paiement intégral (-5%)', deposit:'Acompte 25%', monthly:'Mensualités 60 mois' };

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { addToast } = useToastStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    orderAPI.getAdminDetail(id)
      .then(r => { setOrder(r.data.order); setNewStatus(r.data.order.status); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await orderAPI.updateStatus(id, { status:newStatus, comment });
      addToast('Statut mis à jour. Email envoyé au client.', 'success');
      setComment('');
      load();
    } catch (err) {
      addToast(err.response?.data?.error || 'Erreur', 'error');
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding:40 }}><Loader /></div>;
  if (!order)  return <div style={{ padding:40, color:'rgba(255,255,255,0.4)', fontSize:16 }}>Commande introuvable.</div>;

  const InfoRow = ({ label, value }) => (
    <div>
      <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', marginBottom:4 }}>{label}</p>
      <p style={{ fontSize:15, color:'#fff', fontWeight:500 }}>{value || '—'}</p>
    </div>
  );

  return (
    <div style={{ padding:'48px 44px 60px', minHeight:'100vh', background:'var(--black)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:40, flexWrap:'wrap' }}>
        <div>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E', marginBottom:8 }}>Commande</p>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:40, color:'#C8102E', letterSpacing:'0.02em' }}>{order.orderNumber}</h1>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24 }}>
        {/* ── Left ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Client info */}
          <div style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:28 }}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E', marginBottom:20 }}>Informations client</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
              <InfoRow label="Nom" value={`${order.user?.firstName} ${order.user?.lastName}`} />
              <InfoRow label="Email" value={order.user?.email} />
              <InfoRow label="Téléphone" value={order.user?.phone} />
              <InfoRow label="Adresse livraison" value={order.shippingAddress} />
              <InfoRow label="Membre depuis" value={formatDate(order.user?.createdAt)} />
              <InfoRow label="Commandé le" value={formatDate(order.createdAt)} />
            </div>
            {order.notes && (
              <div style={{ marginTop:18, padding:'14px 18px', background:'rgba(200,16,46,0.06)', border:'1px solid rgba(200,16,46,0.15)', borderRadius:8 }}>
                <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#C8102E', marginBottom:6 }}>Notes</p>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>{order.notes}</p>
              </div>
            )}
          </div>

          {/* Vehicles */}
          <div style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:28 }}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E', marginBottom:20 }}>Véhicules commandés</p>
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
              {order.items?.map(item => (
                <div key={item.id} style={{ display:'flex', gap:16, alignItems:'center' }}>
                  <img src={item.car.imageUrl} alt="" style={{ width:100, height:70, objectFit:'cover', borderRadius:8, flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:700, color:'#fff', fontSize:16 }}>{item.car.make} {item.car.model} {item.car.year}</p>
                    <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginTop:3 }}>{item.car.category} · {item.car.fuelType}</p>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)', marginTop:2 }}>Qté : {item.quantity}</p>
                  </div>
                  <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:22, color:'#C8102E', flexShrink:0 }}>{formatEuro(item.unitPrice)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Financial */}
          <div style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:28 }}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E', marginBottom:20 }}>Récapitulatif financier</p>
            <div style={{ display:'flex', flexDirection:'column', gap:12, fontSize:15 }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'rgba(255,255,255,0.4)' }}>Mode</span>
                <span style={{ color:'#fff', fontWeight:600 }}>{PAYMENT_LABELS[order.paymentType]}</span>
              </div>
              {order.discountAmount && (
                <div style={{ display:'flex', justifyContent:'space-between', color:'#22C55E' }}>
                  <span>Remise (-5%)</span><span>- {formatEuro(order.discountAmount)}</span>
                </div>
              )}
              {order.depositAmount && (
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>Acompte (25%)</span>
                  <span style={{ color:'#C8102E', fontWeight:700 }}>{formatEuro(order.depositAmount)}</span>
                </div>
              )}
              {order.monthlyAmount && (
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>Mensualité × {order.monthlyDuration}</span>
                  <span style={{ color:'#C8102E', fontWeight:700 }}>{formatEuro(order.monthlyAmount)}/mo</span>
                </div>
              )}
              <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'4px 0' }} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <span style={{ fontWeight:700, color:'#fff' }}>Total</span>
                <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:32, color:'#fff', letterSpacing:'-0.02em' }}>{formatEuro(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Tracking history */}
          {order.tracking?.length > 0 && (
            <div style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:28 }}>
              <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E', marginBottom:24 }}>Historique</p>
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                {order.tracking.map(event => (
                  <div key={event.id} className="timeline-item">
                    <div className="timeline-dot"><div style={{ width:8, height:8, borderRadius:'50%', background:'#C8102E' }} /></div>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
                      <div>
                        <StatusBadge status={event.status} />
                        {event.comment && <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:8, lineHeight:1.6 }}>{event.comment}</p>}
                        {event.admin && <p style={{ fontSize:11, color:'rgba(255,255,255,0.2)', marginTop:4 }}>par {event.admin.firstName} {event.admin.lastName}</p>}
                      </div>
                      <p style={{ fontSize:12, color:'rgba(255,255,255,0.2)', flexShrink:0 }}>{timeAgo(event.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right sticky ── */}
        <div>
          <form onSubmit={handleUpdate} style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:28, position:'sticky', top:24 }}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E', marginBottom:24 }}>Mettre à jour le statut</p>

            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <label key={val} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:8, cursor:'pointer', border:`1.5px solid ${newStatus===val?'#C8102E':'rgba(255,255,255,0.07)'}`, background:newStatus===val?'rgba(200,16,46,0.07)':'transparent', transition:'all 0.2s' }}>
                  <input type="radio" name="status" value={val} checked={newStatus===val} onChange={() => setNewStatus(val)} style={{ accentColor:'#C8102E', width:16, height:16 }} />
                  <StatusBadge status={val} />
                </label>
              ))}
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:10 }}>
                Message au client
              </label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
                placeholder="Ex : Votre véhicule est prêt pour la livraison..." className="input-luxury" style={{ resize:'none', fontSize:14 }} />
            </div>

            <button type="submit" disabled={saving} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:16, fontSize:14 }}>
              {saving ? '⏳ Envoi...' : '✉ Mettre à jour & Notifier'}
            </button>
            <p style={{ fontSize:12, textAlign:'center', color:'rgba(255,255,255,0.2)', marginTop:10 }}>
              Un email sera envoyé automatiquement au client
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
