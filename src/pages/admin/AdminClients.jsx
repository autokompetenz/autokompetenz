import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { formatEuro, formatDate, getInitials } from '../../utils/helpers';
import { Loader } from '../../components/UI';

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.clients().then(r => { setClients(r.data.clients); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:40 }}><Loader text="Chargement des clients..." /></div>;

  return (
    <div style={{ padding:'48px 44px 60px', minHeight:'100vh', background:'var(--black)' }}>
      <div style={{ marginBottom:40 }}>
        <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E', marginBottom:10 }}>CRM</p>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:52, color:'#fff', letterSpacing:'-0.02em' }}>
          Clients <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'0.55em', fontWeight:400 }}>({clients.length})</span>
        </h1>
      </div>

      <div style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                {['Client','Contact','Salaire','Commandes','Total dépensé','Inscrit le'].map(h => (
                  <th key={h} style={{ textAlign:'left', fontSize:11, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)', padding:'14px 20px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)', transition:'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                  onMouseOut={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'14px 20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                      <div style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#9B0B22,#C8102E)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:15, color:'#fff', flexShrink:0 }}>
                        {getInitials(client.firstName, client.lastName)}
                      </div>
                      <div>
                        <p style={{ fontWeight:700, color:'#fff', fontSize:15 }}>{client.firstName} {client.lastName}</p>
                        <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:2 }}>@{client.username}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)' }}>{client.email}</p>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)', marginTop:2 }}>{client.phone || '—'}</p>
                  </td>
                  <td style={{ padding:'14px 20px', fontSize:14, color:'rgba(255,255,255,0.45)', fontWeight:600 }}>
                    {client.monthlySalary ? formatEuro(client.monthlySalary) : '—'}
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:24, color:'#C8102E' }}>{client.orderCount}</span>
                  </td>
                  <td style={{ padding:'14px 20px', fontWeight:700, color:'#fff', fontSize:15 }}>
                    {client.totalSpent > 0 ? formatEuro(client.totalSpent) : '—'}
                  </td>
                  <td style={{ padding:'14px 20px', fontSize:13, color:'rgba(255,255,255,0.35)' }}>
                    {formatDate(client.createdAt)}
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr><td colSpan={6} style={{ padding:'48px', textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:15 }}>Aucun client trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
