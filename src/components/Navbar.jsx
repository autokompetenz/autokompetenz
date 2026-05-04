import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useCartStore, useLangStore } from '../store';
import { t, LANGUAGES } from '../utils/i18n';

export default function Navbar() {
  const { user, isAuthenticated, logout, isAdmin } = useAuthStore();
  const { cartCount, fetchCount } = useCartStore();
  const { lang, setLang } = useLangStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const [langOpen, setLangOpen]   = useState(false);
  const dropRef = useRef(null);
  const langRef = useRef(null);

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

  const S = {
    nav: {
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(10,10,11,0.96)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 5%', height: 76,
    },
    logo: { textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1.1 },
    logoMain: { fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 900, color: '#fff', letterSpacing: '0.04em' },
    logoSub: { fontSize: 9, letterSpacing: '0.4em', color: '#C8102E', textTransform: 'uppercase', marginTop: 2 },
    link: (active) => ({
      fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
      color: active ? '#fff' : 'rgba(255,255,255,0.55)', textDecoration: 'none',
      transition: 'color 0.2s', position: 'relative', paddingBottom: 2,
      borderBottom: active ? '1.5px solid #C8102E' : '1.5px solid transparent',
    }),
    waBtn: {
      background: '#25D366', color: '#fff', textDecoration: 'none',
      fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      padding: '10px 20px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 7,
      transition: 'all 0.25s', border: 'none',
    },
    dropdown: {
      position: 'absolute', right: 0, top: 'calc(100% + 10px)',
      background: '#18181A', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 10, boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
      overflow: 'hidden', minWidth: 200,
    },
  };

  const NavLink = ({ to, label }) => (
    <Link to={to} style={S.link(location.pathname.startsWith(to) && to !== '/')}>
      {label}
    </Link>
  );

  return (
    <>
      <nav style={S.nav}>
        {/* Logo */}
        <Link to="/" style={S.logo}>
          <span style={S.logoMain}>AUTO KOMPETENZ</span>
          <span style={S.logoSub}>GmbH · Emsdetten</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="nav-desktop">
          <NavLink to="/catalog" label={t('nav_vehicles', lang)} />
          <NavLink to="/simulation" label={t('nav_financing', lang)} />
          <NavLink to="/track" label={t('nav_track', lang)} />
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

          {/* Language Switcher */}
          <div style={{ position: 'relative' }} ref={langRef}>
            <button onClick={() => setLangOpen(!langOpen)} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, padding: '6px 12px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: 6, fontSize: 18, color: '#fff', transition: 'all 0.2s',
            }}>
              <span>{currentLang.flag}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{currentLang.code.toUpperCase()}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>▾</span>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  style={{ ...S.dropdown, minWidth: 160 }}>
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '11px 16px', background: l.code === lang ? 'rgba(200,16,46,0.12)' : 'transparent',
                        border: 'none', cursor: 'pointer', fontSize: 14, color: l.code === lang ? '#C8102E' : '#E0E0E0',
                        fontFamily: "'Outfit', sans-serif", fontWeight: l.code === lang ? 700 : 400,
                        transition: 'background 0.15s', textAlign: 'left',
                      }}
                      onMouseOver={e => { if (l.code !== lang) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseOut={e => { if (l.code !== lang) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{ fontSize: 20 }}>{l.flag}</span> {l.label}
                      {l.code === lang && <span style={{ marginLeft: 'auto', fontSize: 12 }}>✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* WhatsApp */}
          <a href="https://wa.me/4915788823274" target="_blank" rel="noopener noreferrer" style={S.waBtn}
            className="nav-desktop"
            onMouseOver={e => { e.currentTarget.style.background = '#1da851'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#25D366'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            💬 WhatsApp
          </a>

          {/* Cart */}
          {isAuthenticated && (
            <Link to="/cart" style={{ position: 'relative', color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = '#fff'}
              onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
              </svg>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: '#C8102E', color: '#fff', fontSize: 10, fontWeight: 800, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User menu */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }} ref={dropRef}>
              <button onClick={() => setUserOpen(!userOpen)} style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #9B0B22, #C8102E)',
                border: '2px solid rgba(200,16,46,0.4)',
                cursor: 'pointer', color: '#fff', fontFamily: "'Outfit', sans-serif",
                fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.2s',
              }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </button>
              <AnimatePresence>
                {userOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    style={S.dropdown}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{user?.firstName} {user?.lastName}</p>
                      <p style={{ fontSize: 12, color: '#8A8A90', marginTop: 2 }}>{user?.email}</p>
                    </div>
                    <div style={{ padding: '6px 0' }}>
                      {[
                        { to: '/dashboard', icon: '⊞', label: t('nav_dashboard', lang) },
                        { to: '/orders',    icon: '📦', label: t('nav_orders', lang) },
                        { to: '/profile',   icon: '👤', label: t('nav_profile', lang) },
                      ].map(({ to, icon, label }) => (
                        <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', fontSize: 14, color: '#E0E0E0', textDecoration: 'none', transition: 'background 0.15s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                          <span style={{ fontSize: 16 }}>{icon}</span> {label}
                        </Link>
                      ))}
                      {isAdmin() && (
                        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', fontSize: 14, color: '#C8102E', textDecoration: 'none', transition: 'background 0.15s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(200,16,46,0.08)'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                          <span>⚙</span> {t('nav_admin', lang)}
                        </Link>
                      )}
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                      <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', fontSize: 14, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'background 0.15s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        → {t('nav_logout', lang)}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }} className="nav-desktop">
              <Link to="/login" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                onMouseOver={e => e.target.style.color = '#fff'}
                onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.55)'}>
                {t('nav_login', lang)}
              </Link>
              <Link to="/register" className="btn-gold" style={{ fontSize: 11, padding: '10px 20px' }}>
                {t('nav_register', lang)}
              </Link>
            </div>
          )}

          {/* Hamburger */}
          <button className="nav-mobile" onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'none', flexDirection: 'column', gap: 5 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: 'block', width: 24, height: 2, background: '#fff', borderRadius: 1, transition: 'all 0.3s',
                transform: mobileOpen && i === 0 ? 'rotate(45deg) translate(5px,5px)' :
                           mobileOpen && i === 2 ? 'rotate(-45deg) translate(5px,-5px)' : 'none',
                opacity: mobileOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ position: 'absolute', top: 76, left: 0, right: 0, background: 'rgba(10,10,11,0.99)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '20px 5% 28px', overflow: 'hidden' }}>
              {[
                { to: '/catalog', label: t('nav_vehicles', lang) },
                { to: '/simulation', label: t('nav_financing', lang) },
                { to: '/track', label: t('nav_track', lang) },
              ].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  {label}
                </Link>
              ))}
              {/* Mobile lang switcher */}
              <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setMobileOpen(false); }}
                    style={{ background: l.code === lang ? 'rgba(200,16,46,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${l.code === lang ? '#C8102E' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 14, color: l.code === lang ? '#C8102E' : '#E0E0E0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{l.flag}</span> {l.label}
                  </button>
                ))}
              </div>
              <a href="https://wa.me/4915788823274" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 20, color: '#25D366', textDecoration: 'none', fontWeight: 700, fontSize: 18 }}>
                💬 WhatsApp
              </a>
              {!isAuthenticated && (
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>{t('nav_login', lang)}</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-gold" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>{t('nav_register', lang)}</Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <style>{`
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}
