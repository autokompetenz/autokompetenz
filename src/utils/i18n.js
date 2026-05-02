// ─── Translation System ────────────────────────────────────────────────────
export const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
  { code: 'ar', label: 'عربي',     flag: '🇸🇦', rtl: true },
];

export const translations = {
  // ── Navigation ──
  nav_vehicles:    { fr: 'Véhicules',          en: 'Vehicles',         de: 'Fahrzeuge',       ar: 'السيارات' },
  nav_financing:   { fr: 'Financement',         en: 'Financing',        de: 'Finanzierung',    ar: 'التمويل' },
  nav_track:       { fr: 'Suivi commande',      en: 'Track Order',      de: 'Bestellung',      ar: 'تتبع الطلب' },
  nav_contact:     { fr: 'Contact',             en: 'Contact',          de: 'Kontakt',         ar: 'اتصل بنا' },
  nav_login:       { fr: 'Connexion',           en: 'Login',            de: 'Anmelden',        ar: 'تسجيل الدخول' },
  nav_register:    { fr: "S'inscrire",          en: 'Register',         de: 'Registrieren',    ar: 'تسجيل' },
  nav_cart:        { fr: 'Panier',              en: 'Cart',             de: 'Warenkorb',       ar: 'السلة' },
  nav_dashboard:   { fr: 'Mon Espace',          en: 'My Account',       de: 'Mein Bereich',    ar: 'حسابي' },
  nav_orders:      { fr: 'Mes Commandes',       en: 'My Orders',        de: 'Bestellungen',    ar: 'طلباتي' },
  nav_profile:     { fr: 'Mon Profil',          en: 'My Profile',       de: 'Mein Profil',     ar: 'ملفي' },
  nav_admin:       { fr: 'Administration',      en: 'Administration',   de: 'Administration',  ar: 'الإدارة' },
  nav_logout:      { fr: 'Déconnexion',         en: 'Logout',           de: 'Abmelden',        ar: 'تسجيل الخروج' },

  // ── Hero ──
  hero_badge:      { fr: 'Votre spécialiste automobile à Emsdetten', en: 'Your automotive specialist in Emsdetten', de: 'Ihr Fahrzeugspezialist in Emsdetten', ar: 'متخصصكم في السيارات في إمسديتن' },
  hero_title1:     { fr: 'Auto',                en: 'Auto',             de: 'Auto',            ar: 'أوتو' },
  hero_title2:     { fr: 'Kompetenz',           en: 'Kompetenz',        de: 'Kompetenz',       ar: 'كومبيتنز' },
  hero_title3:     { fr: 'GmbH',                en: 'GmbH',             de: 'GmbH',            ar: 'GmbH' },
  hero_subtitle:   { fr: 'Réparation, entretien et diagnostic automobiles — honnête, transparent et fiable. Votre véhicule est entre de bonnes mains.', en: 'Professional car repair, servicing and diagnostics — honest, transparent and reliable. Your vehicle is in the best hands.', de: 'Professionelle Kfz-Reparatur, Wartung und Diagnose — fair, transparent, zuverlässig.', ar: 'إصلاح وصيانة وتشخيص احترافي للسيارات — صادق وشفاف وموثوق.' },
  hero_cta1:       { fr: 'Prendre RDV via WhatsApp', en: 'Book via WhatsApp', de: 'Termin via WhatsApp', ar: 'حجز عبر واتساب' },
  hero_cta2:       { fr: 'Nos services',        en: 'Our Services',     de: 'Unsere Leistungen', ar: 'خدماتنا' },
  hero_stat1:      { fr: "Années d'expérience", en: 'Years Experience',  de: 'Jahre Erfahrung', ar: 'سنوات خبرة' },
  hero_stat2:      { fr: 'Note Google',         en: 'Google Rating',    de: 'Google Bewertung', ar: 'تقييم جوجل' },
  hero_stat3:      { fr: 'Satisfaction garantie', en: 'Satisfaction Guarantee', de: 'Zufriedenheitsgarantie', ar: 'ضمان الرضا' },

  // ── Services ──
  services_label:  { fr: 'Nos Services',        en: 'Our Services',     de: 'Leistungen',      ar: 'خدماتنا' },
  services_title:  { fr: 'Ce que nous\nfaisons pour vous', en: 'What we do\nfor you', de: 'Was wir für\nSie tun', ar: 'ما نقدمه\nلكم' },
  services_sub:    { fr: 'De la vidange au moteur, votre partenaire pour toutes marques.', en: 'From oil changes to engine work, your partner for all makes.', de: 'Vom Ölwechsel bis zur Motorrevision — für alle Marken.', ar: 'من تغيير الزيت إلى المحرك، شريككم لجميع الماركات.' },

  // ── Reviews ──
  reviews_label:   { fr: 'Avis Clients',        en: 'Customer Reviews',  de: 'Kundenstimmen',   ar: 'آراء العملاء' },
  reviews_title:   { fr: 'Ce que disent\nnos clients', en: 'What our\ncustomers say', de: 'Was unsere Kunden\nsagen', ar: 'ما يقوله\nعملاؤنا' },
  verified:        { fr: 'Vérifié',             en: 'Verified',          de: 'Verifiziert',     ar: 'موثق' },

  // ── Contact ──
  contact_label:   { fr: 'Contact',             en: 'Contact',           de: 'Kontakt',         ar: 'تواصل معنا' },
  contact_title:   { fr: 'Parlons-nous',        en: "Let's Talk",        de: 'Sprechen Sie\nuns an', ar: 'لنتحدث' },
  contact_hours:   { fr: 'Horaires',            en: 'Opening Hours',     de: 'Öffnungszeiten',  ar: 'أوقات العمل' },
  contact_appt:    { fr: 'Prendre rendez-vous', en: 'Book Appointment',  de: 'Termin vereinbaren', ar: 'حجز موعد' },
  mon_fri:         { fr: 'Lundi – Vendredi',    en: 'Monday – Friday',   de: 'Montag – Freitag', ar: 'الإثنين – الجمعة' },
  saturday:        { fr: 'Samedi',              en: 'Saturday',          de: 'Samstag',         ar: 'السبت' },
  sunday:          { fr: 'Dimanche',            en: 'Sunday',            de: 'Sonntag',         ar: 'الأحد' },
  closed:          { fr: 'Fermé',               en: 'Closed',            de: 'Geschlossen',     ar: 'مغلق' },

  // ── Cart / Orders ──
  add_to_cart:     { fr: 'Ajouter au panier',   en: 'Add to Cart',       de: 'In den Warenkorb', ar: 'أضف إلى السلة' },
  out_of_stock:    { fr: 'Épuisé',              en: 'Out of Stock',      de: 'Ausverkauft',     ar: 'نفد المخزون' },
  view_vehicle:    { fr: 'Voir le véhicule',    en: 'View Vehicle',      de: 'Fahrzeug ansehen', ar: 'عرض السيارة' },
  in_stock:        { fr: 'en stock',            en: 'in stock',          de: 'auf Lager',       ar: 'في المخزون' },
  payment_full:    { fr: 'Paiement intégral',   en: 'Full Payment',      de: 'Vollzahlung',     ar: 'الدفع الكامل' },
  payment_deposit: { fr: 'Acompte 25%',         en: '25% Deposit',       de: 'Anzahlung 25%',   ar: 'دفعة أولى 25%' },
  payment_monthly: { fr: 'Mensualités',         en: 'Monthly Payments',  de: 'Ratenzahlung',    ar: 'الدفع الشهري' },
  discount_5:      { fr: '-5% de réduction',    en: '5% discount',       de: '-5% Rabatt',      ar: 'خصم 5%' },
  months_60:       { fr: '60 mois',             en: '60 months',         de: '60 Monate',       ar: '60 شهراً' },

  // ── Statuses ──
  status_pending:   { fr: 'En attente',         en: 'Pending',           de: 'Ausstehend',      ar: 'قيد الانتظار' },
  status_confirmed: { fr: 'Confirmée',          en: 'Confirmed',         de: 'Bestätigt',       ar: 'مؤكد' },
  status_processing:{ fr: 'En traitement',      en: 'Processing',        de: 'In Bearbeitung',  ar: 'قيد المعالجة' },
  status_shipped:   { fr: 'Expédiée',           en: 'Shipped',           de: 'Versandt',        ar: 'تم الشحن' },
  status_delivered: { fr: 'Livrée',             en: 'Delivered',         de: 'Geliefert',       ar: 'تم التسليم' },
  status_cancelled: { fr: 'Annulée',            en: 'Cancelled',         de: 'Storniert',       ar: 'ملغي' },

  // ── Misc ──
  whatsapp_btn:    { fr: 'WhatsApp',            en: 'WhatsApp',          de: 'WhatsApp',        ar: 'واتساب' },
  per_month:       { fr: '/mois',               en: '/month',            de: '/Monat',          ar: '/شهر' },
  or:              { fr: 'ou',                  en: 'or',                de: 'oder',            ar: 'أو' },
  track_order:     { fr: 'Suivre ma commande',  en: 'Track my order',    de: 'Bestellung verfolgen', ar: 'تتبع طلبي' },
  see_all:         { fr: 'Voir tout',           en: 'See all',           de: 'Alle anzeigen',   ar: 'عرض الكل' },
  go_back:         { fr: 'Retour',              en: 'Back',              de: 'Zurück',          ar: 'رجوع' },
  save:            { fr: 'Enregistrer',         en: 'Save',              de: 'Speichern',       ar: 'حفظ' },
  cancel:          { fr: 'Annuler',             en: 'Cancel',            de: 'Abbrechen',       ar: 'إلغاء' },
  loading:         { fr: 'Chargement...',       en: 'Loading...',        de: 'Wird geladen...', ar: 'جارٍ التحميل...' },
  welcome_back:    { fr: 'Bienvenue,',          en: 'Welcome back,',     de: 'Willkommen,',     ar: 'مرحباً,' },
  years_exp:       { fr: '+',                   en: '+',                 de: '+',               ar: '+' },
};

export function t(key, lang = 'fr') {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry['fr'] || key;
}
