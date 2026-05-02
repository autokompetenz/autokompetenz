import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';
import { useAuthStore, useCartStore, useToastStore, useLangStore } from '../store';

export default function Login() {
  const { login } = useAuthStore();
  const { fetchCount } = useCartStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const L = {
    title:    { fr: 'Connexion',            en: 'Sign In',          de: 'Anmelden',        ar: 'تسجيل الدخول' },
    sub:      { fr: 'Accédez à votre espace Auto Kompetenz', en: 'Access your Auto Kompetenz account', de: 'Zugang zu Ihrem Konto', ar: 'الوصول إلى حسابك' },
    email:    { fr: 'Adresse e-mail',       en: 'Email address',    de: 'E-Mail-Adresse',  ar: 'البريد الإلكتروني' },
    password: { fr: 'Mot de passe',         en: 'Password',         de: 'Passwort',        ar: 'كلمة المرور' },
    btn:      { fr: 'Se connecter',         en: 'Sign in',          de: 'Anmelden',        ar: 'تسجيل الدخول' },
    loading:  { fr: 'Connexion...',         en: 'Signing in...',    de: 'Anmeldung...',    ar: 'جارٍ الدخول...' },
    noAccount:{ fr: 'Pas encore de compte ?', en: "Don't have an account?", de: 'Noch kein Konto?', ar: 'ليس لديك حساب؟' },
    register: { fr: "S'inscrire gratuitement", en: 'Register for free', de: 'Kostenlos registrieren', ar: 'سجل مجاناً' },
    demo:     { fr: 'Comptes de démonstration', en: 'Demo accounts', de: 'Demo-Zugänge', ar: 'حسابات تجريبية' },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data.user, data.token);
      fetchCount();
      addToast(`${L.title[lang] === 'Connexion' ? 'Bienvenue' : 'Welcome'}, ${data.user.firstName} !`, 'success');
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || (lang === 'fr' ? 'Email ou mot de passe incorrect' : lang === 'en' ? 'Invalid email or password' : lang === 'de' ? 'E-Mail oder Passwort falsch' : 'بريد أو كلمة مرور خاطئة'));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--black)' }}>
      {/* Left — decorative */}
      <div style={{ flex: 1, display: 'none', position: 'relative', overflow: 'hidden' }} className="login-bg">
        <div style={{ position: 'absolute', inset: 0, background: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80') center/cover no-repeat" }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,10,11,0.9), rgba(200,16,46,0.3))' }} />
        <div style={{ position: 'absolute', bottom: 60, left: 60, right: 60 }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 16, fontStyle: 'italic' }}>
            "L'excellence automobile, à votre service"
          </p>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)' }}>Auto Kompetenz GmbH · Emsdetten</p>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }} style={{ width: '100%' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'inline-block', textDecoration: 'none', marginBottom: 48 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '0.04em' }}>
              AUTO KOMPETENZ <span style={{ color: '#C8102E' }}>GmbH</span>
            </div>
            <div style={{ fontSize: 10, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: 3 }}>Emsdetten · Deutschland</div>
          </Link>

          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 42, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>
            {L.title[lang] || L.title.fr}
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginBottom: 36 }}>{L.sub[lang] || L.sub.fr}</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: 24, padding: '14px 18px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, fontSize: 14, color: '#EF4444' }}>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
                {L.email[lang] || L.email.fr}
              </label>
              <input type="email" required autoComplete="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="vous@example.com" className="input-luxury" style={{ fontSize: 16 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
                {L.password[lang] || L.password.fr}
              </label>
              <input type="password" required autoComplete="current-password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••" className="input-luxury" style={{ fontSize: 16 }} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', padding: '18px', fontSize: 15, marginTop: 8 }}>
              {loading ? L.loading[lang] : L.btn[lang] || L.btn.fr} {!loading && '→'}
            </button>
          </form>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '28px 0' }} />

          <p style={{ textAlign: 'center', fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>
            {L.noAccount[lang] || L.noAccount.fr}{' '}
            <Link to="/register" style={{ color: '#C8102E', textDecoration: 'none', fontWeight: 700, transition: 'opacity 0.2s' }}
              onMouseOver={e => e.target.style.opacity = '0.8'} onMouseOut={e => e.target.style.opacity = '1'}>
              {L.register[lang] || L.register.fr}
            </Link>
          </p>

          {/* Demo credentials */}
          <div style={{ marginTop: 28, padding: '16px 18px', background: 'rgba(200,16,46,0.06)', border: '1px solid rgba(200,16,46,0.15)', borderRadius: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C8102E', marginBottom: 10 }}>
              {L.demo[lang] || L.demo.fr}
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8 }}>
              Admin : autoKompetenz@gmail.com / <strong style={{ color: 'rgba(255,255,255,0.6)' }}>password</strong><br />
              Client : client@autokompetenz.com / <strong style={{ color: 'rgba(255,255,255,0.6)' }}>password</strong>
            </p>
          </div>
        </motion.div>
      </div>

      <style>{`@media(min-width:900px){ .login-bg { display:block !important; } }`}</style>
    </div>
  );
}
