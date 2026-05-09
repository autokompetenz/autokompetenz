import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { carAPI } from '../services/api';
import CarCard from '../components/CarCard';
import { PageHeader, Loader } from '../components/UI';
import { useLangStore } from '../store';
import { useBreakpoint } from '../hooks/useBreakpoint';

const ALL_CATEGORIES = ['Berline','SUV','Citadine','Break','Coupe','Cabriolet','Utilitaire'];

const CAT_LABELS = {
  fr: { Berline:'Berline',SUV:'SUV',Citadine:'Citadine',Break:'Break',Coupe:'Coupé',Cabriolet:'Cabriolet',Utilitaire:'Utilitaire' },
  en: { Berline:'Saloon',SUV:'SUV',Citadine:'City Car',Break:'Estate',Coupe:'Coupé',Cabriolet:'Convertible',Utilitaire:'Van' },
  de: { Berline:'Limousine',SUV:'SUV',Citadine:'Kleinwagen',Break:'Kombi',Coupe:'Coupé',Cabriolet:'Cabrio',Utilitaire:'Nutzfahrzeug' },
  ar: { Berline:'سيدان',SUV:'SUV',Citadine:'سيارة المدينة',Break:'ستيشن واجن',Coupe:'كوبيه',Cabriolet:'مكشوفة',Utilitaire:'شاحنة صغيرة' },
};

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars]               = useState([]);
  const [categories, setCategories]   = useState([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [filterOpen, setFilterOpen]   = useState(false);
  const { lang } = useLangStore();
  const { isMobile, isTablet } = useBreakpoint();

  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch   = searchParams.get('search') || '';

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentCategory !== 'all') params.category = currentCategory;
      if (currentSearch) params.search = currentSearch;
      const { data } = await carAPI.getAll(params);
      setCars(data.cars);
      setTotal(data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [currentCategory, currentSearch]);

  useEffect(() => { fetchCars(); }, [fetchCars]);
  useEffect(() => { carAPI.getCategories().then(r => setCategories(r.data.categories)).catch(console.error); }, []);

  const setFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    setSearchParams(next);
    if (isMobile) setFilterOpen(false);
  };

  const L = {
    title:      { fr:'Notre Catalogue',   en:'Our Catalogue',    de:'Unser Katalog',   ar:'كتالوجنا' },
    sub:        { fr:'Berlines, SUV, électriques — découvrez notre sélection de véhicules premium.', en:'Saloons, SUVs, electrics — discover our selection of premium vehicles.', de:'Limousinen, SUVs, Elektro — entdecken Sie unser Fahrzeugsortiment.', ar:'سيدان، SUV، كهربائية — اكتشف مجموعة سياراتنا المتميزة.' },
    category:   { fr:'Catégorie',         en:'Category',          de:'Kategorie',        ar:'الفئة' },
    all:        { fr:'Tous',              en:'All',               de:'Alle',             ar:'الكل' },
    reset:      { fr:'Réinitialiser',     en:'Reset',             de:'Zurücksetzen',     ar:'إعادة تعيين' },
    noResults:  { fr:'Aucun véhicule trouvé', en:'No vehicles found', de:'Keine Fahrzeuge', ar:'لا توجد سيارات' },
    tryOther:   { fr:'Essayez une autre catégorie.', en:'Try another category.', de:'Andere Kategorie.', ar:'جرب فئة أخرى.' },
    found:      { fr:'véhicule(s)',       en:'vehicle(s)',         de:'Fahrzeug(e)',      ar:'سيارة' },
    search:     { fr:'Rechercher...',     en:'Search...',          de:'Suchen...',        ar:'بحث...' },
    filters:    { fr:'Filtres',           en:'Filters',            de:'Filter',           ar:'تصفية' },
  };
  const l = lang || 'fr';

  const Sidebar = () => (
    <aside style={{ ...(isMobile && {
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 200,
      width: '80vw', maxWidth: 320, background: 'var(--dark)',
      overflowY: 'auto', padding: '24px 16px',
      transform: filterOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
      boxShadow: '8px 0 40px rgba(0,0,0,0.7)',
    }) }}>
      {isMobile && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>{L.filters[l]}</p>
          <button onClick={() => setFilterOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>
      )}
      <div style={{ marginBottom: 20 }}>
        <input type="text" placeholder={L.search[l]} value={currentSearch}
          onChange={e => setFilter('search', e.target.value)}
          className="input-luxury" style={{ fontSize: 15 }} />
      </div>
      <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden', padding: '8px 0' }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C8102E', padding: '12px 18px 8px' }}>
          {L.category[l]}
        </p>
        {[{ id: 'all', label: L.all[l], count: total }, ...ALL_CATEGORIES.map(cat => ({
          id: cat, label: (CAT_LABELS[l] || CAT_LABELS.fr)[cat],
          count: Array.isArray(categories) ? categories.find(c => c.name === cat)?.count || 0 : 0
        }))].map(({ id, label, count }) => (
          <button key={id} onClick={() => setFilter('category', id === 'all' ? '' : id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 18px', background: currentCategory === id ? 'rgba(200,16,46,0.1)' : 'transparent',
              border: 'none', borderLeft: `3px solid ${currentCategory === id ? '#C8102E' : 'transparent'}`,
              color: currentCategory === id ? '#C8102E' : 'rgba(255,255,255,0.5)',
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: currentCategory === id ? 700 : 400,
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
            }}>
            <span>{label}</span>
            {count > 0 && <span style={{ fontSize: 12, opacity: 0.5 }}>{count}</span>}
          </button>
        ))}
      </div>
    </aside>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      <PageHeader title={L.title[l]} subtitle={L.sub[l]} />

      {/* Mobile overlay */}
      {isMobile && filterOpen && (
        <div onClick={() => setFilterOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 199 }} />
      )}

      <Sidebar />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '32px 4%' : '48px 6%' }}>
        {/* Mobile filter bar */}
        {isMobile && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
            <button onClick={() => setFilterOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 16px', color: '#fff', fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, cursor: 'pointer', flex: 1, justifyContent: 'center' }}>
              ⚙ {L.filters[l]} {currentCategory !== 'all' && `· ${(CAT_LABELS[l] || CAT_LABELS.fr)[currentCategory] || ''}`}
            </button>
            {(currentCategory !== 'all' || currentSearch) && (
              <button onClick={() => setSearchParams({})}
                style={{ background: 'rgba(200,16,46,0.1)', border: '1px solid rgba(200,16,46,0.2)', borderRadius: 8, padding: '10px 14px', color: '#C8102E', fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                ✕
              </button>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '200px 1fr' : '240px 1fr', gap: isMobile ? 0 : 40 }}>
          {!isMobile && <Sidebar />}

          <div>
            {/* Results bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
                <span style={{ color: '#C8102E', fontWeight: 700 }}>{total}</span> {L.found[l]}
              </p>
              {!isMobile && (currentCategory !== 'all' || currentSearch) && (
                <button onClick={() => setSearchParams({})} style={{ fontSize: 13, color: '#C8102E', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 600, textDecoration: 'underline' }}>
                  {L.reset[l]}
                </button>
              )}
            </div>

            {loading ? (
              <Loader />
            ) : cars.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ fontSize: 56, marginBottom: 16 }}>🔍</p>
                <h3 style={{ fontWeight: 800, fontSize: 24, color: '#fff', marginBottom: 10 }}>{L.noResults[l]}</h3>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>{L.tryOther[l]}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: isMobile ? 16 : 24 }}>
                <AnimatePresence>
                  {cars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}