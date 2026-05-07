import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { carAPI } from '../services/api';
import { formatEuro } from '../utils/helpers';
import { useLangStore } from '../store';
import { t } from '../utils/i18n';
import CarCard from '../components/CarCard';

const SERVICES = [
  { icon: '🚗', key: 'new-cars', title: { fr: 'Voitures Neuves', en: 'New Cars', de: 'Neuwagen', ar: 'سيارات جديدة' }, desc: { fr: 'Derniers modèles, garantie constructeur, financement personnalisé.', en: 'Latest models, manufacturer warranty, personalized financing.', de: 'Neueste Modelle, Herstellergarantie, maßgeschneiderte Finanzierung.', ar: 'أحدث الطرازات، ضمان الشركة، تمويل مخصص.' }, tag: '2024 Models' },
  { icon: '�', key: 'used-cars', title: { fr: 'Voitures d\'Occasion', en: 'Used Cars', de: 'Gebrauchtwagen', ar: 'سيارات مستعملة' }, desc: { fr: 'Véhicules vérifiés, historique complet, garantie jusqu\'à 24 mois.', en: 'Verified vehicles, complete history, warranty up to 24 months.', de: 'Geprüfte Fahrzeuge, vollständige Historie, Garantie bis zu 24 Monaten.', ar: 'سيارات م verifiedة، سجل كامل، ضمان حتى 24 شهرًا.' }, tag: 'Certified' },
  { icon: '�', key: 'financing', title: { fr: 'Financement Auto', en: 'Car Financing', de: 'Autofinanzierung', ar: 'تمويل السيارات' }, desc: { fr: 'Crédit sur mesure, taux avantageux, réponse en 24h.', en: 'Tailored credit, competitive rates, response in 24h.', de: 'Maßgeschneiderter Kredit, wettbewerbsfähige Zinsen, Antwort in 24h.', ar: 'ائتمان مخصص، أسعار تنافسية، رد في 24 ساعة.' }, tag: 'Fast Approval' },
  { icon: '🔄', key: 'trade-in', title: { fr: 'Reprise & Échange', en: 'Trade-in & Exchange', de: 'Ankauf & Tausch', ar: 'استبدال وتبديل' }, desc: { fr: 'Reprise de votre véhicule actuel, estimation gratuite.', en: 'Trade-in your current vehicle, free valuation.', de: 'Ankauf Ihres aktuellen Fahrzeugs, kostenlose Bewertung.', ar: 'استبدال سيارتك الحالية، تقييم مجاني.' }, tag: 'Best Value' },
  { icon: '🛡️', key: 'warranty', title: { fr: 'Garantie & SAV', en: 'Warranty & Support', de: 'Garantie & Service', ar: 'الضمان والدعم' }, desc: { fr: 'Garantie étendue, service après-vente, assistance 24/7.', en: 'Extended warranty, after-sales service, 24/7 assistance.', de: 'Erweiterte Garantie, Kundendienst, 24/7 Unterstützung.', ar: 'ضمان موسع، خدمة ما بعد البيع، دعم 24/7.' }, tag: 'Full Coverage' },
  { icon: '�', key: 'delivery', title: { fr: 'Livraison & Transport', en: 'Delivery & Transport', de: 'Lieferung & Transport', ar: 'التوصيل والنقل' }, desc: { fr: 'Livraison à domicile, transport sécurisé, toute l\'Allemagne.', en: 'Home delivery, secure transport, all of Germany.', de: 'Lieferung nach Hause, sicherer Transport, ganz Deutschland.', ar: 'توصيل للمنزل، نقل آمن، جميع أنحاء ألمانيا.' }, tag: 'Door to Door' },
];

