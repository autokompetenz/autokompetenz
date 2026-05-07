import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderAPI } from '../services/api';
import { useAuthStore, useCartStore, useLangStore } from '../store';
import { formatEuro, formatDate, getInitials } from '../utils/helpers';
import { StatusBadge, Loader } from '../components/UI';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { cartCount } = useCartStore();
  const { lang } = useLangStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params] = useSearchParams();
  const isWelcome = params.get('welcome') === '1';

  useEffect(() => {
    orderAPI.getMy().then(r => { 
      console.log('=== Dashboard API Response ===');
      console.log('Orders data:', r.data);
      setOrders(Array.isArray(r.data) ? r.data.slice(0,5) : []); 
      setLoading(false); 
    }).catch(error => { 
      console.error('Dashboard API error:', error);
      setLoading(false); 
    });
  }, []);

  const maxMonthly = user?.monthlySalary ? Math.round(user.monthlySalary * 0.33) : null;

  const L = {
    welcome:    { fr:'Bienvenu(e) chez Auto Kompetenz !',   en:'Welcome to Auto Kompetenz!',    de:'Willkommen bei Auto Kompetenz!',   ar:'أهلاً بك في Auto Kompetenz!' },
    mySpace:    { fr:'Mon Espace',                           en:'My Account',                     de:'Mein Bereich',                     ar:'حسابي' },
    hello:      { fr:'Bonjour,',                             en:'Hello,',                         de:'Guten Tag,',                        ar:'مرحباً،' },
    orders:     { fr:'Commandes',                            en:'Orders',                         de:'Bestellungen',                     ar:'الطلبات' },
    cart:       { fr:'Panier',                               en:'Cart',                           de:'Warenkorb',                        ar:'السلة' },
    maxRate:    { fr:'Mensualité max.',                      en:'Max. monthly',                   de:'Max. Rate',                        ar:'الحد الأقصى الشهري' },
    financing:  { fr:'Capacité de financement',             en:'Financing capacity',             de:'Finanzierungskapazität',           ar:'القدرة التمويلية' },
    salary:     { fr:'Salaire',                              en:'Salary',                         de:'Gehalt',                           ar:'الراتب' },
    recent:     { fr:'Dernières commandes',                  en:'Recent orders',                  de:'Letzte Bestellungen',              ar:'آخر الطلبات' },
    seeAll:     { fr:'Voir tout',                            en:'See all',                        de:'Alle anzeigen',                    ar:'عرض الكل' },
    noOrders:   { fr:"Vous n'avez pas encore de commande.", en:"You don't have any orders yet.", de:'Noch keine Bestellungen.',         ar:'ليس لديك طلبات حتى الآن.' },
    discover:   { fr:'Découvrir nos véhicules',             en:'Discover our vehicles',          de:'Fahrzeuge entdecken',              ar:'اكتشف سياراتنا' },
    track:      { fr:'Suivre →',                             en:'Track →',                        de:'Verfolgen →',                      ar:'تتبع →' },
    whatsapp:   { fr:'Une question ? Contactez-nous sur WhatsApp — réponse rapide !', en:'A question? Contact us on WhatsApp — fast reply!', de:'Fragen? WhatsApp — schnelle Antwort!', ar:'سؤال؟ تواصل معنا عبر واتساب — رد سريع!' },
    nav: {
      dashboard:  { fr:'Mon Espace',           en:'My Account',         de:'Mein Bereich',       ar:'حسابي' },
      orders:     { fr:'Mes Commandes',         en:'My Orders',          de:'Bestellungen',       ar:'طلباتي' },
      cart:       { fr:'Mon Panier',            en:'My Cart',            de:'Warenkorb',          ar:'سلتي' },
      profile:    { fr:'Mon Profil',            en:'My Profile',         de:'Mein Profil',        ar:'ملفي' },
      simulation: { fr:'Simuler financement',  en:'Financing Simulator', de:'Finanzierung',       ar:'محاكاة التمويل' },
    },
  };

  const navItems = [
    { to:'/dashboard',  icon:'⊞', labelKey:'dashboard' },
    { to:'/orders',     icon:'📦', labelKey:'orders' },
    { to:'/cart',       icon:'🛒', labelKey:'cart' },
    { to:'/profile',    icon:'👤', labelKey:'profile' },
    { to:'/simulation', icon:'🧮', labelKey:'simulation' },
  ];

  return (
    <div style={{ minHeight:'100vh', paddingTop:76, background:'var(--black)' }}>
      {isWelcome && (
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
          style={{ background:'rgba(200,16,46,0.08)', borderBottom:'1px solid rgba(200,16,46,0.2)', padding:'14px 6%', textAlign:'center' }}>
          <p style={{ fontSize:15, color:'#C8102E', fontWeight:600 }}>🎉 {L.welcome[lang] || L.welcome.fr}</p>
        </motion.div>
      )}

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'48px 6%' }}>
        <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:36 }}>

          {/* ── Sidebar ── */}
          <aside>
            {/* Profile card */}
            <div style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:24, marginBottom:16, textAlign:'center' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg, #9B0B22, #C8102E)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Outfit', sans-serif", fontWeight:900, fontSize:22, color:'#fff', margin:'0 auto 16px', letterSpacing:'-0.01em' }}>
                {getInitials(user?.firstName, user?.lastName)}
              </div>
              <h2 style={{ fontFamily:"'Outfit', sans-serif", fontWeight:800, fontSize:20, color:'#fff', marginBottom:4 }}>{user?.firstName} {user?.lastName}</h2>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)' }}>{user?.email}</p>

              <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'18px 0' }} />

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[{ label:L.orders[lang], value:orders.length }, { label:L.cart[lang], value:cartCount }].map(({ label, value }) => (
                  <div key={label} style={{ background:'var(--dark)', borderRadius:8, padding:'12px 8px' }}>
                    <div style={{ fontFamily:"'Outfit', sans-serif", fontWeight:900, fontSize:28, color:'#C8102E' }}>{value}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2, fontWeight:600, letterSpacing:'0.05em' }}>{label}</div>
                  </div>
                ))}
              </div>

              {user?.monthlySalary && (
                <div style={{ marginTop:16, padding:'14px 16px', background:'rgba(200,16,46,0.06)', border:'1px solid rgba(200,16,46,0.15)', borderRadius:8, textAlign:'left' }}>
                  <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', color:'#C8102E', marginBottom:10 }}>{L.financing[lang]}</p>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:4 }}>
                    <span style={{ color:'rgba(255,255,255,0.4)' }}>{L.salary[lang]}</span>
                    <span style={{ color:'#fff', fontWeight:700 }}>{formatEuro(user.monthlySalary)}</span>
                  </div>
                  {maxMonthly && (
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
                      <span style={{ color:'rgba(255,255,255,0.4)' }}>{L.maxRate[lang]}</span>
                      <span style={{ color:'#C8102E', fontWeight:700 }}>{formatEuro(maxMonthly)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:8 }}>
              {navItems.map(({ to, icon, labelKey }) => (
                <Link key={to} to={to} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px', borderRadius:8, fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.45)', textDecoration:'none', transition:'all 0.2s', marginBottom:2 }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}>
                  <span style={{ fontSize:18 }}>{icon}</span>
                  {L.nav[labelKey]?.[lang] || L.nav[labelKey]?.fr}
                </Link>
              ))}
            </div>
          </aside>

          {/* ── Content ── */}
          <div>
            <div style={{ marginBottom:36 }}>
              <p style={{ fontSize:12, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'#C8102E', marginBottom:8 }}>{L.mySpace[lang]}</p>
              <h1 style={{ fontFamily:"'Outfit', sans-serif", fontWeight:900, fontSize:'clamp(36px,5vw,56px)', color:'#fff', letterSpacing:'-0.02em' }}>
                {L.hello[lang]} {user?.firstName}
              </h1>
            </div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:32 }}>
              {[
                { icon:'📦', label:L.orders[lang], value:orders.length },
                { icon:'🛒', label:L.cart[lang], value:cartCount },
                { icon:'💶', label:L.maxRate[lang], value:maxMonthly ? formatEuro(maxMonthly) : '—' },
              ].map(({ icon, label, value }) => (
                <motion.div key={label} whileHover={{ y:-3 }}
                  style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'22px 20px', transition:'border-color 0.3s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(200,16,46,0.25)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
                  <div style={{ fontSize:26, marginBottom:10 }}>{icon}</div>
                  <div style={{ fontFamily:"'Outfit', sans-serif", fontWeight:900, fontSize:30, color:'#C8102E', lineHeight:1 }}>{value}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginTop:6, fontWeight:600 }}>{label}</div>
                </motion.div>
              ))}
            </div>

            {/* Recent orders */}
            <div style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, overflow:'hidden' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize:12, fontWeight:800, letterSpacing:'0.25em', textTransform:'uppercase', color:'#C8102E' }}>{L.recent[lang]}</p>
                <Link to="/orders" style={{ fontSize:13, color:'rgba(255,255,255,0.4)', textDecoration:'none', fontWeight:600, transition:'color 0.2s' }}
                  onMouseOver={e => e.target.style.color = '#C8102E'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>
                  {L.seeAll[lang]} →
                </Link>
              </div>
              <div style={{ padding:'8px 16px 16px' }}>
                {loading ? <Loader size="sm" /> : orders.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'40px 0' }}>
                    <p style={{ fontSize:40, marginBottom:12 }}>📦</p>
                    <p style={{ color:'rgba(255,255,255,0.35)', fontSize:15, marginBottom:20 }}>{L.noOrders[lang]}</p>
                    <Link to="/catalog" className="btn-gold" style={{ fontSize:13 }}>{L.discover[lang]}</Link>
                  </div>
                ) : orders.map(order => (
                  <div key={order.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 8px', borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ flex:1 }}>
                      <p style={{ fontFamily:'monospace', fontSize:14, color:'#C8102E', fontWeight:700, letterSpacing:'0.05em' }}>{order.orderNumber}</p>
                      <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:3 }}>{formatDate(order.createdAt)}</p>
                    </div>
                    <StatusBadge status={order.status} />
                    <p style={{ fontFamily:"'Outfit', sans-serif", fontWeight:800, fontSize:18, color:'#fff' }}>{formatEuro(order.totalPrice)}</p>
                    <Link to={`/track/${order.orderNumber}`} style={{ fontSize:13, color:'#C8102E', textDecoration:'none', fontWeight:700, whiteSpace:'nowrap' }}>{L.track[lang]}</Link>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div style={{ marginTop:20, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, padding:'20px 24px', background:'rgba(37,211,102,0.05)', border:'1px solid rgba(37,211,102,0.15)', borderRadius:12 }}>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)', flex:1 }}>{L.whatsapp[lang]}</p>
              <a href="https://wa.me/4915788823274" target="_blank" rel="noopener noreferrer"
                style={{ background:'#25D366', color:'#fff', padding:'11px 22px', borderRadius:6, textDecoration:'none', fontFamily:"'Outfit', sans-serif", fontWeight:700, fontSize:14, display:'flex', alignItems:'center', gap:8, flexShrink:0, transition:'all 0.25s' }}
                onMouseOver={e => e.currentTarget.style.background = '#1da851'}
                onMouseOut={e => e.currentTarget.style.background = '#25D366'}>
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}