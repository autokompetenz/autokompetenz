import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { carAPI } from '../services/api';
import CarCard from '../components/CarCard';
import { PageHeader, Loader } from '../components/UI';
import { useLangStore } from '../store';
import { t } from '../utils/i18n';

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
  const { lang } = useLangStore();

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
  };

  const titles = { fr: 'Notre Catalogue', en: 'Our Catalogue', de: 'Unser Katalog', ar: 'كتالوجنا' };
  const subs   = { fr: 'Berlines, SUV, électriques — découvrez notre sélection de véhicules premium.', en: 'Saloons, SUVs, electrics — discover our selection of premium vehicles.', de: 'Limousinen, SUVs, Elektro — entdecken Sie unser Fahrzeugsortiment.', ar: 'سيدان، SUV، كهربائية — اكتشف مجموعة سياراتنا المتميزة.' };
  const allLabel = { fr:'Tous', en:'All', de:'Alle', ar:'الكل' };
  const resetLabel = { fr:'Réinitialiser', en:'Reset', de:'Zurücksetzen', ar:'إعادة تعيين' };
  const noResults = { fr:'Aucun véhicule trouvé', en:'No vehicles found', de:'Keine Fahrzeuge gefunden', ar:'لا توجد سيارات' };
  const tryOther = { fr:'Essayez une autre catégorie ou recherche.', en:'Try another category or search term.', de:'Versuchen Sie eine andere Kategorie.', ar:'جرب فئة أو بحثاً مختلفاً.' };
  const foundText = { fr:'véhicule(s) trouvé(s)', en:'vehicle(s) found', de:'Fahrzeug(e) gefunden', ar:'سيارة موجودة' };
  const searchLabel = { fr:'Rechercher...', en:'Search...', de:'Suchen...', ar:'بحث...' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      <PageHeader title={titles[lang] || titles.fr} subtitle={subs[lang] || subs.fr} />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '48px 6%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 40 }}>

          {/* ── Sidebar ── */}
          <aside>
            {/* Search */}
            <div style={{ marginBottom: 24 }}>
              <input type="text" placeholder={searchLabel[lang] || searchLabel.fr} value={currentSearch}
                onChange={e => setFilter('search', e.target.value)}
                className="input-luxury" style={{ fontSize: 15 }} />
            </div>

            {/* Categories */}
            <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden', padding: '8px 0' }}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C8102E', padding: '12px 18px 8px' }}>
                {lang === 'fr' ? 'Catégorie' : lang === 'en' ? 'Category' : lang === 'de' ? 'Kategorie' : 'الفئة'}
              </p>
              {[{ id: 'all', label: allLabel[lang] || 'Tous', count: total }, ...ALL_CATEGORIES.map(cat => ({ id: cat, label: (CAT_LABELS[lang] || CAT_LABELS.fr)[cat], count: categories.find(c => c.name === cat)?.count || 0 }))].map(({ id, label, count }) => (
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

          {/* ── Grid ── */}
          <div>
            {/* Results bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>
                <span style={{ color: '#C8102E', fontWeight: 700 }}>{total}</span> {foundText[lang] || foundText.fr}
                {currentCategory !== 'all' && <span style={{ color: 'rgba(255,255,255,0.6)' }}> · {(CAT_LABELS[lang] || CAT_LABELS.fr)[currentCategory]}</span>}
              </p>
              {(currentCategory !== 'all' || currentSearch) && (
                <button onClick={() => setSearchParams({})} style={{ fontSize: 13, color: '#C8102E', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 600, textDecoration: 'underline' }}>
                  {resetLabel[lang] || resetLabel.fr}
                </button>
              )}
            </div>

            {loading ? (
              <Loader text={lang === 'fr' ? 'Chargement des véhicules...' : lang === 'en' ? 'Loading vehicles...' : lang === 'de' ? 'Fahrzeuge werden geladen...' : 'جارٍ التحميل...'} />
            ) : cars.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ fontSize: 56, marginBottom: 16 }}>🔍</p>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, color: '#fff', marginBottom: 10 }}>{noResults[lang] || noResults.fr}</h3>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>{tryOther[lang] || tryOther.fr}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
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
