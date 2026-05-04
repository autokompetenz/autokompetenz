import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { carAPI } from '../services/api';
import { useAuthStore, useCartStore, useToastStore, useLangStore } from '../store';
import { formatEuro, calculateMonthlyPayment, calculateOrderTotals } from '../utils/helpers';
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

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('full');
  const [adding, setAdding] = useState(false);

  const SL = SPEC_LABELS[lang] || SPEC_LABELS.fr;

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
      addToast(`${car.make} ${car.model} ${lang === 'fr' ? 'ajouté au panier' : lang === 'en' ? 'added to cart' : lang === 'de' ? 'zum Warenkorb hinzugefügt' : 'أضيف إلى السلة'}`, 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Erreur', 'error');
    } finally { setAdding(false); }
  };

  if (loading) return <div style={{ paddingTop: 100, background: 'var(--black)', minHeight: '100vh' }}><Loader text="Chargement..." /></div>;
  if (!car) return null;

  const images = [car.imageUrl, car.imageUrl2, car.imageUrl3].filter(Boolean);
  const totals = calculateOrderTotals(car.price, selectedPayment);

  const breadcrumbs = { fr: 'Accueil', en: 'Home', de: 'Startseite', ar: 'الرئيسية' };
  const catalogBc   = { fr: 'Catalogue', en: 'Catalogue', de: 'Katalog', ar: 'الكتالوج' };
  const choosePayment = { fr: 'Choisir votre mode de paiement', en: 'Choose your payment method', de: 'Zahlungsart wählen', ar: 'اختر طريقة الدفع' };
  const totalLabel    = { fr: 'Total', en: 'Total', de: 'Gesamt', ar: 'المجموع' };
  const depositLabel  = { fr: 'Acompte', en: 'Deposit', de: 'Anzahlung', ar: 'دفعة أولى' };
  const monthLabel    = { fr: 'Par mois', en: 'Per month', de: 'Pro Monat', ar: 'شهرياً' };
  const addBtn        = { fr: 'Ajouter au panier', en: 'Add to Cart', de: 'In den Warenkorb', ar: 'أضف إلى السلة' };
  const recSalary     = { fr: 'Salaire minimum recommandé', en: 'Minimum recommended salary', de: 'Empfohlenes Mindestgehalt', ar: 'الحد الأدنى الموصى به للراتب' };
  const saving        = { fr: 'Économie', en: 'Saving', de: 'Ersparnis', ar: 'توفير' };
  const totalContract = { fr: 'Total contrat', en: 'Total contract', de: 'Gesamtbetrag', ar: 'إجمالي العقد' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', paddingTop: 76 }}>
      {/* Breadcrumb */}
      <div style={{ padding: '18px 6%', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'var(--dark)' }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = '#C8102E'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.35)'}>
            {breadcrumbs[lang]}
          </Link>
          <span style={{ margin: '0 10px', opacity: 0.3 }}>›</span>
          <Link to="/catalog" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = '#C8102E'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.35)'}>
            {catalogBc[lang]}
          </Link>
          <span style={{ margin: '0 10px', opacity: 0.3 }}>›</span>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{car.make} {car.model}</span>
        </p>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '52px 6%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>

          {/* ── Gallery ── */}
          <div>
            <motion.div key={activeImg} initial={{ opacity: 0.7, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
              style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', aspectRatio: '4/3', background: 'var(--dark-2)' }}>
              <img src={images[activeImg] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80'}
                alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {car.featured && (
                <div style={{ position: 'absolute', top: 18, left: 18, background: '#C8102E', color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '6px 14px', borderRadius: 4 }}>
                  ★ {lang === 'fr' ? 'Recommandé' : lang === 'en' ? 'Featured' : lang === 'de' ? 'Empfohlen' : 'مميز'}
                </div>
              )}
            </motion.div>

            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} style={{ flex: 1, aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', border: `2px solid ${activeImg === i ? '#C8102E' : 'transparent'}`, opacity: activeImg === i ? 1 : 0.5, cursor: 'pointer', transition: 'all 0.2s', padding: 0, background: 'none' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details ── */}
          <div>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C8102E' }}>
                {car.category} · {car.year}
              </span>
            </div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 52, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 20 }}>
              {car.make} {car.model}
            </h1>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 28 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 40, color: '#fff', letterSpacing: '-0.02em' }}>
                {formatEuro(car.price)}
              </span>
              {car.monthlyPayment && (
                <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                  {t('or', lang)} {formatEuro(car.monthlyPayment)}{t('per_month', lang)}
                </span>
              )}
            </div>

            {/* Specs grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
              {[
                { label: SL.power, value: car.power ? `${car.power} hp` : 'N/A' },
                { label: SL.fuel, value: car.fuelType },
                { label: SL.gear, value: car.transmission },
                { label: SL.km, value: car.mileage === 0 ? SL.new : `${car.mileage.toLocaleString('fr-FR')} km` },
                { label: SL.color, value: car.color || 'N/A' },
                { label: SL.stock, value: car.stock > 0 ? `${car.stock} ${SL.available}` : SL.unavailable, highlight: car.stock > 0 ? '#22C55E' : '#EF4444' },
              ].map(({ label, value, highlight }) => (
                <div key={label} style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: highlight || '#fff' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {car.description && (
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginBottom: 28, borderLeft: '3px solid rgba(200,16,46,0.4)', paddingLeft: 18 }}>
                {car.description}
              </p>
            )}

            {/* Payment options */}
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C8102E', marginBottom: 14 }}>
              {choosePayment[lang] || choosePayment.fr}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {PAYMENT_OPTIONS.map(opt => {
                const to = calculateOrderTotals(car.price, opt.id);
                return (
                  <div key={opt.id} onClick={() => setSelectedPayment(opt.id)}
                    className={`payment-option ${selectedPayment === opt.id ? 'selected' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: 26 }}>{opt.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{t(opt.titleKey, lang)}</span>
                          <span style={{ fontSize: 10, background: 'rgba(200,16,46,0.15)', color: '#C8102E', border: '1px solid rgba(200,16,46,0.3)', padding: '2px 8px', borderRadius: 3, fontWeight: 700, letterSpacing: '0.1em' }}>
                            {t(opt.badgeKey, lang)}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                          {opt.id === 'full' ? (lang === 'fr' ? 'Paiement immédiat, 5% de remise offerte' : lang === 'en' ? 'Immediate payment, 5% discount applied' : lang === 'de' ? 'Sofortzahlung, 5% Rabatt' : 'دفع فوري، خصم 5%')
                           : opt.id === 'deposit' ? (lang === 'fr' ? '25% maintenant, solde à la livraison' : lang === 'en' ? '25% now, balance on delivery' : lang === 'de' ? '25% jetzt, Rest bei Lieferung' : '25% الآن، الباقي عند التسليم')
                           : (lang === 'fr' ? '60 mensualités à 6%/an' : lang === 'en' ? '60 months at 6%/year' : lang === 'de' ? '60 Monate, 6% p.a.' : '60 شهراً بمعدل 6% سنوياً')}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {opt.id === 'full' && <><p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>{formatEuro(car.price)}</p><p style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>{formatEuro(to.total)}</p></>}
                        {opt.id === 'deposit' && <><p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{depositLabel[lang]}</p><p style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>{formatEuro(to.deposit)}</p></>}
                        {opt.id === 'monthly' && <><p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{monthLabel[lang]}</p><p style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>{formatEuro(to.monthly)}</p></>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total display */}
            <div style={{ background: 'rgba(200,16,46,0.06)', border: '1px solid rgba(200,16,46,0.2)', borderRadius: 10, padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
                  {selectedPayment === 'full' ? (totalLabel[lang] + ' (après remise)') : selectedPayment === 'deposit' ? depositLabel[lang] : monthLabel[lang]}
                </p>
                {selectedPayment === 'full' && totals.discount && <p style={{ fontSize: 12, color: '#22C55E' }}>✓ {saving[lang]} : {formatEuro(totals.discount)}</p>}
                {selectedPayment === 'monthly' && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{totalContract[lang]} : {formatEuro(totals.total)}</p>}
              </div>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 30, color: '#fff', letterSpacing: '-0.02em' }}>
                {selectedPayment === 'full' ? formatEuro(totals.total)
                 : selectedPayment === 'deposit' ? formatEuro(totals.deposit)
                 : `${formatEuro(totals.monthly)}/mo`}
              </span>
            </div>

            {/* Add to cart */}
            <button onClick={handleAddToCart} disabled={car.stock === 0 || adding}
              style={{ width: '100%', padding: '18px', borderRadius: 8, fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: car.stock === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.3s', background: car.stock === 0 ? 'rgba(255,255,255,0.06)' : adding ? 'rgba(200,16,46,0.6)' : '#C8102E', color: car.stock === 0 ? '#444' : '#fff' }}
              onMouseOver={e => { if (car.stock > 0 && !adding) e.currentTarget.style.background = '#9B0B22'; }}
              onMouseOut={e => { if (car.stock > 0 && !adding) e.currentTarget.style.background = '#C8102E'; }}>
              {adding ? '...' : car.stock === 0 ? t('out_of_stock', lang) : '🛒 ' + (addBtn[lang] || addBtn.fr)}
            </button>

            {car.minSalary && (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 12 }}>
                {recSalary[lang] || recSalary.fr} : {formatEuro(car.minSalary)}/
                {lang === 'fr' ? 'mois' : lang === 'en' ? 'month' : lang === 'de' ? 'Monat' : 'شهر'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
