export const CATEGORIES = ['Berline', 'SUV', 'Citadine', 'Break', 'Coupe', 'Cabriolet', 'Utilitaire'];

export const CAT_LABELS = {
  fr: { Berline: 'Berline', SUV: 'SUV', Citadine: 'Citadine', Break: 'Break', Coupe: 'Coupé', Cabriolet: 'Cabriolet', Utilitaire: 'Utilitaire' },
  en: { Berline: 'Saloon', SUV: 'SUV', Citadine: 'City Car', Break: 'Estate', Coupe: 'Coupé', Cabriolet: 'Convertible', Utilitaire: 'Van' },
  de: { Berline: 'Limousine', SUV: 'SUV', Citadine: 'Kleinwagen', Break: 'Kombi', Coupe: 'Coupé', Cabriolet: 'Cabrio', Utilitaire: 'Nutzfahrzeug' },
  ar: { Berline: 'سيدان', SUV: 'دفع رباعي', Citadine: 'مدينة', Break: 'عائلية', Coupe: 'كوبيه', Cabriolet: 'كابريوليه', Utilitaire: 'تجاري' },
  es: { Berline: 'Berlina', SUV: 'SUV', Citadine: 'Utilitario', Break: 'Familiar', Coupe: 'Cupé', Cabriolet: 'Descapotable', Utilitaire: 'Furgoneta' },
  it: { Berline: 'Berlina', SUV: 'SUV', Citadine: 'Utilitaria', Break: 'Station wagon', Coupe: 'Coupé', Cabriolet: 'Cabriolet', Utilitaire: 'Furgone' },
  pt: { Berline: 'Sedan', SUV: 'SUV', Citadine: 'Utilitário', Break: 'Perua', Coupe: 'Coupé', Cabriolet: 'Conversível', Utilitaire: 'Furgão' },
};

export const CATEGORY_ICONS = {
  Berline: '🚗',
  SUV: '🚙',
  Citadine: '🏙️',
  Break: '🧳',
  Coupe: '🏎️',
  Cabriolet: '☀️',
  Utilitaire: '🚐',
};

export function getCategoryLabel(lang, category) {
  return (CAT_LABELS[lang] || CAT_LABELS.fr)[category] || category;
}
