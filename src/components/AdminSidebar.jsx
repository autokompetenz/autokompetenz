import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';

const links = [
  { to:'/admin',           icon:'⊞', label:'Dashboard',          exact:true },
  { to:'/admin/orders',    icon:'📦', label:'Commandes' },
  { to:'/admin/cars',      icon:'🚗', label:'Véhicules' },
  { to:'/admin/cars/new',  icon:'＋', label:'Ajouter un véhicule' },
  { to:'/admin/clients',   icon:'👥', label:'Clients' },
];

export default function AdminSidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <aside style={{ width:268, minHeight:'100vh', background:'var(--bg-card2)', borderRight:'1px solid rgba(255,255,255,0.05)', position:'fixed', top:0, left:0, zIndex:100, display:'flex', flexDirection:'column' }}>
      {/* Logo */}
      <div style={{ padding:'24px 24px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:17, fontWeight:900, color:'#fff', letterSpacing:'0.04em' }}>
          AUTO <span style={{ color:'#C8102E' }}>KOMPETENZ</span>
        </div>
        <div style={{ fontSize:9, letterSpacing:'0.35em', color:'rgba(255,255,255,0.2)', textTransform:'uppercase', marginTop:4 }}>Administration</div>
      </div>

      {/* Admin info */}
      <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#9B0B22,#C8102E)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:14, color:'#fff', flexShrink:0 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{user?.firstName} {user?.lastName}</p>
            <p style={{ fontSize:11, color:'#C8102E', marginTop:1, fontWeight:600 }}>Administrateur</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'12px 12px' }}>
        {links.map(({ to, icon, label, exact }) => (
          <NavLink key={to} to={to} end={exact}
            style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:8,
              fontSize:14, textDecoration:'none', marginBottom:2, transition:'all 0.2s',
              color: isActive ? '#C8102E' : 'rgba(255,255,255,0.4)',
              background: isActive ? 'rgba(200,16,46,0.1)' : 'transparent',
              borderLeft: `3px solid ${isActive ? '#C8102E' : 'transparent'}`,
              fontWeight: isActive ? 700 : 500,
            })}>
            <span style={{ fontSize:17 }}>{icon}</span> {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding:'12px 12px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => { logout(); navigate('/'); }}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:8, fontSize:14, color:'rgba(239,68,68,0.7)', background:'none', border:'none', cursor:'pointer', fontFamily:"'Outfit',sans-serif", fontWeight:600, textAlign:'left', transition:'all 0.2s' }}
          onMouseOver={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='#EF4444'; }}
          onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(239,68,68,0.7)'; }}>
          → Déconnexion
        </button>
        <NavLink to="/" style={{ display:'block', fontSize:12, color:'rgba(255,255,255,0.2)', textDecoration:'none', padding:'6px 14px', marginTop:4, transition:'color 0.2s' }}
          onMouseOver={e => e.target.style.color='#C8102E'}
          onMouseOut={e => e.target.style.color='rgba(255,255,255,0.2)'}>
          ← Retour au site
        </NavLink>
      </div>
    </aside>
  );
}
