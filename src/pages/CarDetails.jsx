import { useState, useEffect } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { carAPI } from '../services/api';
import { useAuthStore, useCartStore, useToastStore, useLangStore, useThemeStore } from '../store';
import { formatEuro, calculateOrderTotals } from '../utils/helpers';
import { Loader } from '../components/UI';
import { t } from '../utils/i18n';

const PAYMENT_OPTIONS = [
  { id: 'full',    icon: '💎', titleKey: 'payment_full',    badgeKey: 'discount_5' },
  { id: 'deposit', icon: '🔑', titleKey: 'payment_deposit', badgeKey: 'payment_deposit' },
  { id: 'monthly', icon: '📅', titleKey: 'payment_monthly', badgeKey: 'months_60' },
];

const SPEC_LABELS = {
  fr: { power:'Puissance', fuel:'Carburant', gear:'Boîte', km:'Kilométrage', color:'Couleur', stock:'Disponibilité', new:'Neuf', available:'disponible(s)', unavailable:'Épuisé' },
  en: { power:'Power', fuel:'Fuel', gear:'Gearbox', km:'Mileage', color:'Colour', stock:'Availability', new:'New', available:'available', unavailable:'Out of stock' },
  de: { power:'Leistung', fuel:'Kraftstoff', gear:'Getriebe', km:'Kilometerstand', color:'Farbe', stock:'Verfügbarkeit', new:'Neu', available:'verfügbar', unavailable:'Ausverkauft' },
  ar: { power:'القوة', fuel:'الوقود', gear:'ناقل الحركة', km:'عداد المسافة', color:'اللون', stock:'التوافر', new:'جديد', available:'متوفر', unavailable:'غير متوفر' },
};

