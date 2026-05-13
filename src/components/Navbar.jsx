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
  const [scrolled, setScrolled]    = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false); // single unified menu
  const menuRef = useRef(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { if (isAuthenticated) fetchCount(); }, [isAuthenticated]);
  useEffect(() => { setMobileOpen(false); setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };
  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const isHero = location.pathname === '/' && !scrolled;

  const NavLink = ({ to, label }) => {
    const active = location.pathname.startsWith(to) && to !== '/';
    return (
      <Link to={to} style={{
        fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: active ? 'var(--red)' : isHero ? 'rgba(255,255,255,0.7)' : 'var(--text-2)',
        textDecoration: 'none', transition: 'color 0.2s',
        borderBottom: active ? '1.5px solid var(--red)' : '1.5px solid transparent', paddingBottom: 2,
      }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--red)'}
        onMouseOut={e => e.currentTarget.style.color = active ? 'var(--red)' : isHero ? 'rgba(255,255,255,0.7)' : 'var(--text-2)'}>
        {label}
      </Link>
    );
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? (isDark ? 'rgba(10,10,11,0.97)' : 'rgba(255,255,255,0.97)') : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.4s var(--ease)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '0 4%' : '0 5%', height: 68,
      }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1.1, flexShrink: 0 }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 900, color: isHero ? '#fff' : 'var(--text)', letterSpacing: '0.05em' }}>
            AUTO KOMPETENZ
          </div>
          <div style={{ fontSize: 9, letterSpacing: '0.4em', color: 'var(--red)', textTransform: 'uppercase', marginTop: 2 }}>
            GmbH · Emsdetten
          </div>
        </Link>

        {/* Desktop nav links — centre */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <NavLink to="/catalog"    label={t('nav_vehicles', lang)} />
            <NavLink to="/simulation" label={t('nav_financing', lang)} />
            <NavLink to="/track"      label={t('nav_track', lang)} />
          </div>
        )}

        {/* Right side — max 3 elements */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Cart (only when logged in) */}
          {isAuthenticated && (
            <Link to="/cart" style={{ position: 'relative', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: isHero ? 'rgba(255,255,255,0.1)' : 'var(--bg-card2)', border: `1px solid ${isHero ? 'rgba(255,255,255,0.15)' : 'var(--border)'}`, color: isHero ? 'rgba(255,255,255,0.8)' : 'var(--text-2)', transition: 'all 0.2s', flexShrink: 0 }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = isHero ? 'rgba(255,255,255,0.15)' : 'var(--border)'; e.currentTarget.style.color = isHero ? 'rgba(255,255,255,0.8)' : 'var(--text-2)'; }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
              </svg>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, background: 'var(--red)', color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Unified menu button — replaces theme + lang + user separately */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: isHero ? 'rgba(255,255,255,0.1)' : 'var(--bg-card2)', border: `1.5px solid ${menuOpen ? 'var(--red)' : isHero ? 'rgba(255,255,255,0.15)' : 'var(--border)'}`, borderRadius: 8, padding: '7px 12px', cursor: 'pointer', transition: 'all 0.2s', height: 38 }}>
              {isAuthenticated ? (
                <>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#9B0B22,#C8102E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  {!isMobile && <span style={{ fontSize: 13, fontWeight: 600, color: isHero ? '#fff' : 'var(--text-2)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.firstName}</span>}
                </>
              ) : (
                <span style={{ fontSize: 16, lineHeight: 1 }}>☰</span>
              )}
              <span style={{ fontSize: 10, color: isHero ? 'rgba(255,255,255,0.5)' : 'var(--text-3)' }}>▾</span>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', background: 'var(--bg-dropdown)', border: '1px solid var(--border-2)', borderRadius: 12, boxShadow: 'var(--shadow-xl)', overflow: 'hidden', minWidth: 230, zIndex: 200 }}>

                  {/* User info */}
                  {isAuthenticated && (
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card2)' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{user?.firstName} {user?.lastName}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{user?.email}</p>
                    </div>
                  )}

                  {/* Navigation links */}
                  <div style={{ padding: '6px 0' }}>
                    {isAuthenticated ? (
                      <>
                        {[
                          { to: '/dashboard', icon: '⊞', label: t('nav_dashboard', lang) },
                          { to: '/orders',    icon: '📦', label: t('nav_orders', lang) },
                          { to: '/profile',   icon: '👤', label: t('nav_profile', lang) },
                        ].map(({ to, icon, label }) => (
                          <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', fontSize: 14, color: 'var(--text-2)', textDecoration: 'none', transition: 'background 0.15s' }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{icon}</span> {label}
                          </Link>
                        ))}
                        {isAdmin() && (
                          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', fontSize: 14, color: 'var(--red)', textDecoration: 'none', transition: 'background 0.15s' }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--red-bg)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>⚙</span> {t('nav_admin', lang)}
                          </Link>
                        )}
                      </>
                    ) : (
                      <>
                        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', fontSize: 14, color: 'var(--text-2)', textDecoration: 'none', transition: 'background 0.15s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                          <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>→</span> {t('nav_login', lang)}
                        </Link>
                        <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', fontSize: 14, color: 'var(--red)', textDecoration: 'none', fontWeight: 700, transition: 'background 0.15s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'var(--red-bg)'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                          <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>✦</span> {t('nav_register', lang)}
                        </Link>
                      </>
                    )}
                  </div>

                  <div style={{ height: 1, background: 'var(--border)' }} />

                  {/* Theme toggle */}
                  <div style={{ padding: '6px 0' }}>
                    <button onClick={toggle}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', fontSize: 14, color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", transition: 'background 0.15s', textAlign: 'left' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{isDark ? '☀️' : '🌙'}</span>
                      {isDark ? t('light_mode', lang) : t('dark_mode', lang)}
                    </button>
                  </div>

                  <div style={{ height: 1, background: 'var(--border)' }} />

                  {/* Language selector */}
                  <div style={{ padding: '8px 0' }}>
                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '4px 18px 8px' }}>
                      {lang === 'fr' ? 'Langue' : lang === 'en' ? 'Language' : lang === 'de' ? 'Sprache' : lang === 'es' ? 'Idioma' : lang === 'it' ? 'Lingua' : 'Idioma'}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: '0 10px 6px' }}>
                      {LANGUAGES.map(l => (
                        <button key={l.code} onClick={() => { setLang(l.code); setMenuOpen(false); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 10px', background: l.code === lang ? 'var(--red-bg)' : 'transparent', border: `1px solid ${l.code === lang ? 'var(--red-border)' : 'transparent'}`, borderRadius: 6, cursor: 'pointer', fontSize: 13, color: l.code === lang ? 'var(--red)' : 'var(--text-2)', fontFamily: "'Outfit',sans-serif", fontWeight: l.code === lang ? 700 : 400, transition: 'all 0.15s' }}
                          onMouseOver={e => { if (l.code !== lang) e.currentTarget.style.background = 'var(--bg-card2)'; }}
                          onMouseOut={e => { if (l.code !== lang) e.currentTarget.style.background = 'transparent'; }}>
                          <span style={{ fontSize: 16 }}>{l.flag}</span> {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logout */}
                  {isAuthenticated && (
                    <>
                      <div style={{ height: 1, background: 'var(--border)' }} />
                      <div style={{ padding: '6px 0 8px' }}>
                        <button onClick={handleLogout}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', fontSize: 14, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", transition: 'background 0.15s', textAlign: 'left' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                          <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>→</span> {t('nav_logout', lang)}
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hamburger — mobile only */}
          {isMobile && (
            <button onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ display: 'block', width: 22, height: 2, background: isHero ? '#fff' : 'var(--text)', borderRadius: 1, transition: 'all 0.3s',
                  transform: mobileOpen && i === 0 ? 'rotate(45deg) translate(5px,5px)' : mobileOpen && i === 2 ? 'rotate(-45deg) translate(5px,-5px)' : 'none',
                  opacity: mobileOpen && i === 1 ? 0 : 1 }} />
              ))}
            </button>
          )}
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && isMobile && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ position: 'absolute', top: 68, left: 0, right: 0, background: isDark ? 'rgba(10,10,11,0.98)' : 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '16px 5% 24px', overflow: 'hidden', zIndex: 999 }}>
              {[
                { to: '/catalog',    label: t('nav_vehicles', lang) },
                { to: '/simulation', label: t('nav_financing', lang) },
                { to: '/track',      label: t('nav_track', lang) },
              ].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                  style={{ display: 'block', padding: '13px 0', borderBottom: '1px solid var(--border)', fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}>
                  {label}
                </Link>
              ))}
              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <a href="https://wa.me/4915788823274" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#25D366', textDecoration: 'none', fontWeight: 700, fontSize: 16, padding: '10px 0' }}>
                  💬 WhatsApp
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}