import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { carAPI } from '../services/api';
import { formatEuro } from '../utils/helpers';
import { useLangStore } from '../store';
import { t } from '../utils/i18n';
import CarCard from '../components/CarCard';
import { useBreakpoint } from '../hooks/useBreakpoint';

const SERVICES = [
  { icon:'🚗', fr:'Voitures Neuves',       en:'New Cars',           de:'Neuwagen',          es:'Coches Nuevos',       it:'Auto Nuove',         pt:'Carros Novos',       tag:'2024 Models',
    descFr:'Derniers modèles, garantie constructeur, financement personnalisé.', descEn:'Latest models, manufacturer warranty, personalized financing.', descDe:'Neueste Modelle, Herstellergarantie, Finanzierung.', descEs:'Últimos modelos, garantía de fabricante, financiación personalizada.', descIt:'Ultimi modelli, garanzia del produttore, finanziamento personalizzato.', descPt:'Últimos modelos, garantia do fabricante, financiamento personalizado.' },
  { icon:'🔧', fr:"Voitures d'Occasion",   en:'Used Cars',          de:'Gebrauchtwagen',    es:'Coches de Ocasión',   it:'Auto Usate',         pt:'Carros Usados',      tag:'Certified',
    descFr:'Véhicules vérifiés, historique complet, garantie jusqu\'à 24 mois.', descEn:'Verified vehicles, complete history, warranty up to 24 months.', descDe:'Geprüfte Fahrzeuge, vollständige Historie, Garantie bis 24 Monate.', descEs:'Vehículos verificados, historial completo, garantía hasta 24 meses.', descIt:'Veicoli verificati, storia completa, garanzia fino a 24 mesi.', descPt:'Veículos verificados, histórico completo, garantia até 24 meses.' },
  { icon:'💳', fr:'Financement Auto',       en:'Car Financing',      de:'Autofinanzierung',  es:'Financiación Auto',   it:'Finanziamento Auto', pt:'Financiamento Auto',  tag:'Fast Approval',
    descFr:'Crédit sur mesure, taux avantageux, réponse en 24h.', descEn:'Tailored credit, competitive rates, response in 24h.', descDe:'Maßgeschneiderter Kredit, wettbewerbsfähige Zinsen, Antwort in 24h.', descEs:'Crédito a medida, tasas competitivas, respuesta en 24h.', descIt:'Credito su misura, tassi competitivi, risposta in 24h.', descPt:'Crédito personalizado, taxas competitivas, resposta em 24h.' },
  { icon:'🔄', fr:'Reprise & Échange',      en:'Trade-in & Exchange', de:'Ankauf & Tausch',  es:'Canje y Cambio',      it:'Permuta',            pt:'Permuta',             tag:'Best Value',
    descFr:'Reprise de votre véhicule actuel, estimation gratuite.', descEn:'Trade-in your current vehicle, free valuation.', descDe:'Ankauf Ihres Fahrzeugs, kostenlose Bewertung.', descEs:'Canje de su vehículo actual, valoración gratuita.', descIt:'Permuta del vostro veicolo, valutazione gratuita.', descPt:'Troca do seu veículo, avaliação gratuita.' },
  { icon:'🛡️', fr:'Garantie & SAV',         en:'Warranty & Support', de:'Garantie & Service', es:'Garantía y SAV',     it:'Garanzia e Supporto', pt:'Garantia e Suporte',  tag:'Full Coverage',
    descFr:'Garantie étendue, service après-vente, assistance 24/7.', descEn:'Extended warranty, after-sales service, 24/7 assistance.', descDe:'Erweiterte Garantie, Kundendienst, 24/7 Unterstützung.', descEs:'Garantía extendida, servicio posventa, asistencia 24/7.', descIt:'Garanzia estesa, assistenza post-vendita, supporto 24/7.', descPt:'Garantia estendida, assistência pós-venda, suporte 24/7.' },
  { icon:'🚚', fr:'Livraison & Transport',  en:'Delivery & Transport', de:'Lieferung',        es:'Entrega y Transporte', it:'Consegna e Trasporto', pt:'Entrega e Transporte', tag:'Door to Door',
    descFr:'Livraison à domicile, transport sécurisé, toute l\'Allemagne.', descEn:'Home delivery, secure transport, all of Germany.', descDe:'Lieferung nach Hause, sicherer Transport, ganz Deutschland.', descEs:'Entrega a domicilio, transporte seguro, toda Alemania.', descIt:'Consegna a domicilio, trasporto sicuro, tutta la Germania.', descPt:'Entrega em casa, transporte seguro, toda a Alemanha.' },
];

const REVIEWS = [
  { name:'Marcus Hoffmann', rating:5, avatar:'MH', textFr:'Excellent service ! Trouvé ma BMW idéale, financement au meilleur taux. Recommandé !', textEn:'Excellent service! Found my ideal BMW, best financing rate. Recommended!', textDe:'Exzellenter Service! Meinen BMW gefunden, beste Finanzierung.', textEs:'¡Excelente servicio! Encontré mi BMW ideal, mejor tasa de financiación.', textIt:'Servizio eccellente! Trovata la mia BMW ideale, miglior tasso.', textPt:'Excelente serviço! Encontrei meu BMW ideal, melhor taxa.' },
  { name:'Sophie Becker', rating:5, avatar:'SB', textFr:'Super concessionnaire ! Très professionnel, large choix, équipe très disponible.', textEn:'Great dealership! Very professional, wide choice, very helpful team.', textDe:'Super Autohaus! Sehr professionell, große Auswahl.', textEs:'¡Gran concesionario! Muy profesional, amplia selección.', textIt:'Ottimo concessionario! Molto professionale, ampia scelta.', textPt:'Ótimo revendedor! Muito profissional, ampla seleção.' },
  { name:'Thomas Reinhardt', rating:5, avatar:'TR', textFr:'Vendeur honnête et fiable ! Voiture de qualité, prix juste, livraison rapide.', textEn:'Honest and reliable seller! Quality car, fair price, fast delivery.', textDe:'Ehrlicher Verkäufer! Qualitätsauto, fairer Preis, schnelle Lieferung.', textEs:'¡Vendedor honesto! Coche de calidad, precio justo, entrega rápida.', textIt:'Venditore onesto! Auto di qualità, prezzo giusto, consegna rapida.', textPt:'Vendedor honesto! Carro de qualidade, preço justo, entrega rápida.' },
  { name:'Anna Müller', rating:5, avatar:'AM', textFr:'Équipe très compétente ! Ont trouvé la Volkswagen parfaite pour moi.', textEn:'Very competent team! Found the perfect Volkswagen for me.', textDe:'Sehr kompetentes Team! Perfekten VW für mich gefunden.', textEs:'¡Equipo muy competente! Encontraron el Volkswagen perfecto.', textIt:'Team molto competente! Trovata la Volkswagen perfetta.', textPt:'Equipe muito competente! Encontraram o Volkswagen perfeito.' },
];

