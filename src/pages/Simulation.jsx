import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { simAPI } from '../services/api';
import { formatEuro } from '../utils/helpers';
import CarCard from '../components/CarCard';
import { Loader } from '../components/UI';
import { useLangStore } from '../store';

export default function Simulation() {
  const { lang } = useLangStore();
  const [salary, setSalary] = useState(3000);
  const [inputVal, setInputVal] = useState('3000');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchSim = useCallback(async (val) => {
    if (!val || val <= 0) return;
    setLoading(true);
    try { const { data } = await simAPI.simulate(val); setResult(data); setSearched(true); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const handleSlider = (e) => { const v = parseInt(e.target.value); setSalary(v); setInputVal(String(v)); };
  const handleInput  = (e) => {
    const raw = e.target.value.replace(/\D/g,''); setInputVal(raw);
    const v = parseInt(raw);
    if (v && v >= 500 && v <= 50000) setSalary(v);
  };

  const L = {
    label:    { fr:'Outil de simulation',          en:'Financing Simulator',          de:'Finanzierungsrechner',         ar:'محاكاة التمويل' },
    title:    { fr:'Simuler mon\nfinancement',      en:'Simulate my\nfinancing',       de:'Finanzierung\nsimulieren',     ar:'محاكاة\nتمويلي' },
    sub:      { fr:'Indiquez votre salaire mensuel et découvrez instantanément les véhicules accessibles (33% du salaire).', en:'Enter your monthly salary and instantly discover accessible vehicles (33% of salary).', de:'Geben Sie Ihr Monatsgehalt ein und entdecken Sie sofort erreichbare Fahrzeuge (33% des Gehalts).', ar:'أدخل راتبك الشهري واكتشف فوراً السيارات المتاحة (33% من الراتب).' },
    sliderLabel: { fr:'Votre salaire mensuel brut', en:'Your gross monthly salary', de:'Ihr Brutto-Monatsgehalt', ar:'راتبك الشهري الإجمالي' },
    profile:  { fr:'Votre profil financier',        en:'Your financial profile',      de:'Ihr Finanzprofil',             ar:'ملفك المالي' },
    salaryL:  { fr:'Salaire',                        en:'Salary',                     de:'Gehalt',                       ar:'الراتب' },
    maxRate:  { fr:'Mensualité max (33%)',            en:'Max monthly (33%)',          de:'Max. Rate (33%)',              ar:'الحد الأقصى الشهري (33%)' },
    deposit:  { fr:'Acompte possible (×3)',          en:'Possible deposit (×3)',       de:'Mögliche Anzahlung (×3)',      ar:'الدفعة الأولى الممكنة (×3)' },
    simulate: { fr:'Simuler maintenant',             en:'Simulate now',               de:'Jetzt simulieren',             ar:'محاكاة الآن' },
    loading:  { fr:'Recherche en cours...',          en:'Searching...',               de:'Suche läuft...',               ar:'جارٍ البحث...' },
    results:  { fr:'véhicule(s) accessible(s) avec un salaire de', en:'vehicle(s) accessible with a salary of', de:'Fahrzeug(e) erreichbar mit Gehalt von', ar:'سيارات متاحة براتب' },
    maxRateR: { fr:'Mensualité max :',               en:'Max. monthly rate:',         de:'Max. Rate:',                   ar:'الحد الأقصى الشهري:' },
    noResult: { fr:'Aucun véhicule accessible',      en:'No vehicles accessible',     de:'Keine Fahrzeuge erreichbar',   ar:'لا توجد سيارات متاحة' },
    noResultSub: { fr:'Avec une mensualité max de', en:'With a max monthly of', de:'Mit max. Rate von', ar:'بحد أقصى شهري من' },
    noResultSub2: { fr:", aucun véhicule ne correspond actuellement. Contactez-nous pour des solutions personnalisées.", en:", no vehicle matches currently. Contact us for personalised solutions.", de:", passt kein Fahrzeug. Kontaktieren Sie uns für individuelle Lösungen.", ar:", لا توجد سيارة مطابقة حالياً. تواصل معنا للحلول المخصصة." },
    contact:  { fr:'Nous contacter via WhatsApp',   en:'Contact us via WhatsApp',     de:'WhatsApp kontaktieren',        ar:'تواصل معنا عبر واتساب' },
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--black)', paddingTop:76 }}>
      {/* Header */}
      <div style={{ padding:'72px 6% 60px', background:'var(--dark)', borderBottom:'1px solid rgba(255,255,255,0.05)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'40%', background:'radial-gradient(ellipse at right, rgba(200,16,46,0.06), transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div className="section-eyebrow">{L.label[lang]}</div>
          <h1 style={{ fontFamily:"'Outfit', sans-serif", fontWeight:900, fontSize:'clamp(48px,7vw,96px)', color:'#fff', letterSpacing:'-0.02em', lineHeight:1, marginBottom:20 }}>
            {(L.title[lang] || L.title.fr).split('\n').map((line,i) => (
              <span key={i} style={{ display:'block', color: i===1 ? '#C8102E' : '#fff' }}>{line}</span>
            ))}
          </h1>
          <p style={{ fontSize:18, color:'rgba(255,255,255,0.4)', maxWidth:560, lineHeight:1.7 }}>{L.sub[lang]}</p>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'56px 6%' }}>
        {/* Simulator card */}
        <div style={{ background:'var(--dark-2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'44px 48px', marginBottom:52 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:56, alignItems:'center' }}>
            {/* Left — slider */}
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:28 }}>
                {L.sliderLabel[lang]}
              </label>
              <input type="range" min="500" max="50000" step="100" value={salary} onChange={handleSlider} style={{ width:'100%', marginBottom:14, accentColor:'#C8102E' }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'rgba(255,255,255,0.2)', marginBottom:28 }}>
                <span>€500</span><span>€50,000</span>
              </div>
              <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                <div style={{ position:'relative', flex:1 }}>
                  <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:20, fontWeight:800, color:'rgba(255,255,255,0.4)', fontFamily:"'Outfit', sans-serif" }}>€</span>
                  <input type="text" value={inputVal} onChange={handleInput} className="input-luxury" style={{ paddingLeft:38, fontSize:22, fontWeight:800, fontFamily:"'Outfit', sans-serif" }} />
                </div>
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.35)', fontWeight:600, flexShrink:0 }}>/mois</span>
              </div>
            </div>

            {/* Right — profile + CTA */}
            <div>
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:24, marginBottom:20 }}>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.25em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:20 }}>{L.profile[lang]}</p>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {[
                    { label:L.salaryL[lang], value:formatEuro(salary), color:'#fff' },
                    { label:L.maxRate[lang],  value:formatEuro(Math.round(salary*0.33)), color:'#C8102E' },
                    { label:L.deposit[lang],  value:formatEuro(salary*3), color:'rgba(255,255,255,0.6)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:14, color:'rgba(255,255,255,0.4)' }}>{label}</span>
                      <span style={{ fontFamily:"'Outfit', sans-serif", fontWeight:800, fontSize:20, color }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => fetchSim(salary)} disabled={loading} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:18, fontSize:15 }}>
                {loading ? L.loading[lang] : '🔍 ' + L.simulate[lang]}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading && <Loader text={L.loading[lang]} />}

        {searched && !loading && result && (
          <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              {result.count > 0 ? (
                <>
                  <p style={{ fontFamily:"'Outfit', sans-serif", fontWeight:900, fontSize:80, color:'#C8102E', lineHeight:1, letterSpacing:'-0.03em' }}>{result.count}</p>
                  <p style={{ fontSize:18, color:'rgba(255,255,255,0.5)', marginTop:8, lineHeight:1.6 }}>
                    {L.results[lang]} <strong style={{ color:'#fff' }}>{formatEuro(result.salary)}</strong>
                  </p>
                  <p style={{ fontSize:14, color:'rgba(255,255,255,0.35)', marginTop:6 }}>
                    {L.maxRateR[lang]} <strong style={{ color:'#C8102E' }}>{formatEuro(result.maxMonthly)}</strong>
                  </p>
                </>
              ) : (
                <div style={{ padding:'40px 0' }}>
                  <p style={{ fontSize:56, marginBottom:16 }}>🔍</p>
                  <h3 style={{ fontFamily:"'Outfit', sans-serif", fontWeight:800, fontSize:30, color:'#fff', marginBottom:12 }}>{L.noResult[lang]}</h3>
                  <p style={{ fontSize:16, color:'rgba(255,255,255,0.4)', maxWidth:480, margin:'0 auto', lineHeight:1.7 }}>
                    {L.noResultSub[lang]} <strong style={{ color:'#C8102E' }}>{formatEuro(result.maxMonthly)}</strong>{L.noResultSub2[lang]}
                  </p>
                  <a href="https://wa.me/4915788823274" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display:'inline-flex', marginTop:24, fontSize:14 }}>
                    💬 {L.contact[lang]}
                  </a>
                </div>
              )}
            </div>

            {result.cars?.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:24 }}>
                {result.cars.map((car,i) => <CarCard key={car.id} car={car} index={i} />)}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