const REVIEWS = [
  { name: 'Marcus Hoffmann', rating: 5, date: '2 semaines', text: { fr: 'Excellent service ! J\'ai trouvé ma BMW dream car, processus simple et financement au meilleur taux. Recommandé !', en: 'Excellent service! Found my dream BMW, simple process and best financing rate. Recommended!', de: 'Exzellenter Service! Meinen Traum-BMW gefunden, einfacher Prozess, beste Finanzierung.', ar: 'خدمة ممتازة! وجدت سيارتي BMW الأحلام، عملية بسيطة وأفضل تمويل.' }, avatar: 'MH' },
  { name: 'Sophie Becker', rating: 5, date: '1 mois', text: { fr: 'Super concessionnaire ! Très professionnel, large choix de véhicules et équipe très disponible. Je recommande vivement !', en: 'Great dealership! Very professional, wide vehicle selection and very helpful team. Highly recommend!', de: 'Super Autohaus! Sehr professionell, große Fahrzeugauswahl, hilfsbereites Team.', ar: 'معرض رائع! محترف جدًا، مجموعة واسعة من السيارات وفريق متعاون جدًا.' }, avatar: 'SB' },
  { name: 'Thomas Reinhardt', rating: 5, date: '3 semaines', text: { fr: 'Vendeur honnête et fiable ! Voiture de qualité, prix juste et livraison rapide. Je suis très satisfait !', en: 'Honest and reliable seller! Quality car, fair price and fast delivery. Very satisfied!', de: 'Ehrlicher und zuverlässiger Verkäufer! Qualitätsauto, fairer Preis, schnelle Lieferung.', ar: 'بائع صادق وموثوق! سيارة عالية الجودة، سعر عادل، تسليم سريع.' }, avatar: 'TR' },
  { name: 'Anna Müller', rating: 5, date: '1 mois', text: { fr: 'Équipe très compétente ! Ont trouvé la Volkswagen parfaite pour moi. Le service client est exceptionnel !', en: 'Very competent team! Found the perfect Volkswagen for me. Customer service is exceptional!', de: 'Sehr kompetentes Team! Perfekten VW für mich gefunden. Kundenservice herausragend!', ar: 'فريق كفء جدًا! وجدوا فولكسفاغن المثالية لي. خدمة العملاء استثنائية!' }, avatar: 'AM' },
  { name: 'Klaus Weber', rating: 5, date: '2 mois', text: { fr: 'Excellente expérience. Achat en ligne facile, véhicule conforme à la description et livraison impeccable. Merci !', en: 'Excellent experience. Easy online purchase, car as described and impeccable delivery. Thank you!', de: 'Tolle Erfahrung. Einfacher Online-Kauf, Auto wie beschrieben, makellose Lieferung.', ar: 'تجربة ممتازة. شراء سهل عبر الإنترنت، سيارة حسب الوصف، تسليم مثالي.' }, avatar: 'KW' },
  { name: 'Julia Braun', rating: 4, date: '3 mois', text: { fr: 'Bon service, bonne qualité de véhicules. Équipe aimable et processus de financement simple. Je reviendrai !', en: 'Good service, good vehicle quality. Friendly team and simple financing process. Will come back!', de: 'Guter Service, gute Fahrzeugqualität. Freundliches Team, einfacher Finanzierungsprozess.', ar: 'خدمة جيدة، جودة سيارات جيدة. فريق ودود وعملية تمويل بسيطة.' }, avatar: 'JB' },
];

function Stars({ n = 5, size = 16 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < n ? '#FFAA00' : '#333', fontSize: size }}>★</span>
      ))}
    </span>
  );
}

