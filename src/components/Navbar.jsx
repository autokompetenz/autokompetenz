import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useCartStore, useLangStore, useThemeStore } from '../store';
import { t, LANGUAGES } from '../utils/i18n';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function Navbar() {
  const { user, isAuthenticated, logout, isAdmin } = useAuthStore();
  const { cartCount, fetchCount } = useCartStore();
  const { lang, setLang } = useLangStore();
  const { theme, toggle } = useThemeStore();
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const [langOpen, setLangOpen]   = useState(false);
  const dropRef = useRef(null);
  const langRef = useRef(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { if (isAuthenticated) fetchCount(); }, [isAuthenticated]);
  useEffect(() => { setMobileOpen(false); setUserOpen(false); setLangOpen(false); }, [location.pathname]);

  useEffect(() => {
    const h = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setUserOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  const navBg = scrolled
    ? isDark ? 'rgba(10,10,11,0.97)' : 'rgba(255,255,255,0.97)'
    : 'transparent';
  const navBorder = scrolled ? '1px solid var(--border)' : '1px solid transparent';
  const linkColor = (active) => {
    if (scrolled || !location.pathname === '/') return active ? 'var(--red)' : 'var(--text-2)';
    return active ? '#fff' : 'rgba(255,255,255,0.65)';
  };

  // On home page with no scroll — always white text on dark hero
  const isHero = location.pathname === '/' && !scrolled;

  const NavLink = ({ to, label }) => {
    const active = location.pathname.startsWith(to) && to !== '/';
    return (
      <Link to={to} style={{
        fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: active ? 'var(--red)' : isHero ? 'rgba(255,255,255,0.7)' : 'var(--text-2)',
        textDecoration: 'none', transition: 'color 0.2s', paddingBottom: 2,
        borderBottom: active ? '1.5px solid var(--red)' : '1.5px solid transparent',
      }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--red)'}
        onMouseOut={e => e.currentTarget.style.color = active ? 'var(--red)' : isHero ? 'rgba(255,255,255,0.7)' : 'var(--text-2)'}
      >
        {label}
      </Link>
    );
  };

  const iconColor = isHero ? 'rgba(255,255,255,0.7)' : 'var(--text-2)';

  return (
    <>
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:1000,
        background: navBg,
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: navBorder,
        transition: 'all 0.4s var(--ease)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding: isMobile ? '0 4%' : '0 5%', height:72,
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration:'none', display:'flex', flexDirection:'column', lineHeight:1.1, flexShrink:0 }}>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:17, fontWeight:900, color: isHero ? '#fff' : 'var(--text)', letterSpacing:'0.05em' }}>
            AUTO KOMPETENZ
          </div>
          <div style={{ fontSize:9, letterSpacing:'0.4em', color:'var(--red)', textTransform:'uppercase', marginTop:2 }}>
            GmbH · Emsdetten
          </div>
        </Link>

        {/* Desktop nav links */}
        {!isMobile && (
          <div style={{ display:'flex', alignItems:'center', gap:28 }}>
            <NavLink to="/catalog"    label={t('nav_vehicles', lang)} />
            <NavLink to="/simulation" label={t('nav_financing', lang)} />
            <NavLink to="/track"      label={t('nav_track', lang)} />
          </div>
        )}

        {/* Right actions */}
        <div style={{ display:'flex', alignItems:'center', gap: isMobile ? 10 : 14 }}>

          {/* Theme toggle */}
          <button onClick={toggle} className="theme-toggle"
            title={isDark ? t('light_mode', lang) : t('dark_mode', lang)}
            style={{ background: isHero ? 'rgba(255,255,255,0.1)' : 'var(--bg-card2)', borderColor: isHero ? 'rgba(255,255,255,0.2)' : 'var(--border-2)' }}>
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Language Switcher */}
          <div style={{ position:'relative' }} ref={langRef}>
            <button onClick={() => setLangOpen(!langOpen)} style={{
              background: isHero ? 'rgba(255,255,255,0.1)' : 'var(--bg-card2)',
              border: `1.5px solid ${isHero ? 'rgba(255,255,255,0.2)' : 'var(--border-2)'}`,
              borderRadius:8, padding:'6px 11px', cursor:'pointer',
              display:'flex', alignItems:'center', gap:6,
              color: isHero ? '#fff' : 'var(--text)', transition:'all 0.2s',
            }}>
              <span style={{ fontSize:17 }}>{currentLang.flag}</span>
              <span style={{ fontSize:11, fontWeight:700 }}>{currentLang.code.toUpperCase()}</span>
              <span style={{ fontSize:9, opacity:0.5 }}>▾</span>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:6 }}
                  style={{ position:'absolute', right:0, top:'calc(100% + 8px)', background:'var(--bg-dropdown)', border:'1px solid var(--border-2)', borderRadius:10, boxShadow:'var(--shadow-xl)', overflow:'hidden', minWidth:168, zIndex:200 }}>
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }}
                      style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 16px', background: l.code === lang ? 'var(--red-bg)' : 'transparent', border:'none', cursor:'pointer', fontSize:14, color: l.code === lang ? 'var(--red)' : 'var(--text-2)', fontFamily:"'Outfit',sans-serif", fontWeight: l.code === lang ? 700 : 400, transition:'background 0.15s', textAlign:'left' }}
                      onMouseOver={e => { if (l.code !== lang) e.currentTarget.style.background = 'var(--bg-card2)'; }}
                      onMouseOut={e => { if (l.code !== lang) e.currentTarget.style.background = 'transparent'; }}>
                      <span style={{ fontSize:19 }}>{l.flag}</span> {l.label}
                      {l.code === lang && <span style={{ marginLeft:'auto', fontSize:11 }}>✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* WhatsApp — desktop only */}
          {!isMobile && (
            <a href="https://wa.me/4915788823274" target="_blank" rel="noopener noreferrer"
              style={{ background:'#25D366', color:'#fff', textDecoration:'none', fontFamily:"'Outfit',sans-serif", fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', padding:'9px 18px', borderRadius:6, display:'flex', alignItems:'center', gap:7, transition:'all 0.25s' }}
              onMouseOver={e => { e.currentTarget.style.background = '#1da851'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#25D366'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              💬 WhatsApp
            </a>
          )}

          {/* Cart */}
          {isAuthenticated && (
            <Link to="/cart" style={{ position:'relative', color: isHero ? 'rgba(255,255,255,0.7)' : 'var(--text-3)', transition:'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseOut={e => e.currentTarget.style.color = isHero ? 'rgba(255,255,255,0.7)' : 'var(--text-3)'}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
              </svg>
              {cartCount > 0 && (
                <span style={{ position:'absolute', top:-6, right:-6, width:17, height:17, background:'var(--red)', color:'#fff', fontSize:10, fontWeight:800, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User menu */}
          {isAuthenticated ? (
            <div style={{ position:'relative' }} ref={dropRef}>
              <button onClick={() => setUserOpen(!userOpen)} style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#9B0B22,#C8102E)', border:'2px solid rgba(200,16,46,0.35)', cursor:'pointer', color:'#fff', fontFamily:"'Outfit',sans-serif", fontSize:12, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', transition:'transform 0.2s', flexShrink:0 }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </button>
              <AnimatePresence>
                {userOpen && (
                  <motion.div initial={{ opacity:0, y:8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:0.95 }}
                    style={{ position:'absolute', right:0, top:'calc(100% + 10px)', background:'var(--bg-dropdown)', border:'1px solid var(--border-2)', borderRadius:10, boxShadow:'var(--shadow-xl)', overflow:'hidden', minWidth:210, zIndex:200 }}>
                    <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>
                      <p style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{user?.firstName} {user?.lastName}</p>
                      <p style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{user?.email}</p>
                    </div>
                    <div style={{ padding:'6px 0' }}>
                      {[
                        { to:'/dashboard', icon:'⊞', label:t('nav_dashboard', lang) },
                        { to:'/orders',    icon:'📦', label:t('nav_orders', lang) },
                        { to:'/profile',   icon:'👤', label:t('nav_profile', lang) },
                      ].map(({ to, icon, label }) => (
                        <Link key={to} to={to} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 18px', fontSize:14, color:'var(--text-2)', textDecoration:'none', transition:'background 0.15s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                          <span style={{ fontSize:16 }}>{icon}</span> {label}
                        </Link>
                      ))}
                      {isAdmin() && (
                        <Link to="/admin" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 18px', fontSize:14, color:'var(--red)', textDecoration:'none', transition:'background 0.15s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'var(--red-bg)'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                          <span>⚙</span> {t('nav_admin', lang)}
                        </Link>
                      )}
                      <div style={{ height:1, background:'var(--border)', margin:'4px 0' }} />
                      <button onClick={handleLogout} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 18px', fontSize:14, color:'#DC2626', background:'none', border:'none', cursor:'pointer', fontFamily:"'Outfit',sans-serif", transition:'background 0.15s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        → {t('nav_logout', lang)}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            !isMobile && (
              <div style={{ display:'flex', gap:10 }}>
                <Link to="/login" style={{ fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color: isHero ? 'rgba(255,255,255,0.65)' : 'var(--text-2)', textDecoration:'none', transition:'color 0.2s', display:'flex', alignItems:'center' }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseOut={e => e.currentTarget.style.color = isHero ? 'rgba(255,255,255,0.65)' : 'var(--text-2)'}>
                  {t('nav_login', lang)}
                </Link>
                <Link to="/register" className="btn-gold" style={{ fontSize:11, padding:'9px 18px' }}>
                  {t('nav_register', lang)}
                </Link>
              </div>
            )
          )}

          {/* Hamburger */}
          {isMobile && (
            <button onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background:'none', border:'none', cursor:'pointer', padding:4, display:'flex', flexDirection:'column', gap:5, flexShrink:0 }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ display:'block', width:23, height:2, background: isHero ? '#fff' : 'var(--text)', borderRadius:1, transition:'all 0.3s',
                  transform: mobileOpen && i===0 ? 'rotate(45deg) translate(5px,5px)' : mobileOpen && i===2 ? 'rotate(-45deg) translate(5px,-5px)' : 'none',
                  opacity: mobileOpen && i===1 ? 0 : 1 }} />
              ))}
            </button>
          )}
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && isMobile && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
              style={{ position:'absolute', top:72, left:0, right:0, background:'var(--bg-nav)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)', padding:'20px 5% 28px', overflow:'hidden', zIndex:999 }}>
              {[
                { to:'/catalog',    label:t('nav_vehicles', lang) },
                { to:'/simulation', label:t('nav_financing', lang) },
                { to:'/track',      label:t('nav_track', lang) },
              ].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                  style={{ display:'block', padding:'14px 0', borderBottom:'1px solid var(--border)', fontFamily:"'Outfit',sans-serif", fontSize:20, fontWeight:700, color:'var(--text)', textDecoration:'none' }}>
                  {label}
                </Link>
              ))}
              {!isAuthenticated ? (
                <div style={{ display:'flex', gap:12, marginTop:20 }}>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:13 }}>{t('nav_login', lang)}</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-gold" style={{ flex:1, justifyContent:'center', fontSize:13 }}>{t('nav_register', lang)}</Link>
                </div>
              ) : (
                <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:2 }}>
                  {[
                    { to:'/dashboard', icon:'⊞', label:t('nav_dashboard', lang) },
                    { to:'/orders',    icon:'📦', label:t('nav_orders', lang) },
                    { to:'/cart',      icon:'🛒', label:t('nav_cart', lang) },
                    { to:'/profile',   icon:'👤', label:t('nav_profile', lang) },
                  ].map(({ to, icon, label }) => (
                    <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                      style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid var(--border)', fontSize:16, color:'var(--text-2)', textDecoration:'none' }}>
                      <span style={{ fontSize:20 }}>{icon}</span>{label}
                    </Link>
                  ))}
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 0', fontSize:16, color:'#DC2626', background:'none', border:'none', cursor:'pointer', fontFamily:"'Outfit',sans-serif", marginTop:4, textAlign:'left' }}>
                    → {t('nav_logout', lang)}
                  </button>
                </div>
              )}
              <a href="https://wa.me/4915788823274" target="_blank" rel="noopener noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:8, marginTop:20, color:'#25D366', textDecoration:'none', fontWeight:700, fontSize:17 }}>
                💬 WhatsApp
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