const IMAGE_FIELDS = [
  'imageUrl','imageUrl2','imageUrl3','imageUrl4','imageUrl5',
  'imageUrl6','imageUrl7','imageUrl8','imageUrl9','imageUrl10',
  'imageUrl11','imageUrl12','imageUrl13','imageUrl14','imageUrl15',
  'imageUrl16','imageUrl17','imageUrl18','imageUrl19','imageUrl20'
];

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('full');
  const [adding, setAdding] = useState(false);

  const SL = SPEC_LABELS[lang] || SPEC_LABELS.fr;
  const { isMobile } = useBreakpoint();

  // Theme-aware color tokens — computed from isDark
  const C = {
    bg:      isDark ? '#0a0a0a'                  : '#f5f5f5',
    card:    isDark ? '#141414'                  : '#ffffff',
    card2:   isDark ? '#1a1a1a'                  : '#ececec',
    border:  isDark ? 'rgba(255,255,255,0.08)'   : 'rgba(0,0,0,0.1)',
    text:    isDark ? '#ffffff'                  : '#111111',
    text2:   isDark ? 'rgba(255,255,255,0.65)'   : '#444444',
    text3:   isDark ? 'rgba(255,255,255,0.35)'   : '#888888',
    red:     '#C8102E',
    shadow:  isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
    disabledBg:   isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    disabledText: isDark ? '#444' : '#aaa',
  };

  useEffect(() => {
    setLoading(true);
    carAPI.getById(id)
      .then(r => { setCar(r.data.car); setLoading(false); })
      .catch(() => { setLoading(false); navigate('/catalog'); });
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      setAdding(true);
      await addItem(car.id, selectedPayment);
      addToast(
        `${car.make} ${car.model} ${
          lang === 'fr' ? 'ajouté au panier' :
          lang === 'en' ? 'added to cart' :
          lang === 'de' ? 'zum Warenkorb hinzugefügt' :
          'أضيف إلى السلة'
        }`, 'success'
      );
    } catch (err) {
      addToast(err.response?.data?.error || 'Erreur', 'error');
    } finally { setAdding(false); }
  };

  if (loading) return (
    <div style={{ paddingTop: 100, background: isDark ? '#0a0a0a' : '#f5f5f5', minHeight: '100vh' }}>
      <Loader text="Chargement..." />
    </div>
  );
  if (!car) return null;

  const images = IMAGE_FIELDS.map(f => car?.[f]).filter(Boolean);
  const totals = calculateOrderTotals(car.price, selectedPayment);

  const breadcrumbs   = { fr:'Accueil', en:'Home', de:'Startseite', ar:'الرئيسية' };
  const catalogBc     = { fr:'Catalogue', en:'Catalogue', de:'Katalog', ar:'الكتالوج' };
  const choosePayment = { fr:'Choisir votre mode de paiement', en:'Choose your payment method', de:'Zahlungsart wählen', ar:'اختر طريقة الدفع' };
  const totalLabel    = { fr:'Total', en:'Total', de:'Gesamt', ar:'المجموع' };
  const depositLabel  = { fr:'Acompte', en:'Deposit', de:'Anzahlung', ar:'دفعة أولى' };
  const monthLabel    = { fr:'Par mois', en:'Per month', de:'Pro Monat', ar:'شهرياً' };
  const addBtn        = { fr:'Ajouter au panier', en:'Add to Cart', de:'In den Warenkorb', ar:'أضف إلى السلة' };
  const recSalary     = { fr:'Salaire minimum recommandé', en:'Minimum recommended salary', de:'Empfohlenes Mindestgehalt', ar:'الحد الأدنى الموصى به للراتب' };
  const saving        = { fr:'Économie', en:'Saving', de:'Ersparnis', ar:'توفير' };
  const totalContract = { fr:'Total contrat', en:'Total contract', de:'Gesamtbetrag', ar:'إجمالي العقد' };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingTop: 76 }}>

      {/* Breadcrumb */}
      <div style={{ padding: '18px 6%', borderBottom: `1px solid ${C.border}`, background: C.card2 }}>
        <p style={{ fontSize: 13, color: C.text3 }}>
          <Link to="/" style={{ color: C.text3, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = C.red}
            onMouseOut={e => e.target.style.color = C.text3}>
            {breadcrumbs[lang]}
          </Link>
          <span style={{ margin: '0 10px', opacity: 0.3 }}>›</span>
          <Link to="/catalog" style={{ color: C.text3, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = C.red}
            onMouseOut={e => e.target.style.color = C.text3}>
            {catalogBc[lang]}
          </Link>
          <span style={{ margin: '0 10px', opacity: 0.3 }}>›</span>
          <span style={{ color: C.text2 }}>{car.make} {car.model}</span>
        </p>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: isMobile ? '28px 4%' : '52px 6%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 32 : 64 }}>

          {/* ── Gallery ── */}
          <div>
            <motion.div
              key={activeImg}
              initial={{ opacity: 0.7, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'relative', borderRadius: 14, overflow: 'hidden',
                aspectRatio: '4/3', background: C.card, boxShadow: C.shadow,
              }}
            >
              <img
                src={images[activeImg] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80'}
                alt={`${car.make} ${car.model}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {car.featured && (
                <div style={{
                  position: 'absolute', top: 18, left: 18,
                  background: '#C8102E', color: '#fff',
                  fontSize: 11, fontWeight: 800, letterSpacing: '0.15em',
                  textTransform: 'uppercase', padding: '6px 14px', borderRadius: 4,
                }}>
                  ★ {lang === 'fr' ? 'Recommandé' : lang === 'en' ? 'Featured' : lang === 'de' ? 'Empfohlen' : 'مميز'}
                </div>
              )}
              {images.length > 1 && (
                <div style={{
                  position: 'absolute', bottom: 14, right: 14,
                  background: 'rgba(0,0,0,0.7)', color: '#fff',
                  fontSize: 12, fontWeight: 700, padding: '4px 10px',
                  borderRadius: 20, backdropFilter: 'blur(4px)',
                }}>
                  {activeImg + 1} / {images.length}
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(5, 1fr)',
                gap: 10, marginTop: 16,
              }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    style={{
                      aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden',
                      border: `2.5px solid ${activeImg === i ? '#C8102E' : C.border}`,
                      opacity: activeImg === i ? 1 : 0.6,
                      cursor: 'pointer', transition: 'all 0.25s ease',
                      padding: 0, background: C.card,
                      transform: activeImg === i ? 'scale(1.02)' : 'scale(1)',
                    }}
                    onMouseOver={e => { if (activeImg !== i) { e.currentTarget.style.opacity='0.9'; e.currentTarget.style.transform='scale(1.05)'; e.currentTarget.style.borderColor='rgba(200,16,46,0.4)'; }}}
                    onMouseOut={e => { if (activeImg !== i) { e.currentTarget.style.opacity='0.6'; e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.borderColor=C.border; }}}
                  >
                    <img src={img} alt={`Vue ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details ── */}
          <div>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.red }}>
                {car.category} · {car.year}
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Outfit', sans-serif", fontWeight: 900,
              fontSize: isMobile ? 36 : 52, color: C.text,
              letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 20,
            }}>
              {car.make} {car.model}
            </h1>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 28 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 40, color: C.text, letterSpacing: '-0.02em' }}>
                {formatEuro(car.price)}
              </span>
              {car.monthlyPayment && (
                <span style={{ fontSize: 15, color: C.text3, fontWeight: 500 }}>
                  {t('or', lang)} {formatEuro(car.monthlyPayment)}{t('per_month', lang)}
                </span>
              )}
            </div>

            {/* Specs grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { label: SL.power, value: car.power ? `${car.power} hp` : 'N/A', icon: '⚡' },
                { label: SL.fuel,  value: car.fuelType, icon: '⛽' },
                { label: SL.gear,  value: car.transmission, icon: '⚙️' },
                { label: SL.km,    value: car.mileage === 0 ? SL.new : `${car.mileage.toLocaleString('fr-FR')} km`, icon: '📏' },
                { label: SL.color, value: car.color || 'N/A', icon: '🎨' },
                { label: SL.stock, value: car.stock > 0 ? `${car.stock} ${SL.available}` : SL.unavailable, highlight: car.stock > 0 ? '#22C55E' : '#EF4444', icon: '📦' },
              ].map(({ label, value, highlight, icon }) => (
                <div key={label}
                  style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: isMobile ? '14px 16px' : '16px 18px', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='rgba(200,16,46,0.3)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform='translateY(0)'; }}
                >
                  <span style={{ fontSize: 24, opacity: 0.8 }}>{icon}</span>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.text3, marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: highlight || C.text }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {car.description && (
              <p style={{ fontSize: 15, color: C.text2, lineHeight: 1.75, marginBottom: 28, borderLeft: '3px solid rgba(200,16,46,0.4)', paddingLeft: 18 }}>
                {car.description}
              </p>
            )}

            {/* Payment options */}
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.red, marginBottom: 16 }}>
              {choosePayment[lang] || choosePayment.fr}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {PAYMENT_OPTIONS.map(opt => {
                const to = calculateOrderTotals(car.price, opt.id);
                const isSelected = selectedPayment === opt.id;
                return (
                  <div key={opt.id} onClick={() => setSelectedPayment(opt.id)}
                    style={{
                      padding: isMobile ? '16px' : '18px 20px', borderRadius: 12,
                      border: `2px solid ${isSelected ? 'rgba(200,16,46,0.6)' : C.border}`,
                      background: isSelected ? 'rgba(200,16,46,0.08)' : C.card,
                      cursor: 'pointer', transition: 'all 0.25s ease',
                      transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                      boxShadow: isSelected ? '0 4px 20px rgba(200,16,46,0.12)' : 'none',
                    }}
                    onMouseOver={e => { if (!isSelected) { e.currentTarget.style.borderColor='rgba(200,16,46,0.3)'; e.currentTarget.style.background=isDark?'rgba(200,16,46,0.05)':'rgba(200,16,46,0.03)'; }}}
                    onMouseOut={e => { if (!isSelected) { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.card; }}}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 16 }}>
                      <span style={{ fontSize: isMobile ? 24 : 28 }}>{opt.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: isMobile ? 14 : 16, color: C.text }}>{t(opt.titleKey, lang)}</span>
                          <span style={{ fontSize: 10, background: 'rgba(200,16,46,0.15)', color: '#C8102E', border: '1px solid rgba(200,16,46,0.3)', padding: '3px 10px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.1em' }}>
                            {t(opt.badgeKey, lang)}
                          </span>
                        </div>
                        <p style={{ fontSize: isMobile ? 12 : 13, color: C.text3, lineHeight: 1.5 }}>
                          {opt.id === 'full'
                            ? (lang==='fr'?'Paiement immédiat, 5% de remise offerte':lang==='en'?'Immediate payment, 5% discount applied':lang==='de'?'Sofortzahlung, 5% Rabatt':'دفع فوري، خصم 5%')
                            : opt.id === 'deposit'
                            ? (lang==='fr'?'25% maintenant, solde à la livraison':lang==='en'?'25% now, balance on delivery':lang==='de'?'25% jetzt, Rest bei Lieferung':'25% الآن، الباقي عند التسليم')
                            : (lang==='fr'?'60 mensualités à 6%/an':lang==='en'?'60 months at 6%/year':lang==='de'?'60 Monate, 6% p.a.':'60 شهراً بمعدل 6% سنوياً')}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: isMobile ? 80 : 100 }}>
                        {opt.id === 'full' && (
                          <>
                            <p style={{ fontSize: isMobile?11:12, color: C.text3, textDecoration: 'line-through', marginBottom: 2 }}>{formatEuro(car.price)}</p>
                            <p style={{ fontWeight: 800, fontSize: isMobile?16:18, color: C.text }}>{formatEuro(to.total)}</p>
                          </>
                        )}
                        {opt.id === 'deposit' && (
                          <>
                            <p style={{ fontSize: isMobile?10:11, color: C.text3, marginBottom: 2 }}>{depositLabel[lang]}</p>
                            <p style={{ fontWeight: 800, fontSize: isMobile?16:18, color: C.text }}>{formatEuro(to.deposit)}</p>
                          </>
                        )}
                        {opt.id === 'monthly' && (
                          <>
                            <p style={{ fontSize: isMobile?10:11, color: C.text3, marginBottom: 2 }}>{monthLabel[lang]}</p>
                            <p style={{ fontWeight: 800, fontSize: isMobile?16:18, color: C.text }}>{formatEuro(to.monthly)}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div style={{
              background: isDark ? 'rgba(200,16,46,0.07)' : 'rgba(200,16,46,0.04)',
              border: '1.5px solid rgba(200,16,46,0.2)',
              borderRadius: 14, padding: isMobile ? '18px 20px' : '20px 24px', marginBottom: 24,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.text3, marginBottom: 4 }}>
                  {selectedPayment==='full' ? (totalLabel[lang]+' (après remise)') : selectedPayment==='deposit' ? depositLabel[lang] : monthLabel[lang]}
                </p>
                {selectedPayment==='full' && totals.discount && (
                  <p style={{ fontSize: 13, color: '#22C55E', fontWeight: 700 }}>✓ {saving[lang]} : {formatEuro(totals.discount)}</p>
                )}
                {selectedPayment==='monthly' && (
                  <p style={{ fontSize: 12, color: C.text3 }}>{totalContract[lang]} : {formatEuro(totals.total)}</p>
                )}
              </div>
              <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize: isMobile?28:32, color: C.text, letterSpacing:'-0.02em' }}>
                {selectedPayment==='full' ? formatEuro(totals.total) : selectedPayment==='deposit' ? formatEuro(totals.deposit) : `${formatEuro(totals.monthly)}/mo`}
              </span>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={car.stock === 0 || adding}
              style={{
                width: '100%', padding: isMobile ? '18px' : '20px', borderRadius: 12,
                fontFamily: "'Outfit',sans-serif", fontSize: isMobile?14:15, fontWeight:800,
                letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none',
                cursor: car.stock===0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                background: car.stock===0 ? C.disabledBg : adding ? 'rgba(200,16,46,0.7)' : 'linear-gradient(135deg,#C8102E,#9B0B22)',
                color: car.stock===0 ? C.disabledText : '#fff',
                boxShadow: car.stock>0 && !adding ? '0 4px 16px rgba(200,16,46,0.3)' : 'none',
              }}
              onMouseOver={e => { if (car.stock>0&&!adding) { e.currentTarget.style.background='linear-gradient(135deg,#9B0B22,#7A0818)'; e.currentTarget.style.transform='scale(1.02)'; }}}
              onMouseOut={e => { if (car.stock>0&&!adding) { e.currentTarget.style.background='linear-gradient(135deg,#C8102E,#9B0B22)'; e.currentTarget.style.transform='scale(1)'; }}}
            >
              {adding ? '...' : car.stock===0 ? t('out_of_stock',lang) : '🛒 '+(addBtn[lang]||addBtn.fr)}
            </button>

            {car.minSalary && (
              <p style={{ textAlign:'center', fontSize:12, color:C.text3, marginTop:12 }}>
                {recSalary[lang]||recSalary.fr} : {formatEuro(car.minSalary)}/{lang==='fr'?'mois':lang==='en'?'month':lang==='de'?'Monat':'شهر'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}