function CookieBanner({ lang }) {
  const [visible, setVisible] = useState(!localStorage.getItem('ak_cookies'));
  if (!visible) return null;
  const accept = () => { localStorage.setItem('ak_cookies', '1'); setVisible(false); };
  const decline = () => { localStorage.setItem('ak_cookies', '0'); setVisible(false); };
  return (
    <div className="cookie-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>🍪 {lang === 'fr' ? 'Nous utilisons des cookies' : lang === 'en' ? 'We use cookies' : lang === 'de' ? 'Wir verwenden Cookies' : 'نستخدم ملفات تعريف الارتباط'}</p>
        <p style={{ fontSize: 13, color: '#8A8A90', lineHeight: 1.5 }}>
          {lang === 'fr' ? 'Pour améliorer votre expérience. ' : lang === 'en' ? 'To improve your experience. ' : lang === 'de' ? 'Um Ihre Erfahrung zu verbessern. ' : 'لتحسين تجربتك. '}
          <Link to="/politique-confidentialite" style={{ color: '#C8102E', textDecoration: 'none' }}>
            {lang === 'fr' ? 'Politique de confidentialité' : lang === 'en' ? 'Privacy Policy' : lang === 'de' ? 'Datenschutz' : 'سياسة الخصوصية'}
          </Link>
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={decline} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, color: '#8A8A90', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
          {lang === 'fr' ? 'Refuser' : lang === 'en' ? 'Decline' : lang === 'de' ? 'Ablehnen' : 'رفض'}
        </button>
        <button onClick={accept} className="btn-gold" style={{ fontSize: 13, padding: '10px 22px' }}>
          {lang === 'fr' ? 'Accepter' : lang === 'en' ? 'Accept' : lang === 'de' ? 'Akzeptieren' : 'قبول'}
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { lang } = useLangStore();
  const [featured, setFeatured] = useState([]);
  const [trackNum, setTrackNum] = useState('');
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0,1], ['0%', '25%']);
  const heroO = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    carAPI.getAll({ featured: 'true', limit: 6 }).then(r => setFeatured(r.data.cars)).catch(() => {});
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackNum.trim()) navigate(`/track/${trackNum.trim().toUpperCase()}`);
  };

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };
  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16,1,0.3,1] } } };

  return (
    <div style={{ background: 'var(--black)', minHeight: '100vh' }}>

      {/* ══════════════════════════════ HERO ════════════════════════════════ */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Background image with parallax */}
        <motion.div style={{ position: 'absolute', inset: 0, y: heroY }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=90') center/cover no-repeat",
            filter: 'brightness(0.25)',
          }} />
        </motion.div>

        {/* Gradient overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,11,0.97) 45%, rgba(10,10,11,0.3) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, var(--black), transparent)' }} />

        {/* Red accent line */}
        <div style={{ position: 'absolute', left: 0, top: '15%', bottom: '15%', width: 3, background: 'linear-gradient(to bottom, transparent, #C8102E, transparent)' }} />

        <motion.div style={{ position: 'relative', zIndex: 2, padding: '120px 6% 80px', maxWidth: 900, opacity: heroO }}>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Eyebrow */}
            <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(200,16,46,0.1)', border: '1px solid rgba(200,16,46,0.3)', color: '#C8102E', fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', padding: '8px 18px', borderRadius: 4, marginBottom: 36 }}>
              <span style={{ width: 7, height: 7, background: '#C8102E', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              {t('hero_badge', lang)}
            </motion.div>

            {/* Title */}
            <motion.h1 variants={fadeUp} style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(64px, 10vw, 130px)', lineHeight: 0.88, letterSpacing: '-0.03em', color: '#fff', marginBottom: 32 }}>
              <span style={{ display: 'block' }}>AUTO</span>
              <span style={{ display: 'block', color: '#C8102E', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>Kompetenz</span>
              <span style={{ display: 'block', fontWeight: 300, fontSize: '0.55em', color: 'rgba(255,255,255,0.5)' }}>GmbH</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fadeUp} style={{ fontSize: 18, fontWeight: 400, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 560, marginBottom: 48 }}>
              {t('hero_subtitle', lang)}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 72 }}>
              <a href="https://wa.me/4915788823274?text=Bonjour%2C%20je%20souhaite%20prendre%20rendez-vous."
                target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ fontSize: 14, padding: '18px 38px' }}>
                💬 {t('hero_cta1', lang)}
              </a>
              <button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-ghost" style={{ fontSize: 14, padding: '18px 38px' }}>
                {t('hero_cta2', lang)} ↓
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
              {[
                { value: '15', unit: '+', label: t('hero_stat1', lang) },
                { value: '4.9', unit: '★', label: t('hero_stat2', lang) },
                { value: '100', unit: '%', label: t('hero_stat3', lang) },
              ].map(({ value, unit, label }) => (
                <div key={label}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>
                    {value}<span style={{ color: '#C8102E', fontSize: '0.55em' }}>{unit}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>{label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ width: 1, height: 50, background: 'linear-gradient(to bottom, transparent, rgba(200,16,46,0.6))', animation: 'fadeIn 2s ease infinite alternate' }} />
        </div>
      </section>

      {/* ══════════════════════════ SERVICES ═══════════════════════════════ */}
      <section id="services" className="section-pad" style={{ background: 'var(--dark)' }}>
        <div className="section-eyebrow">{t('services_label', lang)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24, marginBottom: 60 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(42px, 6vw, 80px)', color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {(SERVICES[0].title[lang] ? t('services_title', lang) : t('services_title', 'fr')).split('\n').map((line, i) => (
              <span key={i} style={{ display: 'block', color: i === 1 ? '#C8102E' : '#fff' }}>{line}</span>
            ))}
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', maxWidth: 380, lineHeight: 1.65 }}>
            {t('services_sub', lang)}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 12, overflow: 'hidden' }}>
          {SERVICES.map((s, i) => (
            <motion.div key={s.key} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16,1,0.3,1] }}
              style={{ background: 'var(--dark)', padding: '40px 36px', position: 'relative', overflow: 'hidden', cursor: 'default', transition: 'background 0.3s' }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--dark-2)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--dark)'}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: '#C8102E', transform: 'scaleY(0)', transformOrigin: 'bottom', transition: 'transform 0.4s var(--ease)' }}
                className="service-line" />
              <div style={{ fontSize: 36, marginBottom: 18 }}>{s.icon}</div>
              <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C8102E', border: '1px solid rgba(200,16,46,0.3)', padding: '3px 10px', borderRadius: 3, marginBottom: 14 }}>{s.tag}</span>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 10, lineHeight: 1.1 }}>{s.title[lang] || s.title.fr}</h3>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{s.desc[lang] || s.desc.fr}</p>
            </motion.div>
          ))}
        </div>

        <style>{`.service-line { transform: scaleY(0); } div:hover > .service-line { transform: scaleY(1) !important; }`}</style>
      </section>

      {/* ════════════════════════ GOOGLE REVIEWS ═══════════════════════════ */}
      <section className="section-pad" style={{ background: 'var(--black)' }}>
        <div className="section-eyebrow">{t('reviews_label', lang)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24, marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(42px,6vw,80px)', color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {t('reviews_title', lang).split('\n').map((line, i) => (
              <span key={i} style={{ display: 'block', color: i === 1 ? '#C8102E' : '#fff' }}>{line}</span>
            ))}
          </h2>
          {/* Google score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '4px solid #C8102E', padding: '20px 28px', borderRadius: 8 }}>
            <div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 56, fontWeight: 900, color: '#fff', lineHeight: 1 }}>4.9</div>
              <Stars n={5} size={20} />
              <p style={{ fontSize: 12, color: '#8A8A90', marginTop: 6 }}>50+ {lang === 'fr' ? 'avis Google' : lang === 'en' ? 'Google reviews' : lang === 'de' ? 'Google-Bewertungen' : 'مراجعة جوجل'}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 18px', borderRadius: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#4285F4 0%,#34A853 33%,#FBBC05 66%,#EA4335 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#fff' }}>G</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Google Reviews</div>
                <div style={{ fontSize: 11, color: '#8A8A90' }}>{t('verified', lang)}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {REVIEWS.map((r, i) => (
            <motion.div key={r.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6 }}
              style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', padding: 28, borderRadius: 10, position: 'relative', transition: 'all 0.35s var(--ease)' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(200,16,46,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              {/* Verified badge */}
              <div style={{ position: 'absolute', top: 18, right: 18, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#4285F4', fontWeight: 700 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg,#4285F4,#34A853,#FBBC05,#EA4335)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 900 }}>G</div>
                {t('verified', lang)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #9B0B22, #C8102E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 16, color: '#fff', flexShrink: 0 }}>
                  {r.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{r.name}</div>
                  <Stars n={r.rating} size={13} />
                </div>
              </div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontStyle: 'italic' }}>"{r.text[lang] || r.text.fr}"</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════ FEATURED VEHICLES ═══════════════════════ */}
      {featured.length > 0 && (
        <section className="section-pad" style={{ background: 'var(--dark)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 52, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="section-eyebrow">{lang === 'fr' ? 'Nos Véhicules' : lang === 'en' ? 'Our Vehicles' : lang === 'de' ? 'Fahrzeuge' : 'سياراتنا'}</div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(42px,6vw,80px)', color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {lang === 'fr' ? <>Offres <span style={{ color: '#C8102E' }}>actuelles</span></> :
                 lang === 'en' ? <>Current <span style={{ color: '#C8102E' }}>Offers</span></> :
                 lang === 'de' ? <>Aktuelle <span style={{ color: '#C8102E' }}>Angebote</span></> :
                 <>العروض <span style={{ color: '#C8102E' }}>الحالية</span></>}
              </h2>
            </div>
            <Link to="/catalog" className="btn-ghost" style={{ fontSize: 13 }}>
              {t('see_all', lang)} →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {featured.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
          </div>
        </section>
      )}

      {/* ════════════════════════════ CONTACT ═══════════════════════════════ */}
      <section className="section-pad" style={{ background: 'var(--black)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
          <div>
            <div className="section-eyebrow">{t('contact_label', lang)}</div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(42px,5vw,72px)', color: '#fff', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 24 }}>
              {t('contact_title', lang)}
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 40 }}>
              {lang === 'fr' ? 'Pour acheter une voiture, un financement ou une information — nous répondons rapidement.'
               : lang === 'en' ? 'For buying a car, financing or information — we respond quickly.'
               : lang === 'de' ? 'Für Autokauf, Finanzierung oder Informationen — wir antworten schnell.'
               : 'لشراء سيارة أو تمويل أو معلومات — نستجيب بسرعة.'}
            </p>

            {/* Contact items */}
            {[
              { icon: '💬', label: 'WhatsApp', val: '+49 157 888 232 74', sub: lang === 'fr' ? 'Réponse rapide garantie' : lang === 'en' ? 'Fast response guaranteed' : lang === 'de' ? 'Schnelle Antwort garantiert' : 'استجابة سريعة مضمونة', href: 'https://wa.me/4915788823274' },
              { icon: '📧', label: 'Email', val: 'autoKompetenz@gmail.com', sub: lang === 'fr' ? 'Réponse sous 24h' : lang === 'en' ? 'Reply within 24h' : lang === 'de' ? 'Antwort innerhalb 24h' : 'رد خلال 24 ساعة', href: 'mailto:autoKompetenz@gmail.com' },
              { icon: '📍', label: lang === 'fr' ? 'Adresse' : lang === 'en' ? 'Address' : lang === 'de' ? 'Adresse' : 'العنوان', val: 'Neuenkirchener Str. 127', sub: '48282 Emsdetten, Deutschland', href: 'https://maps.google.com/?q=Neuenkirchener+Str.+127,48282+Emsdetten' },
            ].map(({ icon, label, val, sub, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'flex-start', gap: 18, padding: '20px 24px', background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, marginBottom: 14, textDecoration: 'none', transition: 'all 0.25s', color: 'inherit' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(200,16,46,0.3)'; e.currentTarget.style.transform = 'translateX(6px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                <div style={{ width: 50, height: 50, borderRadius: 8, background: 'rgba(200,16,46,0.1)', border: '1px solid rgba(200,16,46,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8A8A90', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{val}</div>
                  <div style={{ fontSize: 13, color: '#8A8A90', marginTop: 2 }}>{sub}</div>
                </div>
              </a>
            ))}
          </div>

          {/* Right side — Hours + CTA */}
          <div>
            <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '4px solid #C8102E', borderRadius: 8, padding: '32px 36px', marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C8102E', marginBottom: 24 }}>{t('contact_hours', lang)}</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    [t('mon_fri', lang), '08:00 — 18:00'],
                    [t('saturday', lang), '09:00 — 14:00'],
                    [t('sunday', lang), t('closed', lang)],
                  ].map(([day, time], i) => (
                    <tr key={day} style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <td style={{ padding: '14px 0', fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>{day}</td>
                      <td style={{ padding: '14px 0', fontSize: 16, fontWeight: 700, color: i === 2 ? '#C8102E' : '#fff', textAlign: 'right' }}>{time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(200,16,46,0.2)', borderRadius: 8, padding: '32px 36px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C8102E', marginBottom: 16 }}>{t('contact_appt', lang)}</div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', marginBottom: 24, lineHeight: 1.65 }}>
                {lang === 'fr' ? 'Réservez votre essai routier ou votre consultation — réponse en quelques minutes.'
                 : lang === 'en' ? 'Book your test drive or consultation — reply in minutes.'
                 : lang === 'de' ? 'Probefahrt oder Beratung buchen — Antwort in Minuten.'
                 : 'احجز جولة تجريبية أو استشارة — رد في دقائق.'}
              </p>
              <a href="https://wa.me/4915788823274?text=Bonjour%2C%20je%20voudrais%20prendre%20rendez-vous." target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: 12, fontSize: 14 }}>
                💬 {t('hero_cta1', lang)}
              </a>
              <a href="mailto:autoKompetenz@gmail.com" className="btn-ghost" style={{ display: 'flex', width: '100%', justifyContent: 'center', fontSize: 14 }}>
                📧 Email
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ TRACK ORDER ════════════════════════════════ */}
      <section style={{ padding: '60px 6%', background: 'var(--dark)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>{t('track_order', lang)}</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 36, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>
            {lang === 'fr' ? 'Suivre ma commande' : lang === 'en' ? 'Track my order' : lang === 'de' ? 'Bestellung verfolgen' : 'تتبع طلبي'}
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
            {lang === 'fr' ? 'Entrez votre numéro de bon de commande' : lang === 'en' ? 'Enter your order number' : lang === 'de' ? 'Bestellnummer eingeben' : 'أدخل رقم طلبك'}
          </p>
          <form onSubmit={handleTrack} style={{ display: 'flex', gap: 12 }}>
            <input value={trackNum} onChange={e => setTrackNum(e.target.value.toUpperCase())} placeholder="AK20241215ABC123" className="input-luxury" style={{ flex: 1, fontFamily: 'monospace', letterSpacing: '0.08em', fontSize: 16 }} />
            <button type="submit" className="btn-gold" style={{ padding: '14px 24px', flexShrink: 0, fontSize: 16 }}>→</button>
          </form>
        </div>
      </section>

      {/* ══════════════════════════ FOOTER ═══════════════════════════════ */}
      <footer style={{ background: '#060607', borderTop: '1px solid rgba(200,16,46,0.12)', padding: '56px 6% 36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: '0.02em' }}>AUTO KOMPETENZ <span style={{ color: '#C8102E' }}>GmbH</span></div>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, maxWidth: 280 }}>
              {lang === 'fr' ? 'Votre concessionnaire automobile de confiance à Emsdetten, Allemagne.'
               : lang === 'en' ? 'Your trusted car dealership in Emsdetten, Germany.'
               : lang === 'de' ? 'Ihr vertrauenswürdiges Autohaus in Emsdetten.'
               : 'معرض السيارات الموثوق في إمسديتن، ألمانيا.'}
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <a href="https://wa.me/4915788823274" target="_blank" rel="noopener noreferrer" style={{ width: 38, height: 38, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, textDecoration: 'none' }}>💬</a>
              <a href="mailto:autoKompetenz@gmail.com" style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, textDecoration: 'none' }}>📧</a>
            </div>
          </div>

          {/* Links */}
          {[
            { title: lang === 'fr' ? 'Navigation' : lang === 'en' ? 'Navigation' : lang === 'de' ? 'Navigation' : 'التنقل',
              links: [
                { to: '/', label: lang === 'fr' ? 'Accueil' : lang === 'en' ? 'Home' : lang === 'de' ? 'Startseite' : 'الرئيسية' },
                { to: '/catalog', label: t('nav_vehicles', lang) },
                { to: '/simulation', label: t('nav_financing', lang) },
                { to: '/track', label: t('nav_track', lang) },
              ]
            },
            { title: lang === 'fr' ? 'Légal' : lang === 'en' ? 'Legal' : lang === 'de' ? 'Rechtliches' : 'قانوني',
              links: [
                { to: '/mentions-legales', label: lang === 'fr' ? 'Mentions légales' : lang === 'en' ? 'Legal Notice' : lang === 'de' ? 'Impressum' : 'إشعار قانوني' },
                { to: '/politique-confidentialite', label: lang === 'fr' ? 'Confidentialité' : lang === 'en' ? 'Privacy' : lang === 'de' ? 'Datenschutz' : 'الخصوصية' },
                { to: '/cgv', label: lang === 'fr' ? 'CGV' : lang === 'en' ? 'Terms' : lang === 'de' ? 'AGB' : 'الشروط' },
                { to: '/cookies', label: 'Cookies' },
              ]
            },
            { title: lang === 'fr' ? 'Contact' : lang === 'en' ? 'Contact' : lang === 'de' ? 'Kontakt' : 'تواصل',
              links: [
                { href: 'tel:+4915788823274', label: '+49 157 888 232 74' },
                { href: 'mailto:autoKompetenz@gmail.com', label: 'autoKompetenz@gmail.com' },
                { href: 'https://maps.google.com/?q=Neuenkirchener+Str.+127,48282+Emsdetten', label: 'Neuenkirchener Str. 127' },
                { label: '48282 Emsdetten', href: '#' },
              ]
            },
          ].map(({ title, links }) => (
            <div key={title}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C8102E', marginBottom: 20 }}>{title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(({ to, href, label }) => (
                  to ? (
                    <Link key={label} to={to} style={{ fontSize: 14, color: '#555', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseOver={e => e.target.style.color = '#C8102E'} onMouseOut={e => e.target.style.color = '#555'}>{label}</Link>
                  ) : (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#555', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseOver={e => e.target.style.color = '#C8102E'} onMouseOut={e => e.target.style.color = '#555'}>{label}</a>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: 13, color: '#333' }}>© {new Date().getFullYear()} Auto Kompetenz GmbH — {lang === 'fr' ? 'Tous droits réservés' : lang === 'en' ? 'All rights reserved' : lang === 'de' ? 'Alle Rechte vorbehalten' : 'جميع الحقوق محفوظة'}</p>
          <p style={{ fontSize: 12, color: '#222' }}>{lang === 'fr' ? 'Fait avec ❤️ en Allemagne' : lang === 'en' ? 'Made with ❤️ in Germany' : lang === 'de' ? 'Mit ❤️ in Deutschland' : 'صُنع بـ ❤️ في ألمانيا'}</p>
        </div>
      </footer>

      {/* Cookie Banner */}
      <CookieBanner lang={lang} />

      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}} @keyframes fadeIn{0%,100%{opacity:0.3}50%{opacity:0.8}} @media(max-width:900px){.section-pad{padding:70px 5%!important} [style*="grid-template-columns: repeat(3"]{grid-template-columns:1fr!important} [style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important} [style*="grid-template-columns: 2fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
