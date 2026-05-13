import { useBreakpoint } from '../hooks/useBreakpoint';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { simAPI } from '../services/api';
import { formatEuro } from '../utils/helpers';
import CarCard from '../components/CarCard';
import { Loader } from '../components/UI';
import { useLangStore } from '../store';

export default function Simulation() {
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const [salary, setSalary]     = useState(3000);
  const [inputVal, setInputVal] = useState('3000');
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const l = lang || 'fr';

  const fetchSim = useCallback(async (val) => {
    if (!val || val <= 0) return;
    setLoading(true);
    try {
      const { data } = await simAPI.simulate(val);
      setResult(data);
      setSearched(true);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const handleSlider = (e) => { const v = parseInt(e.target.value); setSalary(v); setInputVal(String(v)); };
  const handleInput  = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setInputVal(raw);
    const v = parseInt(raw);
    if (v && v >= 500 && v <= 50000) setSalary(v);
  };

  const L = {
    label:       { fr:'Outil de simulation',    en:'Financing Simulator',       de:'Finanzierungsrechner',      es:'Simulador de financiación',       it:'Simulatore di finanziamento',   pt:'Simulador de financiamento' },
    title1:      { fr:'Simuler mon',            en:'Simulate my',               de:'Finanzierung',               es:'Simular mi',                      it:'Simula il mio',                 pt:'Simular meu' },
    title2:      { fr:'financement',            en:'financing',                  de:'simulieren',                 es:'financiación',                    it:'finanziamento',                 pt:'financiamento' },
    sub:         { fr:'Indiquez votre salaire mensuel et découvrez instantanément les véhicules accessibles (33% du salaire).', en:'Enter your monthly salary and instantly discover accessible vehicles (33% of salary).', de:'Geben Sie Ihr Monatsgehalt ein und entdecken Sie sofort erreichbare Fahrzeuge (33% des Gehalts).', es:'Indique su salario mensual y descubra al instante los vehículos accesibles (33% del salario).', it:'Inserisci il tuo stipendio mensile e scopri subito i veicoli accessibili (33% dello stipendio).', pt:'Indique o seu salário mensal e descubra instantaneamente os veículos acessíveis (33% do salário).' },
    sliderLabel: { fr:'Votre salaire mensuel brut', en:'Your gross monthly salary', de:'Ihr Brutto-Monatsgehalt', es:'Su salario mensual bruto', it:'Il vostro stipendio mensile lordo', pt:'O seu salário mensal bruto' },
    profile:     { fr:'Votre profil financier', en:'Your financial profile',     de:'Ihr Finanzprofil',          es:'Su perfil financiero',             it:'Il vostro profilo finanziario',  pt:'O seu perfil financeiro' },
    salaryL:     { fr:'Salaire',                en:'Salary',                     de:'Gehalt',                    es:'Salario',                          it:'Stipendio',                     pt:'Salário' },
    maxRate:     { fr:'Mensualité max (33%)',   en:'Max monthly (33%)',          de:'Max. Rate (33%)',            es:'Cuota máx. (33%)',                 it:'Rata max. (33%)',               pt:'Parcela máx. (33%)' },
    deposit:     { fr:'Acompte possible (×3)', en:'Possible deposit (×3)',      de:'Mögliche Anzahlung (×3)',   es:'Señal posible (×3)',               it:'Acconto possibile (×3)',         pt:'Entrada possível (×3)' },
    simulate:    { fr:'Simuler maintenant',     en:'Simulate now',               de:'Jetzt simulieren',          es:'Simular ahora',                    it:'Simula ora',                    pt:'Simular agora' },
    loadingL:    { fr:'Recherche en cours...',  en:'Searching...',               de:'Suche läuft...',            es:'Buscando...',                      it:'Ricerca in corso...',           pt:'Pesquisando...' },
    results:     { fr:'véhicule(s) accessible(s) avec un salaire de', en:'vehicle(s) accessible with a salary of', de:'Fahrzeug(e) erreichbar mit Gehalt von', es:'vehículo(s) accesible(s) con un salario de', it:'veicolo/i accessibile/i con uno stipendio di', pt:'veículo(s) acessível/eis com um salário de' },
    maxRateR:    { fr:'Mensualité max :',       en:'Max. monthly rate:',         de:'Max. Rate:',                es:'Cuota máx.:',                      it:'Rata max.:',                    pt:'Parcela máx.:' },
    noResult:    { fr:'Aucun véhicule accessible', en:'No vehicles accessible', de:'Keine Fahrzeuge erreichbar', es:'Ningún vehículo accesible',       it:'Nessun veicolo accessibile',    pt:'Nenhum veículo acessível' },
    noResultSub: { fr:'Avec une mensualité max de', en:'With a max monthly of', de:'Mit max. Rate von',         es:'Con una cuota máx. de',            it:'Con una rata max. di',          pt:'Com uma parcela máx. de' },
    noResultSub2:{ fr:", aucun véhicule ne correspond. Contactez-nous pour des solutions personnalisées.", en:", no vehicle matches. Contact us for personalised solutions.", de:", passt kein Fahrzeug. Kontaktieren Sie uns.", es:", ningún vehículo coincide. Contáctenos para soluciones personalizadas.", it:", nessun veicolo corrisponde. Contattateci per soluzioni personalizzate.", pt:", nenhum veículo corresponde. Contacte-nos para soluções personalizadas." },
    contact:     { fr:'Nous contacter via WhatsApp', en:'Contact us via WhatsApp', de:'WhatsApp kontaktieren', es:'Contáctenos por WhatsApp',         it:'Contattateci via WhatsApp',     pt:'Contacte-nos via WhatsApp' },
    per_month:   { fr:'/mois',                 en:'/month',                     de:'/Monat',                    es:'/mes',                             it:'/mese',                         pt:'/mês' },
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:72 }}>

      {/* Header */}
      <div style={{ padding: isMobile ? '48px 5% 36px' : '72px 6% 56px', background:'var(--bg-card2)', borderBottom:'1px solid var(--border)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'40%', background:'radial-gradient(ellipse at right, rgba(200,16,46,0.07), transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:1100, margin:'0 auto' }}>
          <div className="section-eyebrow">{L.label[l]}</div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(40px,6vw,88px)', color:'var(--text)', letterSpacing:'-0.02em', lineHeight:1, marginBottom:16 }}>
            <span style={{ display:'block' }}>{L.title1[l]}</span>
            <span style={{ display:'block', color:'var(--red)' }}>{L.title2[l]}</span>
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 17, color:'var(--text-3)', maxWidth:520, lineHeight:1.7 }}>{L.sub[l]}</p>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding: isMobile ? '28px 4%' : '52px 6%' }}>

        {/* Simulator card */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? '24px 20px' : '40px 44px', marginBottom:44, boxShadow:'var(--shadow-md)' }}>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 28 : 52, alignItems:'center' }}>

            {/* Slider */}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:24 }}>
                {L.sliderLabel[l]}
              </label>
              <input type="range" min="500" max="50000" step="100" value={salary} onChange={handleSlider}
                style={{ width:'100%', marginBottom:10, accentColor:'var(--red)' }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-3)', marginBottom:24 }}>
                <span>€500</span><span>€50 000</span>
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <div style={{ position:'relative', flex:1 }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:18, fontWeight:800, color:'var(--text-3)', fontFamily:"'Outfit',sans-serif" }}>€</span>
                  <input type="text" value={inputVal} onChange={handleInput}
                    className="input-luxury"
                    style={{ paddingLeft:34, fontSize:20, fontWeight:800, fontFamily:"'Outfit',sans-serif" }} />
                </div>
                <span style={{ fontSize:13, color:'var(--text-3)', fontWeight:600, flexShrink:0 }}>{L.per_month[l]}</span>
              </div>
            </div>

            {/* Profile + CTA */}
            <div>
              <div style={{ background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? 18 : 24, marginBottom:18 }}>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:18 }}>{L.profile[l]}</p>
                <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                  {[
                    { label:L.salaryL[l],  value:formatEuro(salary),               color:'var(--text)' },
                    { label:L.maxRate[l],  value:formatEuro(Math.round(salary*0.33)), color:'var(--red)' },
                    { label:L.deposit[l],  value:formatEuro(salary*3),              color:'var(--text-2)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:14, color:'var(--text-3)' }}>{label}</span>
                      <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize: isMobile ? 18 : 20, color }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => fetchSim(salary)} disabled={loading} className="btn-primary"
                style={{ width:'100%', justifyContent:'center', padding: isMobile ? 15 : 18, fontSize:15 }}>
                {loading ? L.loadingL[l] : '🔍 ' + L.simulate[l]}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading && <div style={{ display:'flex', justifyContent:'center' }}><Loader text={L.loadingL[l]} /></div>}

        {searched && !loading && result && (
          <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}>
            <div style={{ textAlign:'center', marginBottom:40 }}>
              {result.count > 0 ? (
                <>
                  <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize: isMobile ? 64 : 88, color:'var(--red)', lineHeight:1, letterSpacing:'-0.03em' }}>{result.count}</p>
                  <p style={{ fontSize: isMobile ? 15 : 18, color:'var(--text-2)', marginTop:8, lineHeight:1.6 }}>
                    {L.results[l]} <strong style={{ color:'var(--text)' }}>{formatEuro(result.salary)}</strong>
                  </p>
                  <p style={{ fontSize:14, color:'var(--text-3)', marginTop:6 }}>
                    {L.maxRateR[l]} <strong style={{ color:'var(--red)' }}>{formatEuro(result.maxMonthly)}</strong>
                  </p>
                </>
              ) : (
                <div style={{ padding:'40px 0' }}>
                  <p style={{ fontSize:52, marginBottom:16 }}>🔍</p>
                  <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize: isMobile ? 24 : 30, color:'var(--text)', marginBottom:12 }}>{L.noResult[l]}</h3>
                  <p style={{ fontSize:15, color:'var(--text-3)', maxWidth:460, margin:'0 auto', lineHeight:1.7 }}>
                    {L.noResultSub[l]} <strong style={{ color:'var(--red)' }}>{formatEuro(result.maxMonthly)}</strong>{L.noResultSub2[l]}
                  </p>
                  <a href="https://wa.me/4915788823274" target="_blank" rel="noopener noreferrer"
                    className="btn-primary" style={{ display:'inline-flex', marginTop:24, fontSize:14 }}>
                    💬 {L.contact[l]}
                  </a>
                </div>
              )}
            </div>

            {result.cars?.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(280px,1fr))', gap: isMobile ? 14 : 22 }}>
                {result.cars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}