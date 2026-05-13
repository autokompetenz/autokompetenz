import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { carAPI } from '../../services/api';
import { useToastStore } from '../../store';
import { formatEuro } from '../../utils/helpers';
import { Loader } from '../../components/UI';

export default function AdminCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();

  const load = () => {
    carAPI.getAll({}).then(r => { setCars(r.data.cars); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const handleToggle = async (car) => {
    try {
      const { data } = await carAPI.toggle(car.id);
      setCars(prev => prev.map(c => c.id === car.id ? data.car : c));
      addToast(data.message || 'Statut mis à jour', 'success');
    } catch { addToast('Erreur', 'error'); }
  };

  if (loading) return <div style={{ padding:40 }}><Loader text="Chargement des véhicules..." /></div>;

  return (
    <div style={{ padding:'48px 44px 60px', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:20, marginBottom:40 }}>
        <div>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E', marginBottom:10 }}>Inventaire</p>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:52, color:'#fff', letterSpacing:'-0.02em' }}>
            Véhicules <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'0.6em' }}>({cars.length})</span>
          </h1>
        </div>
        <Link to="/admin/cars/new" className="btn-primary" style={{ fontSize:14, padding:'14px 28px', alignSelf:'flex-end' }}>
          + Ajouter un véhicule
        </Link>
      </div>

      <div style={{ background:'var(--bg-card)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                {['Photo','Véhicule','Année','Prix','Stock','Catégorie','Statut','Actions'].map(h => (
                  <th key={h} style={{ textAlign:'left', fontSize:11, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)', padding:'14px 20px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cars.map(car => (
                <tr key={car.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)', transition:'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                  onMouseOut={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'12px 20px' }}>
                    <img src={car.imageUrl} alt="" style={{ width:72, height:52, objectFit:'cover', borderRadius:6 }} />
                  </td>
                  <td style={{ padding:'12px 20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <p style={{ fontWeight:700, color:'#fff', fontSize:15 }}>{car.make} {car.model}</p>
                      {car.featured && <span style={{ fontSize:9, fontWeight:800, background:'rgba(200,16,46,0.15)', color:'#C8102E', border:'1px solid rgba(200,16,46,0.25)', padding:'2px 8px', borderRadius:3, letterSpacing:'0.1em' }}>★ TOP</span>}
                    </div>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{car.fuelType} · {car.transmission}</p>
                  </td>
                  <td style={{ padding:'12px 20px', color:'rgba(255,255,255,0.45)', fontSize:14 }}>{car.year}</td>
                  <td style={{ padding:'12px 20px', fontWeight:700, color:'#C8102E', fontSize:15 }}>{formatEuro(car.price)}</td>
                  <td style={{ padding:'12px 20px' }}>
                    <span style={{ fontSize:14, fontWeight:700, color:car.stock > 0 ? '#22C55E' : '#EF4444' }}>
                      {car.stock > 0 ? `${car.stock} dispo.` : 'Épuisé'}
                    </span>
                  </td>
                  <td style={{ padding:'12px 20px', color:'rgba(255,255,255,0.4)', fontSize:13 }}>{car.category}</td>
                  <td style={{ padding:'12px 20px' }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:12, background:car.isActive?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)', color:car.isActive?'#22C55E':'#EF4444', border:`1px solid ${car.isActive?'rgba(34,197,94,0.25)':'rgba(239,68,68,0.25)'}` }}>
                      {car.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ padding:'12px 20px' }}>
                    <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                      <Link to={`/admin/cars/${car.id}/edit`} style={{ fontSize:13, color:'#C8102E', textDecoration:'none', fontWeight:700, transition:'opacity 0.2s' }}
                        onMouseOver={e => e.target.style.opacity='0.7'} onMouseOut={e => e.target.style.opacity='1'}>
                        Modifier
                      </Link>
                      <button onClick={() => { if (window.confirm(`${car.isActive?'Désactiver':'Activer'} ce véhicule ?`)) handleToggle(car); }}
                        style={{ fontSize:13, color:car.isActive?'rgba(239,68,68,0.6)':'rgba(34,197,94,0.6)', background:'none', border:'none', cursor:'pointer', fontFamily:"'Outfit',sans-serif", fontWeight:600, transition:'color 0.2s' }}
                        onMouseOver={e => e.target.style.color=car.isActive?'#EF4444':'#22C55E'}
                        onMouseOut={e => e.target.style.color=car.isActive?'rgba(239,68,68,0.6)':'rgba(34,197,94,0.6)'}>
                        {car.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
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