function Stars({ n=5 }) {
  return <span style={{ display:'inline-flex', gap:2 }}>{Array.from({length:5}).map((_,i)=><span key={i} style={{ color:i<n?'#FFAA00':'var(--border-2)', fontSize:15 }}>★</span>)}</span>;
}

function CookieBanner({ lang }) {
  const [visible, setVisible] = useState(!localStorage.getItem('ak_cookies'));
  if (!visible) return null;
  const accept  = () => { localStorage.setItem('ak_cookies','1'); setVisible(false); };
  const decline = () => { localStorage.setItem('ak_cookies','0'); setVisible(false); };
  const msg = { fr:'Nous utilisons des cookies pour améliorer votre expérience.', en:'We use cookies to improve your experience.', de:'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern.', es:'Usamos cookies para mejorar su experiencia.', it:'Usiamo i cookie per migliorare la tua esperienza.', pt:'Usamos cookies para melhorar sua experiência.' };
  const accept_l = { fr:'Accepter', en:'Accept', de:'Akzeptieren', es:'Aceptar', it:'Accetta', pt:'Aceitar' };
  const decline_l = { fr:'Refuser', en:'Decline', de:'Ablehnen', es:'Rechazar', it:'Rifiuta', pt:'Recusar' };
  return (
    <div className="cookie-banner" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
      <p style={{ fontSize:14, color:'var(--text-2)', flex:1 }}>🍪 {msg[lang] || msg.fr}</p>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={decline} style={{ padding:'9px 18px', background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:6, color:'var(--text-3)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>{decline_l[lang]||'Refuser'}</button>
        <button onClick={accept} className="btn-gold" style={{ fontSize:13, padding:'9px 20px' }}>{accept_l[lang]||'Accepter'}</button>
      </div>
    </div>
  );
}

export default function Home() {
  const { lang } = useLangStore();
  const { isMobile, isTablet } = useBreakpoint();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackNum, setTrackNum] = useState('');
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const l = lang || 'fr';
  const { scrollYProgress } = useScroll({ target:heroRef, offset:['start start','end start'] });
  const heroY = useTransform(scrollYProgress, [0,1], ['0%','25%']);
  const heroO = useTransform(scrollYProgress, [0,0.7], [1,0]);

  useEffect(() => {
    setLoading(true);
    carAPI.getAll({ featured:'true', limit:12 })
      .then(r => { setFeatured(r.data.cars||[]); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackNum.trim()) navigate(`/track/${trackNum.trim().toUpperCase()}`);
  };

  const getServiceTitle = (s) => s[l] || s.fr;
  const getServiceDesc  = (s) => s[`desc${l.charAt(0).toUpperCase()+l.slice(1)}`] || s.descFr;
  const getReviewText   = (r) => r[`text${l.charAt(0).toUpperCase()+l.slice(1)}`] || r.textFr;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ position:'relative', height: isMobile ? '100svh' : '100vh', minHeight:580, display:'flex', alignItems:'center', overflow:'hidden' }}>
        <motion.div style={{ position:'absolute', inset:0, y:heroY }}>
          <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1800&q=80&auto=format"
            alt="Hero" style={{ width:'100%', height:'110%', objectFit:'cover', display:'block' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.3) 100%)' }} />
        </motion.div>

        <motion.div style={{ position:'relative', zIndex:2, padding: isMobile ? '0 5%' : '0 7%', maxWidth:780, opacity:heroO }}>
          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.1 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(200,16,46,0.15)', border:'1px solid rgba(200,16,46,0.3)', borderRadius:4, padding:'7px 16px', marginBottom:28 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#C8102E', display:'inline-block' }} />
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.8)' }}>
                {t('hero_badge', l)}
              </span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.9, delay:0.2 }}
            style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize: isMobile ? 'clamp(38px,10vw,56px)' : 'clamp(52px,6vw,88px)', color:'#fff', letterSpacing:'-0.03em', lineHeight:1.0, marginBottom:22 }}>
            Auto<br/><span style={{ color:'#C8102E' }}>Kompetenz</span><br/>GmbH
          </motion.h1>

          <motion.p initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.35 }}
            style={{ fontSize: isMobile ? 15 : 18, color:'rgba(255,255,255,0.6)', lineHeight:1.7, marginBottom:36, maxWidth:520 }}>
            {t('hero_subtitle', l)}
          </motion.p>

          <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.5 }}
            style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <Link to="/catalog" className="btn-primary" style={{ fontSize: isMobile ? 13 : 14 }}>
              {t('hero_cta1', l)} →
            </Link>
            <Link to="/simulation" className="btn-ghost" style={{ fontSize: isMobile ? 13 : 14, borderColor:'rgba(255,255,255,0.3)', color:'rgba(255,255,255,0.85)' }}>
              {t('hero_cta2', l)}
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.8, duration:0.6 }}
          style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(255,255,255,0.08)', padding: isMobile ? '16px 5%' : '22px 7%', display:'flex', justifyContent:'space-around', gap:16, flexWrap:'wrap' }}>
          {[
            { value:'10+', label:t('hero_stat1', l) },
            { value:'4.9★', label:t('hero_stat2', l) },
            { value:'100%', label:t('hero_stat3', l) },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize: isMobile ? 22 : 30, color:'#C8102E', lineHeight:1 }}>{value}</div>
              <div style={{ fontSize: isMobile ? 10 : 12, color:'rgba(255,255,255,0.45)', marginTop:4, fontWeight:600, letterSpacing:'0.05em' }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── TRACK BAR ── */}
      <div style={{ background:'var(--bg-card2)', borderBottom:'1px solid var(--border)', padding: isMobile ? '20px 5%' : '24px 7%' }}>
        <form onSubmit={handleTrack} style={{ maxWidth:640, margin:'0 auto', display:'flex', gap:10 }}>
          <input value={trackNum} onChange={e => setTrackNum(e.target.value)}
            placeholder={t('track_ph', l)}
            className="input-luxury"
            style={{ flex:1, fontSize: isMobile ? 14 : 15 }} />
          <button type="submit" className="btn-primary" style={{ padding:'13px 20px', fontSize:13, whiteSpace:'nowrap', flexShrink:0 }}>
            {t('track_order', l)}
          </button>
        </form>
      </div>

      {/* ── FEATURED VEHICLES ── */}
      <section className="section-pad">
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:36 }}>
            <div>
              <div className="section-eyebrow">{t('catalog_title', l)}</div>
              <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:'var(--text)', letterSpacing:'-0.02em', lineHeight:1.05 }}>
                {l==='fr'?'Nos Véhicules\nà la Une':l==='en'?'Featured\nVehicles':l==='de'?'Ausgewählte\nFahrzeuge':l==='es'?'Vehículos\nDestacados':l==='it'?'Veicoli\nin evidenza':'Veículos\nDestacados'}
              </h2>
            </div>
            <Link to="/catalog" className="btn-outline">{t('see_all', l)} →</Link>
          </div>
          
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 14 : 22 }}>
              {Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
                <div key={i} style={{ 
                  background:'var(--bg-card)', 
                  border:'1px solid var(--border)', 
                  borderRadius:12, 
                  padding:20,
                  minHeight:280,
                  display:'flex',
                  flexDirection:'column',
                  gap:12
                }}>
                  <div style={{ 
                    width:'100%', 
                    height:160, 
                    background:'var(--bg-card2)', 
                    borderRadius:8,
                    animation:'pulse 1.5s ease-in-out infinite'
                  }} />
                  <div style={{ height:20, background:'var(--bg-card2)', borderRadius:4, width:'70%' }} />
                  <div style={{ height:16, background:'var(--bg-card2)', borderRadius:4, width:'50%' }} />
                  <div style={{ height:24, background:'var(--bg-card2)', borderRadius:4, width:'40%', marginTop:'auto' }} />
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 14 : 22 }}>
              {featured.slice(0, isMobile ? 3 : 6).map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
            </div>
          ) : null}
            
            {/* Mobile message to see details */}
            {isMobile && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ 
                  marginTop: 24, 
                  padding: '16px 20px', 
                  background: 'rgba(200,16,46,0.08)', 
                  border: '1px solid rgba(200,16,46,0.2)', 
                  borderRadius: 12, 
                  textAlign: 'center' 
                }}
              >
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 8 }}>
                  {l==='fr'?'👆 Tapez sur une voiture pour voir les détails complets':
                   l==='en'?'👆 Tap on a car to see full details':
                   l==='de'?'👆 Tippen Sie auf ein Auto, um alle Details zu sehen':
                   l==='es'?'👆 Toca un coche para ver todos los detalles':
                   l==='it'?'👆 Tocca un\'auto per vedere tutti i dettagli':
                   '👆 Toque em um carro para ver todos os detalhes'}
                </p>
                <Link to="/catalog" style={{ 
                  fontSize: 13, 
                  fontWeight: 700, 
                  color: '#C8102E', 
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  {l==='fr'?'Voir tout le catalogue':l==='en'?'View full catalog':l==='de'?'Gesamten Katalog ansehen':l==='es'?'Ver catálogo completo':l==='it'?'Vedi catalogo completo':'Ver catálogo completo'} →
                </Link>
              </motion.div>
            )}
          </div>
        </section>

      {/* ── SERVICES ── */}
      <section style={{ background:'var(--bg-card2)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }} className="section-pad">
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>{t('services_label', l)}</div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
              {l==='fr'?'Ce que nous faisons\npour vous':l==='en'?'What we do\nfor you':l==='de'?'Was wir für\nSie tun':l==='es'?'Lo que hacemos\npor usted':l==='it'?'Cosa facciamo\nper voi':'O que fazemos\npor você'}
            </h2>
            <p style={{ fontSize:16, color:'var(--text-3)', marginTop:12, maxWidth:520, margin:'12px auto 0' }}>{t('services_sub', l)}</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 12 : 18 }}>
            {SERVICES.map((s, i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.07, duration:0.5 }}
                style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'22px 24px', transition:'all 0.3s', boxShadow:'var(--shadow-sm)' }}
                onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(200,16,46,0.3)'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='var(--shadow-md)';}}
                onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='var(--shadow-sm)';}}>
                <div style={{ fontSize:32, marginBottom:14 }}>{s.icon}</div>
                <span style={{ display:'inline-block', background:'var(--red-bg)', border:'1px solid var(--red-border)', color:'var(--red)', fontSize:9, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', padding:'3px 10px', borderRadius:3, marginBottom:10 }}>{s.tag}</span>
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:18, color:'var(--text)', marginBottom:8 }}>{getServiceTitle(s)}</h3>
                <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.65 }}>{getServiceDesc(s)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="section-pad">
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>
              {l==='fr'?'Notre Force':l==='en'?'Our Strength':l==='de'?'Unsere Stärke':l==='es'?'Nuestra Fuerza':l==='it'?'La Nostra Forza':'Nossa Força'}
            </div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
              {l==='fr'?'Pourquoi nous\nchoisir ?':l==='en'?'Why choose\nus?':l==='de'?'Warum uns\nwählen?':l==='es'?'¿Por qué\nelegirnos?':l==='it'?'Perché sceglierci':'Por que nos escolher?'}
            </h2>
            <p style={{ fontSize:16, color:'var(--text-3)', marginTop:12, maxWidth:600, margin:'12px auto 0' }}>
              {l==='fr'?'Découvrez ce qui nous distingue et pourquoi des milliers de clients nous font confiance.':l==='en'?'Discover what sets us apart and why thousands of customers trust us.':l==='de'?'Entdecken Sie, was uns unterscheidet und warum uns tausende Kunden vertrauen.':l==='es'?'Descubre lo que nos distingue y por qué miles de clientes confían en nosotros.':l==='it'?'Scopri cosa ci distingue e perché migliaia di clienti si fidano di noi.':'Descubra o que nos diferencia e por que milhares de clientes confiam em nós.'}
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: isMobile ? 24 : 32 }}>
            {/* Q&A Item 1 */}
            <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}
              style={{ display:'flex', gap:20, alignItems:'start', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? 20 : 28, boxShadow:'var(--shadow-sm)' }}>
              <div style={{ width: isMobile ? 80 : 120, height: isMobile ? 80 : 120, borderRadius:12, overflow:'hidden', flexShrink:0 }}>
                <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80" alt="Quality" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
              <div style={{ flex:1 }}>
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize: isMobile ? 16 : 18, color:'var(--text)', marginBottom:8 }}>
                  {l==='fr'?'Véhicules certifiés et inspectés':l==='en'?'Certified and inspected vehicles':l==='de'?'Zertifizierte und geprüfte Fahrzeuge':l==='es'?'Vehículos certificados e inspeccionados':l==='it'?'Veicoli certificati e ispezionati':'Veículos certificados e inspecionados'}
                </h3>
                <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.6 }}>
                  {l==='fr'?'Chaque véhicule passe par une inspection de 150 points. Historique complet vérifié, garantie jusqu\'à 24 mois.':l==='en'?'Every vehicle undergoes a 150-point inspection. Complete verified history, warranty up to 24 months.':l==='de'?'Jedes Fahrzeug durchläuft eine 150-Punkte-Inspektion. Vollständig verifizierte Historie, Garantie bis zu 24 Monaten.':l==='es'?'Cada vehículo pasa por una inspección de 150 puntos. Historial completo verificado, garantía hasta 24 meses.':l==='it'?'Ogni veicolo subisce un\'ispezione di 150 punti. Storia completa verificata, garanzia fino a 24 mesi.'}
                </p>
              </div>
            </motion.div>

            {/* Q&A Item 2 */}
            <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:0.1 }}
              style={{ display:'flex', gap:20, alignItems:'start', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? 20 : 28, boxShadow:'var(--shadow-sm)' }}>
              <div style={{ width: isMobile ? 80 : 120, height: isMobile ? 80 : 120, borderRadius:12, overflow:'hidden', flexShrink:0 }}>
                <img src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300&q=80" alt="Financing" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
              <div style={{ flex:1 }}>
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize: isMobile ? 16 : 18, color:'var(--text)', marginBottom:8 }}>
                  {l==='fr'?'Financement sur mesure':l==='en'?'Tailored financing':l==='de'?'Maßgeschneiderte Finanzierung':l==='es'?'Financiación a medida':l==='it'?'Finanziamento su misura':'Financiamento personalizado'}
                </h3>
                <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.6 }}>
                  {l==='fr'?'Taux compétitifs, réponse en 24h, options flexibles. Nous travaillons avec les meilleurs partenaires bancaires.':l==='en'?'Competitive rates, response in 24h, flexible options. We work with the best banking partners.':l==='de'?'Wettbewerbsfähige Zinsen, Antwort in 24h, flexible Optionen. Wir arbeiten mit den besten Bankpartnern.':l==='es'?'Tasas competitivas, respuesta en 24h, opciones flexibles. Trabajamos con los mejores socios bancarios.':l==='it'?'Tassi competitivi, risposta in 24h, opzioni flessibili. Lavoriamo con i migliori partner bancari.'}
                </p>
              </div>
            </motion.div>

            {/* Q&A Item 3 */}
            <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:0.2 }}
              style={{ display:'flex', gap:20, alignItems:'start', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? 20 : 28, boxShadow:'var(--shadow-sm)' }}>
              <div style={{ width: isMobile ? 80 : 120, height: isMobile ? 80 : 120, borderRadius:12, overflow:'hidden', flexShrink:0 }}>
                <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=300&q=80" alt="Delivery" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
              <div style={{ flex:1 }}>
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize: isMobile ? 16 : 18, color:'var(--text)', marginBottom:8 }}>
                  {l==='fr'?'Livraison partout en Europe':l==='en'?'Delivery across Europe':l==='de'?'Lieferung in ganz Europa':l==='es'?'Entrega en toda Europa':l==='it'?'Consegna in tutta Europa':'Entrega em toda a Europa'}
                </h3>
                <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.6 }}>
                  {l==='fr'?'Transport sécurisé, livraison à domicile, suivi en temps réel. Votre véhicule livré propre et avec plein.':l==='en'?'Secure transport, home delivery, real-time tracking. Your vehicle delivered clean and with full tank.':l==='de'?'Sicherer Transport, Hauslieferung, Echtzeit-Tracking. Ihr Fahrzeug sauber und vollgetankt geliefert.':l==='es'?'Transporte seguro, entrega a domicilio, seguimiento en tiempo real. Su vehículo entregado limpio y con depósito lleno.':l==='it'?'Trasporto sicuro, consegna a domicilio, tracciamento in tempo reale. Il vostro veicolo consegnato pulito e con il pieno.'}
                </p>
              </div>
            </motion.div>

            {/* Q&A Item 4 */}
            <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:0.3 }}
              style={{ display:'flex', gap:20, alignItems:'start', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? 20 : 28, boxShadow:'var(--shadow-sm)' }}>
              <div style={{ width: isMobile ? 80 : 120, height: isMobile ? 80 : 120, borderRadius:12, overflow:'hidden', flexShrink:0 }}>
                <img src="https://images.unsplash.com/photo-1454117096348-e4abbeba002c?w=300&q=80" alt="Support" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
              <div style={{ flex:1 }}>
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize: isMobile ? 16 : 18, color:'var(--text)', marginBottom:8 }}>
                  {l==='fr'?'Support client 24/7':l==='en'?'24/7 customer support':l==='de'?'24/7 Kundensupport':l==='es'?'Soporte al cliente 24/7':l==='it'?'Supporto clienti 24/7':'Suporte ao cliente 24/7'}
                </h3>
                <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.6 }}>
                  {l==='fr'?'Équipe disponible par WhatsApp, email et téléphone. Assistance pour toutes vos questions, même après la vente.':l==='en'?'Team available via WhatsApp, email and phone. Assistance for all your questions, even after sale.':l==='de'?'Team verfügbar per WhatsApp, E-Mail und Telefon. Unterstützung für alle Ihre Fragen, auch nach dem Verkauf.':l==='es'?'Equipo disponible por WhatsApp, correo y teléfono. Asistencia para todas sus preguntas, incluso después de la venta.':l==='it'?'Team disponibile via WhatsApp, email e telefono. Assistenza per tutte le vostre domande, anche dopo la vendita.'}
                </p>
              </div>
            </motion.div>

            {/* Q&A Item 5 */}
            <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:0.4 }}
              style={{ display:'flex', gap:20, alignItems:'start', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? 20 : 28, boxShadow:'var(--shadow-sm)' }}>
              <div style={{ width: isMobile ? 80 : 120, height: isMobile ? 80 : 120, borderRadius:12, overflow:'hidden', flexShrink:0 }}>
                <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&q=80" alt="Trade-in" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
              <div style={{ flex:1 }}>
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize: isMobile ? 16 : 18, color:'var(--text)', marginBottom:8 }}>
                  {l==='fr'?'Reprise de votre véhicule':l==='en'?'Trade-in your vehicle':l==='de'?'Ankauf Ihres Fahrzeugs':l==='es'?'Canje de su vehículo':l==='it'?'Permuta del vostro veicolo':'Troca do seu veículo'}
                </h3>
                <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.6 }}>
                  {l==='fr'?'Estimation gratuite en ligne, reprise au meilleur prix. Simplifiez votre achat avec notre service de reprise.':l==='en'?'Free online valuation, trade-in at best price. Simplify your purchase with our trade-in service.':l==='de'?'Kostenlose Online-Bewertung, Ankauf zum besten Preis. Vereinfachen Sie Ihren Kauf mit unserem Ankaufsservice.':l==='es'?'Valoración gratuita en línea, canje al mejor precio. Simplifique su compra con nuestro servicio de canje.':l==='it'?'Valutazione gratuita online, permuta al miglior prezzo. Semplificate il vostro acquisto con il nostro servizio di permuta.'}
                </p>
              </div>
            </motion.div>

            {/* Q&A Item 6 */}
            <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:0.5 }}
              style={{ display:'flex', gap:20, alignItems:'start', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? 20 : 28, boxShadow:'var(--shadow-sm)' }}>
              <div style={{ width: isMobile ? 80 : 120, height: isMobile ? 80 : 120, borderRadius:12, overflow:'hidden', flexShrink:0 }}>
                <img src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=300&q=80" alt="Warranty" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
              <div style={{ flex:1 }}>
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize: isMobile ? 16 : 18, color:'var(--text)', marginBottom:8 }}>
                  {l==='fr'?'Garantie étendue incluse':l==='en'?'Extended warranty included':l==='de'?'Erweiterte Garantie enthalten':l==='es'?'Garantía extendida incluida':l==='it'?'Garanzia estesa inclusa':'Garantia estendida incluída'}
                </h3>
                <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.6 }}>
                  {l==='fr'?'Protection moteur et transmission, assistance 24/7, options d\'extension jusqu\'à 36 mois. Roulez l\'esprit tranquille.':l==='en'?'Engine and transmission protection, 24/7 assistance, extension options up to 36 months. Drive with peace of mind.':l==='de'?'Motor- und Getriebeschutz, 24/7 Assistance, Erweiterungsoptionen bis zu 36 Monaten. Fahren Sie mit ruhigem Gewissen.':l==='es'?'Protección de motor y transmisión, asistencia 24/7, opciones de extensión hasta 36 meses. Conduzca con tranquilidad.':l==='it'?'Protezione motore e trasmissione, assistenza 24/7, opzioni di estensione fino a 36 mesi. Guidate con tranquillità.'}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Stats Banner */}
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:0.6 }}
            style={{ marginTop:48, padding: isMobile ? 28 : 36, background:'linear-gradient(135deg,rgba(200,16,46,0.08),rgba(200,16,46,0.03))', border:'2px solid rgba(200,16,46,0.2)', borderRadius:16, display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,1fr)', gap:24, textAlign:'center' }}>
            {[
              { value:'10+', label:l==='fr'?'Années d\'expérience':l==='en'?'Years experience':l==='de'?'Jahre Erfahrung':l==='es'?'Años de experiencia':l==='it'?'Anni di esperienza':'Anos de experiência' },
              { value:'5000+', label:l==='fr'?'Clients satisfaits':l==='en'?'Happy clients':l==='de'?'Zufriedene Kunden':l==='es'?'Clientes satisfechos':l==='it'?'Clienti soddisfatti':'Clientes satisfeitos' },
              { value:'4.9★', label:l==='fr'?'Note moyenne':l==='en'?'Average rating':l==='de'?'Durchschnittsbewertung':l==='es'?'Calificación promedio':l==='it'?'Valutazione media':'Avaliação média' },
              { value:'24/7', label:l==='fr'?'Support disponible':l==='en'?'Support available':l==='de'?'Support verfügbar':l==='es'?'Soporte disponible':l==='it'?'Supporto disponibile':'Suporte disponível' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize: isMobile ? 32 : 40, color:'#C8102E', lineHeight:1 }}>{value}</div>
                <div style={{ fontSize: isMobile ? 12 : 13, color:'var(--text-3)', marginTop:6, fontWeight:600 }}>{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WARRANTY & INSURANCE ── */}
      <section className="section-pad">
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>
              {l==='fr'?'Protection':l==='en'?'Protection':l==='de'?'Schutz':l==='es'?'Protección':l==='it'?'Protezione':'Proteção'}
            </div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
              {l==='fr'?'Garanties &\nAssurances':l==='en'?'Warranties &\nInsurance':l==='de'?'Garantien &\nVersicherungen':l==='es'?'Garantías &\nSeguros':l==='it'?'Garanzie &\nAssicurazioni':'Garantias &\nSeguros'}
            </h2>
            <p style={{ fontSize:16, color:'var(--text-3)', marginTop:12, maxWidth:600, margin:'12px auto 0' }}>
              {l==='fr'?'Une protection complète pour votre véhicule, avec des garanties étendues et des options d\'assurance sur mesure.':l==='en'?'Complete protection for your vehicle with extended warranties and tailored insurance options.':l==='de'?'Umfassender Schutz für Ihr Fahrzeug mit erweiterten Garantien und maßgeschneiderten Versicherungsoptionen.':l==='es'?'Protección completa para su vehículo con garantías extendidas y opciones de seguro a medida.':l==='it'?'Protezione completa per il vostro veicolo con garanzie estese e opzioni assicurative su misura.':'Proteção completa para seu veículo com garantias estendidas e opções de seguro sob medida.'}
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 16 : 24 }}>
            {/* Warranty Card */}
            <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}
              style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? 24 : 32, boxShadow:'var(--shadow-sm)', transition:'all 0.3s' }}
              onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(200,16,46,0.3)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-md)';}}
              onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='var(--shadow-sm)';}}>
              <div style={{ width:56, height:56, borderRadius:12, background:'linear-gradient(135deg,rgba(200,16,46,0.15),rgba(200,16,46,0.05))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:20 }}>
                🛡️
              </div>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize: isMobile ? 18 : 20, color:'var(--text)', marginBottom:12 }}>
                {l==='fr'?'Garantie German Auto Cars':l==='en'?'German Auto Cars Warranty':l==='de'?'German Auto Cars Garantie':l==='es'?'Garantía German Auto Cars':l==='it'?'Garanzia German Auto Cars':'Garantia German Auto Cars'}
              </h3>
              <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.6, marginBottom:20 }}>
                {l==='fr'?'Incluse dans toutes les commandes. Valable 12 mois ou 10 000 km. Protection moteur, boîte de vitesse, hors pièces d\'usure.':l==='en'?'Included in all orders. Valid 12 months or 10,000 km. Engine and transmission protection, excluding wear parts.':l==='de'?'In allen Bestellungen enthalten. Gültig 12 Monate oder 10.000 km. Motor- und Getriebeschutz, Verschleißteile ausgeschlossen.':l==='es'?'Incluida en todos los pedidos. Válida 12 meses o 10.000 km. Protección de motor y transmisión, excluyendo piezas de desgaste.':l==='it'?'Inclusa in tutti gli ordini. Valida 12 mesi o 10.000 km. Protezione motore e trasmissione, esclusi pezzi di usura.':'Incluída em todos os pedidos. Válida 12 meses ou 10.000 km. Proteção de motor e transmissão, excluindo peças de desgaste.'}
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                {[
                  l==='fr'?'✓ 12 mois':l==='en'?'✓ 12 months':l==='de'?'✓ 12 Monate':l==='es'?'✓ 12 meses':l==='it'?'✓ 12 mesi':'✓ 12 meses',
                  l==='fr'?'✓ 10 000 km':l==='en'?'✓ 10,000 km':l==='de'?'✓ 10.000 km':l==='es'?'✓ 10.000 km':l==='it'?'✓ 10.000 km':'✓ 10.000 km',
                  l==='fr'?'✓ Moteur':l==='en'?'✓ Engine':l==='de'?'✓ Motor':l==='es'?'✓ Motor':l==='it'?'✓ Motore':'✓ Motor',
                ].map((badge, i) => (
                  <span key={i} style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', background:'var(--bg-card2)', padding:'6px 12px', borderRadius:6 }}>{badge}</span>
                ))}
              </div>
              <Link to="/warranty" style={{ 
                display:'inline-flex', 
                alignItems:'center', 
                gap:6, 
                fontSize:13, 
                fontWeight:700, 
                color:'#C8102E', 
                textDecoration:'none',
                transition:'all 0.3s'
              }}>
                {l==='fr'?'En savoir plus':l==='en'?'Learn more':l==='de'?'Mehr erfahren':l==='es'?'Saber más':l==='it'?'Scopri di più':'Saiba mais'} →
              </Link>
            </motion.div>

            {/* Extension Options */}
            <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:0.1 }}
              style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? 24 : 32, boxShadow:'var(--shadow-sm)', transition:'all 0.3s' }}
              onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(200,16,46,0.3)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-md)';}}
              onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='var(--shadow-sm)';}}>
              <div style={{ width:56, height:56, borderRadius:12, background:'linear-gradient(135deg,rgba(200,16,46,0.15),rgba(200,16,46,0.05))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:20 }}>
                📅
              </div>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize: isMobile ? 18 : 20, color:'var(--text)', marginBottom:12 }}>
                {l==='fr'?'Options d\'extension':l==='en'?'Extension options':l==='de'?'Erweiterungsoptionen':l==='es'?'Opciones de extensión':l==='it'?'Opzioni di estensione':'Opções de extensão'}
              </h3>
              <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.6, marginBottom:20 }}>
                {l==='fr'?'Étendez votre protection jusqu\'à 36 mois. Options disponibles : assistance 24/7, véhicule de remplacement, garantie carrosserie.':l==='en'?'Extend your protection up to 36 months. Available options: 24/7 assistance, replacement vehicle, body warranty.':l==='de'?'Erweitern Sie Ihren Schutz bis zu 36 Monaten. Verfügbare Optionen: 24/7 Assistance, Ersatzfahrzeug, Karossergarantie.':l==='es'?'Amplíe su protección hasta 36 meses. Opciones disponibles: asistencia 24/7, vehículo de reemplazo, garantía de carrocería.':l==='it'?'Estendete la tua protezione fino a 36 mesi. Opzioni disponibili: assistenza 24/7, veicolo sostitutivo, garanzia carrozzeria.':'Estenda sua proteção até 36 meses. Opções disponíveis: assistência 24/7, veículo substituto, garantia de carroceria.'}
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                {[
                  l==='fr'?'✓ 24 mois':l==='en'?'✓ 24 months':l==='de'?'✓ 24 Monate':l==='es'?'✓ 24 meses':l==='it'?'✓ 24 mesi':'✓ 24 meses',
                  l==='fr'?'✓ 36 mois':l==='en'?'✓ 36 months':l==='de'?'✓ 36 Monate':l==='es'?'✓ 36 meses':l==='it'?'✓ 36 mesi':'✓ 36 meses',
                  l==='fr'?'✓ 24/7':l==='en'?'✓ 24/7':l==='de'?'✓ 24/7':l==='es'?'✓ 24/7':l==='it'?'✓ 24/7':'✓ 24/7',
                ].map((badge, i) => (
                  <span key={i} style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', background:'var(--bg-card2)', padding:'6px 12px', borderRadius:6 }}>{badge}</span>
                ))}
              </div>
              <Link to="/warranty" style={{ 
                display:'inline-flex', 
                alignItems:'center', 
                gap:6, 
                fontSize:13, 
                fontWeight:700, 
                color:'#C8102E', 
                textDecoration:'none',
                transition:'all 0.3s'
              }}>
                {l==='fr'?'En savoir plus':l==='en'?'Learn more':l==='de'?'Mehr erfahren':l==='es'?'Saber más':l==='it'?'Scopri di più':'Saiba mais'} →
              </Link>
            </motion.div>

            {/* Insurance */}
            <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:0.2 }}
              style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? 24 : 32, boxShadow:'var(--shadow-sm)', transition:'all 0.3s' }}
              onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(200,16,46,0.3)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-md)';}}
              onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='var(--shadow-sm)';}}>
              <div style={{ width:56, height:56, borderRadius:12, background:'linear-gradient(135deg,rgba(200,16,46,0.15),rgba(200,16,46,0.05))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:20 }}>
                💳
              </div>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize: isMobile ? 18 : 20, color:'var(--text)', marginBottom:12 }}>
                {l==='fr'?'Assurance véhicule':l==='en'?'Vehicle insurance':l==='de'?'Fahrzeugversicherung':l==='es'?'Seguro de vehículo':l==='it'?'Assicurazione veicolo':'Seguro veículo'}
              </h3>
              <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.6, marginBottom:20 }}>
                {l==='fr'?'Solutions d\'assurance complètes : responsabilité civile, tous risques, protection contre le vol et les incendies.':l==='en'?'Comprehensive insurance solutions: liability, full coverage, theft and fire protection.':l==='de'?'Umfassende Versicherungslösungen: Haftpflicht, Vollkasko, Diebstahl- und Brandschutz.':l==='es'?'Soluciones de seguro completas: responsabilidad civil, cobertura total, protección contra robo e incendios.':l==='it'?'Soluzioni assicurative complete: responsabilità civile, copertura totale, protezione contro furto e incendio.':'Soluções de seguro abrangentes: responsabilidade civil, cobertura total, proteção contra roubo e incêndio.'}
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                {[
                  l==='fr'?'✓ RC':l==='en'?'✓ Liability':l==='de'?'✓ Haftpflicht':l==='es'?'✓ RC':l==='it'?'✓ RC':'✓ RC',
                  l==='fr'?'✓ Tous risques':l==='en'?'✓ Full coverage':l==='de'?'✓ Vollkasko':l==='es'?'✓ Todo riesgo':l==='it'?'✓ Casco totale':'✓ Cobertura total',
                  l==='fr'?'✓ Vol':l==='en'?'✓ Theft':l==='de'?'✓ Diebstahl':l==='es'?'✓ Robo':l==='it'?'✓ Furto':'✓ Roubo',
                ].map((badge, i) => (
                  <span key={i} style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', background:'var(--bg-card2)', padding:'6px 12px', borderRadius:6 }}>{badge}</span>
                ))}
              </div>
              <Link to="/insurance" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:700, color:'#C8102E', textDecoration:'none' }}>
                {l==='fr'?'En savoir plus':l==='en'?'Learn more':l==='de'?'Mehr erfahren':l==='es'?'Saber más':l==='it'?'Scopri di più':'Saiba mais'} →
              </Link>
            </motion.div>
          </div>

          {/* Trust badges */}
          <div style={{ marginTop:40, display:'flex', justifyContent:'center', flexWrap:'wrap', gap:12 }}>
            {[
              { text: l==='fr'?'✓ Garantie incluse':l==='en'?'✓ Warranty included':l==='de'?'✓ Garantie enthalten':l==='es'?'✓ Garantía incluida':l==='it'?'✓ Garanzia inclusa':'✓ Garantia incluída', color: '#C8102E' },
              { text: l==='fr'?'✓ Protection étendue':l==='en'?'✓ Extended protection':l==='de'?'✓ Erweiterter Schutz':l==='es'?'✓ Protección extendida':l==='it'?'✓ Protezione estesa':'✓ Proteção estendida', color: '#C8102E' },
              { text: l==='fr'?'✓ Assurance sur mesure':l==='en'?'✓ Tailored insurance':l==='de'?'✓ Maßgeschneiderte Versicherung':l==='es'?'✓ Seguro a medida':l==='it'?'✓ Assicurazione su misura':'✓ Seguro sob medida', color: '#C8102E' },
              { text: l==='fr'?'✓ Assistance 24/7':l==='en'?'✓ 24/7 assistance':l==='de'?'✓ 24/7 Assistance':l==='es'?'✓ Asistencia 24/7':l==='it'?'✓ Assistenza 24/7':'✓ Assistência 24/7', color: '#C8102E' },
            ].map((badge, i) => (
              <div key={i} style={{ padding:'10px 20px', background:'var(--bg-card2)', border:'1px solid rgba(200,16,46,0.2)', borderRadius:8, fontSize:13, fontWeight:700, color:badge.color }}>
                {badge.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>{t('reviews_label', l)}</div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(26px,4vw,50px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
              {l==='fr'?'Ce que disent\nnos clients':l==='en'?'What our\ncustomers say':l==='de'?'Was unsere Kunden\nsagen':l==='es'?'Lo que dicen\nnuestros clientes':l==='it'?'Cosa dicono\ni nostri clienti':'O que dizem\nnosssos clientes'}
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(2,1fr)', gap: isMobile ? 12 : 20 }}>
            {REVIEWS.map((r, i) => (
              <motion.div key={i} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08, duration:0.5 }}
                style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'22px 24px', boxShadow:'var(--shadow-sm)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#9B0B22,#C8102E)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:14, color:'#fff', flexShrink:0 }}>{r.avatar}</div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:15, color:'var(--text)' }}>{r.name}</p>
                    <Stars n={r.rating} />
                  </div>
                  <span style={{ marginLeft:'auto', fontSize:11, fontWeight:600, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', color:'var(--green)', padding:'3px 10px', borderRadius:4 }}>✓ {t('verified', l)}</span>
                </div>
                <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.7 }}>"{getReviewText(r)}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section style={{ background:'var(--bg-card2)', borderTop:'1px solid var(--border)' }} className="section-pad">
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 32 : 60, alignItems:'center' }}>
          <div>
            <div className="section-eyebrow">{t('contact_label', l)}</div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,50px)', color:'var(--text)', letterSpacing:'-0.02em', marginBottom:20 }}>
              {t('contact_title', l)}
            </h2>
            <p style={{ fontSize:15, color:'var(--text-3)', lineHeight:1.7, marginBottom:28 }}>
              {l==='fr'?'Notre équipe est à votre disposition pour vous accompagner dans votre projet automobile.':l==='en'?'Our team is at your disposal to help you with your car project.':l==='de'?'Unser Team steht Ihnen für Ihr Autoprojekt zur Verfügung.':l==='es'?'Nuestro equipo está a su disposición para ayudarle con su proyecto.':l==='it'?'Il nostro team è a vostra disposizione per il vostro progetto.':'Nossa equipe está à sua disposição para ajudá-lo com seu projeto.'}
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <a href="https://wa.me/4915788823274" target="_blank" rel="noopener noreferrer"
                style={{ background:'#25D366', color:'#fff', textDecoration:'none', fontFamily:"'Outfit',sans-serif", fontSize:14, fontWeight:700, padding:'13px 24px', borderRadius:8, display:'inline-flex', alignItems:'center', gap:8 }}>
                💬 WhatsApp
              </a>
              <a href="mailto:autoKompetenz@gmail.com" className="btn-ghost" style={{ fontSize:13 }}>
                ✉ Email
              </a>
            </div>
          </div>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding: isMobile ? 22 : 32, boxShadow:'var(--shadow-sm)' }}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--red)', marginBottom:18 }}>{t('contact_hours', l)}</p>
            {[
              { day:t('mon_fri',l), hours:'09:00 – 18:00' },
              { day:t('saturday',l), hours:'10:00 – 15:00' },
              { day:t('sunday',l), hours:t('closed',l) },
            ].map(({ day, hours }) => (
              <div key={day} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:14, color:'var(--text-2)', fontWeight:600 }}>{day}</span>
                <span style={{ fontSize:14, color:hours===t('closed',l)?'#DC2626':'var(--green)', fontWeight:700 }}>{hours}</span>
              </div>
            ))}
            <div style={{ marginTop:20, padding:'14px 18px', background:'var(--red-bg)', border:'1px solid var(--red-border)', borderRadius:8 }}>
              <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6 }}>
                📍 Neuenkirchener Str. 127, 48282 Emsdetten<br/>
                📞 <a href="tel:+4915788823274" style={{ color:'var(--red)', textDecoration:'none', fontWeight:600 }}>+49 157 888 232 74</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'var(--bg-card2)', borderTop:'1px solid var(--border)', padding: isMobile ? '36px 5% 28px' : '48px 7% 32px' }}>
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr auto', gap: isMobile ? 24 : 40, alignItems:'start' }}>
            <div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:900, color:'var(--text)', letterSpacing:'0.05em' }}>AUTO KOMPETENZ</div>
              <div style={{ fontSize:9, letterSpacing:'0.4em', color:'var(--red)', textTransform:'uppercase', marginTop:3, marginBottom:12 }}>GmbH · Emsdetten</div>
              <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.6, maxWidth:240 }}>
                {l==='fr'?'Votre partenaire automobile de confiance en Allemagne.':l==='en'?'Your trusted car partner in Germany.':l==='de'?'Ihr vertrauenswürdiger Autopartner in Deutschland.':l==='es'?'Su socio de confianza en Alemania.':l==='it'?'Il vostro partner automobilistico di fiducia in Germania.':'Seu parceiro automobilístico de confiança na Alemanha.'}
              </p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: isMobile ? 20 : 16, paddingLeft: isMobile ? 0 : 40 }}>
              <div>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--red)', marginBottom:12 }}>Navigation</p>
                {[{to:'/catalog',label:t('nav_vehicles',l)},{to:'/simulation',label:t('nav_financing',l)},{to:'/track',label:t('nav_track',l)}].map(({to,label})=>(
                  <Link key={to} to={to} style={{ display:'block', fontSize:14, color:'var(--text-3)', textDecoration:'none', marginBottom:8, transition:'color 0.2s' }}
                    onMouseOver={e=>e.currentTarget.style.color='var(--red)'} onMouseOut={e=>e.currentTarget.style.color='var(--text-3)'}>{label}</Link>
                ))}
              </div>
              <div>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--red)', marginBottom:12 }}>Contact</p>
                <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.8 }}>
                  📞 +49 157 888 232 74<br/>
                  ✉ autoKompetenz@gmail.com<br/>
                  💬 <a href="https://wa.me/4915788823274" style={{ color:'var(--red)', textDecoration:'none' }}>WhatsApp</a>
                </p>
              </div>
              <div>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--red)', marginBottom:12 }}>
                  {l==='fr'?'Informations légales':l==='en'?'Legal':l==='de'?'Rechtliches':l==='es'?'Legal':l==='it'?'Note legali':'Informações legais'}
                </p>
                {[
                  { to:'/mentions-legales', fr:'Mentions légales', en:'Legal notice', de:'Impressum' },
                  { to:'/politique-de-vente', fr:'Politique de vente', en:'Sales policy', de:'Verkaufspolitik' },
                  { to:'/cgv', fr:'CGV', en:'Terms of sale', de:'AGB' },
                  { to:'/politique-confidentialite', fr:'Confidentialité', en:'Privacy', de:'Datenschutz' },
                  { to:'/cookies', fr:'Cookies', en:'Cookies', de:'Cookies' },
                ].map(({ to, fr, en, de }) => {
                  const label = l === 'fr' ? fr : l === 'en' ? en : l === 'de' ? de : l === 'es' ? fr : l === 'it' ? en : l === 'pt' ? en : fr;
                  return (
                  <Link key={to} to={to} style={{ display:'block', fontSize:14, color:'var(--text-3)', textDecoration:'none', marginBottom:8, transition:'color 0.2s' }}
                    onMouseOver={e=>{ e.currentTarget.style.color='var(--red)'; }}
                    onMouseOut={e=>{ e.currentTarget.style.color='var(--text-3)'; }}>
                    {label}
                  </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={{ height:1, background:'var(--border)', margin:'28px 0 20px' }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
            <p style={{ fontSize:12, color:'var(--text-3)' }}>© {new Date().getFullYear()} Auto Kompetenz GmbH. {t('copyright', l)}.</p>
            <p style={{ fontSize:12, color:'var(--text-3)' }}>{t('made_in', l)}</p>
          </div>
        </div>
      </footer>

      <CookieBanner lang={l} />
    </div>
  );
}
