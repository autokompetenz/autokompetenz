import { useState, useEffect, useRef, useCallback } from 'react';
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

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  const isDark = theme === 'dark';

  // Better scroll detection
  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 5);
    };

    fn();

    window.addEventListener('scroll', fn);

    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Fetch cart
  useEffect(() => {
    if (isAuthenticated) fetchCount();
  }, [isAuthenticated]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close outside click
  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', h);

    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ESC close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  // Lock body scroll mobile
  useEffect(() => {
    document.body.style.overflow =
      menuOpen && isMobile ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, isMobile]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
    setMenuOpen(false);
  }, [logout, navigate]);

  // Better hero detection
  const isHero =
    location.pathname === '/' &&
    window.scrollY < 80;

  const F = "'Outfit', sans-serif";

  // Better readable colors
  const navTextColor =
    isHero
      ? 'rgba(255,255,255,0.92)'
      : isDark
      ? 'rgba(255,255,255,0.85)'
      : '#222';

  const iconColor =
    isHero
      ? 'rgba(255,255,255,0.92)'
      : isDark
      ? 'rgba(255,255,255,0.85)'
      : '#222';

  const menuBg = isDark
    ? 'rgba(10,10,11,0.98)'
    : 'rgba(255,255,255,0.98)';

  const menuText = isDark ? '#fff' : '#111';

  const menuText2 = isDark
    ? 'rgba(255,255,255,0.72)'
    : '#444';

  const menuText3 = isDark
    ? 'rgba(255,255,255,0.4)'
    : '#888';

  const menuBorder = isDark
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(0,0,0,0.08)';

  const menuHover = isDark
    ? 'rgba(255,255,255,0.05)'
    : 'rgba(0,0,0,0.04)';

  const NavLink = ({ to, label }) => {
    const active =
      location.pathname === to ||
      location.pathname.startsWith(to + '/');

    return (
      <Link
        to={to}
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: active ? 'var(--red)' : navTextColor,
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          borderBottom: active
            ? '1.5px solid var(--red)'
            : '1.5px solid transparent',
          paddingBottom: 2,
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.color = 'var(--red)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.color =
            active ? 'var(--red)' : navTextColor;
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,

        background: scrolled
          ? isDark
            ? 'rgba(10,10,11,0.92)'
            : 'rgba(255,255,255,0.92)'
          : 'rgba(0,0,0,0.15)',

        backdropFilter: 'blur(20px) saturate(180%)',

        borderBottom: scrolled
          ? `1px solid ${menuBorder}`
          : '1px solid transparent',

        transition: 'all 0.35s ease',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',

        padding: isMobile ? '0 4%' : '0 5%',
        height: 68,
      }}
    >
      {/* LOGO */}
      <Link
        to="/"
        style={{
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          lineHeight: 1.1,
        }}
      >
        <div
          style={{
            fontFamily: F,
            fontSize: 16,
            fontWeight: 900,
            color: isDark || isHero ? '#fff' : '#111',
            letterSpacing: '0.05em',
          }}
        >
          AUTO KOMPETENZ
        </div>

        <div
          style={{
            fontSize: 9,
            letterSpacing: '0.4em',
            color: 'var(--red)',
            textTransform: 'uppercase',
            marginTop: 2,
          }}
        >
          GmbH · Emsdetten
        </div>
      </Link>

      {/* Desktop links */}
      {!isMobile && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
          }}
        >
          <NavLink
            to="/catalog"
            label={t('nav_vehicles', lang)}
          />

          <NavLink
            to="/simulation"
            label={t('nav_financing', lang)}
          />

          <NavLink
            to="/track"
            label={t('nav_track', lang)}
          />
        </div>
      )}

      {/* RIGHT SIDE */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {/* CART */}
        {isAuthenticated && (
          <Link
            to="/cart"
            style={{
              position: 'relative',
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,

              background: isHero
                ? 'rgba(255,255,255,0.14)'
                : isDark
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(0,0,0,0.05)',

              border: `1px solid ${menuBorder}`,

              color: iconColor,

              transition: 'all 0.2s',
            }}
          >
            🛒

            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  width: 16,
                  height: 16,
                  background: 'var(--red)',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 800,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        )}

        {/* MENU */}
        <div
          style={{ position: 'relative' }}
          ref={menuRef}
        >
          <button
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              background: isHero
                ? 'rgba(255,255,255,0.14)'
                : isDark
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(0,0,0,0.05)',

              border: `1px solid ${
                menuOpen ? 'var(--red)' : menuBorder
              }`,

              borderRadius: 8,

              width: 38,
              height: 38,

              cursor: 'pointer',

              color: iconColor,

              transition: 'all 0.2s ease',
            }}
          >
            <span
              style={{
                fontSize: 20,
                lineHeight: 1,
              }}
            >
              {menuOpen ? '✕' : '☰'}
            </span>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 8,
                  scale: 0.96,
                }}
                transition={{
                  duration: 0.22,
                  ease: 'easeOut',
                }}
                style={{
                  position: isMobile
                    ? 'fixed'
                    : 'absolute',

                  top: isMobile
                    ? 68
                    : 'calc(100% + 10px)',

                  right: 0,

                  left: isMobile ? 0 : 'auto',

                  bottom: isMobile ? 0 : 'auto',

                  background: menuBg,

                  border: isMobile
                    ? 'none'
                    : `1px solid ${menuBorder}`,

                  borderTop: isMobile
                    ? `1px solid ${menuBorder}`
                    : undefined,

                  borderRadius: isMobile ? 0 : 12,

                  boxShadow: isMobile
                    ? 'none'
                    : '0 8px 40px rgba(0,0,0,0.18)',

                  overflow: 'auto',

                  minWidth: isMobile
                    ? '100%'
                    : 240,

                  zIndex: 200,

                  padding: isMobile
                    ? '20px 5%'
                    : '10px 0',
                }}
              >
                <div
                  style={{
                    padding: '0 18px 10px',
                    borderBottom: `1px solid ${menuBorder}`,
                  }}
                >
                  <p
                    style={{
                      color: menuText,
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {user?.firstName || 'Guest'}
                  </p>

                  <p
                    style={{
                      color: menuText3,
                      fontSize: 12,
                    }}
                  >
                    {user?.email || 'Not connected'}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '8px 0',
                  }}
                >
                  <Link
                    to="/dashboard"
                    style={{
                      padding: '12px 18px',
                      textDecoration: 'none',
                      color: menuText2,
                    }}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/profile"
                    style={{
                      padding: '12px 18px',
                      textDecoration: 'none',
                      color: menuText2,
                    }}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={toggle}
                    style={{
                      padding: '12px 18px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      color: menuText2,
                      cursor: 'pointer',
                    }}
                  >
                    {isDark
                      ? t('light_mode', lang)
                      : t('dark_mode', lang)}
                  </button>

                  {isAuthenticated && (
                    <button
                      onClick={handleLogout}
                      style={{
                        padding: '12px 18px',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        color: '#DC2626',
                        cursor: 'pointer',
                      }}
                    >
                      {t('nav_logout', lang)}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}