import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';
import { useAuthStore, useToastStore, useLangStore } from '../store';

export default function Register() {
  const { login } = useAuthStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName:'', lastName:'', username:'', email:'', phone:'', monthlySalary:'', password:'', confirmPassword:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const L = {
    title:    { fr: 'Créer un compte',   en: 'Create account',   de: 'Konto erstellen',  ar: 'إنشاء حساب' },
    sub:      { fr: 'Rejoignez la communauté Auto Kompetenz', en: 'Join the Auto Kompetenz community', de: 'Der Auto Kompetenz Community beitreten', ar: 'انضم إلى مجتمع Auto Kompetenz' },
    firstName:{ fr: 'Prénom',            en: 'First name',       de: 'Vorname',          ar: 'الاسم الأول' },
    lastName: { fr: 'Nom',               en: 'Last name',        de: 'Nachname',         ar: 'الاسم الأخير' },
    username: { fr: "Nom d'utilisateur", en: 'Username',         de: 'Benutzername',     ar: 'اسم المستخدم' },
    email:    { fr: 'Adresse e-mail',    en: 'Email address',    de: 'E-Mail-Adresse',   ar: 'البريد الإلكتروني' },
    phone:    { fr: 'Téléphone',         en: 'Phone',            de: 'Telefon',          ar: 'الهاتف' },
    salary:   { fr: 'Salaire mensuel (€)', en: 'Monthly salary (€)', de: 'Monatsgehalt (€)', ar: 'الراتب الشهري (€)' },
    password: { fr: 'Mot de passe',      en: 'Password',         de: 'Passwort',         ar: 'كلمة المرور' },
    confirm:  { fr: 'Confirmer le mot de passe', en: 'Confirm password', de: 'Passwort bestätigen', ar: 'تأكيد كلمة المرور' },
    btn:      { fr: 'Créer mon compte',  en: 'Create my account', de: 'Konto erstellen',  ar: 'إنشاء حسابي' },
    loading:  { fr: 'Création...',       en: 'Creating...',      de: 'Wird erstellt...',  ar: 'جارٍ الإنشاء...' },
    haveAcct: { fr: 'Déjà un compte ?', en: 'Already have an account?', de: 'Schon ein Konto?', ar: 'لديك حساب بالفعل؟' },
    signIn:   { fr: 'Se connecter',      en: 'Sign in',          de: 'Anmelden',          ar: 'تسجيل الدخول' },
    optional: { fr: 'optionnel',         en: 'optional',         de: 'optional',          ar: 'اختياري' },
    minChars: { fr: 'min. 8 caractères', en: 'min. 8 characters', de: 'mind. 8 Zeichen',  ar: '٨ أحرف على الأقل' },
    errMatch: { fr: 'Les mots de passe ne correspondent pas', en: 'Passwords do not match', de: 'Passwörter stimmen nicht überein', ar: 'كلمتا المرور غير متطابقتين' },
    errLen:   { fr: 'Mot de passe trop court (min. 8 caractères)', en: 'Password too short (min. 8 chars)', de: 'Passwort zu kurz (mind. 8 Zeichen)', ar: 'كلمة المرور قصيرة جداً' },
  };

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError(L.errMatch[lang] || L.errMatch.fr); return; }
    if (form.password.length < 8) { setError(L.errLen[lang] || L.errLen.fr); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.register({ firstName:form.firstName, lastName:form.lastName, username:form.username, email:form.email, phone:form.phone || undefined, monthlySalary:form.monthlySalary ? parseFloat(form.monthlySalary) : undefined, password:form.password });
      login(data.user, data.token);
      addToast(lang === 'fr' ? 'Bienvenue chez Auto Kompetenz !' : lang === 'en' ? 'Welcome to Auto Kompetenz!' : lang === 'de' ? 'Willkommen bei Auto Kompetenz!' : 'أهلاً بك في Auto Kompetenz!', 'success');
      navigate('/dashboard?welcome=1');
    } catch (err) {
      setError(err.response?.data?.error || (lang === 'fr' ? 'Erreur lors de la création du compte' : 'Error creating account'));
    } finally { setLoading(false); }
  };

  const Label = ({ field, optional }) => (
    <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:10 }}>
      {L[field]?.[lang] || L[field]?.fr}{optional && <span style={{ fontWeight:400, opacity:0.5, marginLeft:6 }}>({L.optional[lang]})</span>}
    </label>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--black)', display:'flex', alignItems:'center', justifyContent:'center', padding:'100px 20px 60px' }}>
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:[0.16,1,0.3,1] }} style={{ width:'100%', maxWidth:560 }}>

        <Link to="/" style={{ display:'inline-block', textDecoration:'none', marginBottom:48 }}>
          <div style={{ fontFamily:"'Outfit', sans-serif", fontSize:20, fontWeight:900, color:'#fff', letterSpacing:'0.04em' }}>
            AUTO KOMPETENZ <span style={{ color:'#C8102E' }}>GmbH</span>
          </div>
          <div style={{ fontSize:10, letterSpacing:'0.35em', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginTop:3 }}>Emsdetten · Deutschland</div>
        </Link>

        <h1 style={{ fontFamily:"'Outfit', sans-serif", fontWeight:900, fontSize:42, color:'#fff', letterSpacing:'-0.02em', marginBottom:8 }}>
          {L.title[lang] || L.title.fr}
        </h1>
        <p style={{ fontSize:16, color:'rgba(255,255,255,0.4)', marginBottom:36 }}>{L.sub[lang] || L.sub.fr}</p>

        {error && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
            style={{ marginBottom:24, padding:'14px 18px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:8, fontSize:14, color:'#EF4444' }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <div><Label field="firstName" /><input type="text" required value={form.firstName} onChange={set('firstName')} placeholder="Jean" className="input-luxury" style={{ fontSize:16 }} /></div>
            <div><Label field="lastName" /><input type="text" required value={form.lastName} onChange={set('lastName')} placeholder="Dupont" className="input-luxury" style={{ fontSize:16 }} /></div>
          </div>
          {/* Username */}
          <div style={{ marginBottom:16 }}>
            <Label field="username" />
            <input type="text" required value={form.username} onChange={set('username')} placeholder="jean_dupont" className="input-luxury" style={{ fontSize:16 }} />
          </div>
          {/* Email */}
          <div style={{ marginBottom:16 }}>
            <Label field="email" />
            <input type="email" required value={form.email} onChange={set('email')} placeholder="jean@example.com" className="input-luxury" style={{ fontSize:16 }} />
          </div>
          {/* Row 2 */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <div><Label field="phone" optional /><input type="tel" value={form.phone} onChange={set('phone')} placeholder="+33 6 00 00 00 00" className="input-luxury" style={{ fontSize:16 }} /></div>
            <div><Label field="salary" optional /><input type="number" value={form.monthlySalary} onChange={set('monthlySalary')} placeholder="3000" className="input-luxury" style={{ fontSize:16 }} /></div>
          </div>
          {/* Password */}
          <div style={{ marginBottom:16 }}>
            <Label field="password" /><span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:8, display:'block' }}>{L.minChars[lang]}</span>
            <input type="password" required autoComplete="new-password" value={form.password} onChange={set('password')} placeholder="••••••••" className="input-luxury" style={{ fontSize:16 }} />
          </div>
          <div style={{ marginBottom:28 }}>
            <Label field="confirm" />
            <input type="password" required autoComplete="new-password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••" className="input-luxury" style={{ fontSize:16 }} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:18, fontSize:15 }}>
            {loading ? L.loading[lang] : L.btn[lang] || L.btn.fr} {!loading && '→'}
          </button>
        </form>

        <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'28px 0' }} />
        <p style={{ textAlign:'center', fontSize:15, color:'rgba(255,255,255,0.4)' }}>
          {L.haveAcct[lang]}{' '}
          <Link to="/login" style={{ color:'#C8102E', textDecoration:'none', fontWeight:700 }}>{L.signIn[lang]}</Link>
        </p>
      </motion.div>
    </div>
  );
}
