import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLangStore } from '../store';

const LEGAL_PAGES = {
  '/mentions-legales': {
    fr: { title: 'Mentions Légales', content: `
<h2>Éditeur du site</h2>
<p><strong>Auto Kompetenz GmbH</strong><br/>
Neuenkirchener Str. 127<br/>
48282 Emsdetten, Allemagne<br/>
WhatsApp : +49 157 888 232 74<br/>
Email : autoKompetenz@gmail.com</p>

<h2>Forme juridique</h2>
<p>Gesellschaft mit beschränkter Haftung (GmbH) — société à responsabilité limitée de droit allemand.</p>

<h2>Registre du commerce</h2>
<p>Inscrite au registre du commerce (Handelsregister) du tribunal d'Osnabrück.</p>

<h2>Numéro d'identification fiscale</h2>
<p>Numéro TVA intracommunautaire disponible sur demande.</p>

<h2>Responsable de la publication</h2>
<p>Le gérant de la société Auto Kompetenz GmbH.</p>

<h2>Hébergement</h2>
<p>Ce site est hébergé par <strong>Vercel Inc.</strong>, 340 Pine Street, Suite 701, San Francisco, CA 94104, USA.<br/>
La base de données est hébergée par <strong>Supabase</strong>, Supabase Inc., 970 Toa Payoh North, Singapore.</p>

<h2>Propriété intellectuelle</h2>
<p>L'ensemble du contenu de ce site (textes, images, logos, structure) est la propriété exclusive d'Auto Kompetenz GmbH ou de ses partenaires. Toute reproduction, distribution ou utilisation sans autorisation écrite préalable est strictement interdite.</p>

<h2>Limitation de responsabilité</h2>
<p>Auto Kompetenz GmbH s'efforce de maintenir les informations de ce site à jour et exactes. Cependant, nous ne garantissons pas l'exhaustivité ou l'exactitude des informations. Auto Kompetenz GmbH ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation de ce site.</p>

<h2>Droit applicable</h2>
<p>Ce site est soumis au droit allemand (Telemediengesetz — TMG). Tout litige sera soumis à la juridiction compétente d'Allemagne.</p>` },
    en: { title: 'Legal Notice', content: `
<h2>Publisher</h2>
<p><strong>Auto Kompetenz GmbH</strong><br/>
Neuenkirchener Str. 127<br/>
48282 Emsdetten, Germany<br/>
WhatsApp: +49 157 888 232 74<br/>
Email: autoKompetenz@gmail.com</p>

<h2>Legal Form</h2>
<p>Gesellschaft mit beschränkter Haftung (GmbH) — German private limited company.</p>

<h2>Hosting</h2>
<p>This site is hosted by <strong>Vercel Inc.</strong>, 340 Pine Street, Suite 701, San Francisco, CA 94104, USA.<br/>
The database is hosted by <strong>Supabase</strong>, Supabase Inc., Singapore.</p>

<h2>Intellectual Property</h2>
<p>All content on this site is the exclusive property of Auto Kompetenz GmbH. Any reproduction without prior written permission is strictly prohibited.</p>

<h2>Applicable Law</h2>
<p>This site is governed by German law (Telemediengesetz — TMG).</p>` },
    de: { title: 'Impressum', content: `
<h2>Angaben gemäß § 5 TMG</h2>
<p><strong>Auto Kompetenz GmbH</strong><br/>
Neuenkirchener Str. 127<br/>
48282 Emsdetten, Deutschland<br/>
WhatsApp: +49 157 888 232 74<br/>
E-Mail: autoKompetenz@gmail.com</p>

<h2>Rechtsform</h2>
<p>Gesellschaft mit beschränkter Haftung (GmbH)</p>

<h2>Hosting</h2>
<p>Dieses Angebot wird gehostet bei <strong>Vercel Inc.</strong>, San Francisco, USA.<br/>
Datenbank: <strong>Supabase</strong>, Supabase Inc., Singapur.</p>

<h2>Haftungsausschluss</h2>
<p>Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>

<h2>Urheberrecht</h2>
<p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.</p>` },
    ar: { title: 'الإشعار القانوني', content: `
<h2>الناشر</h2>
<p><strong>Auto Kompetenz GmbH</strong><br/>
Neuenkirchener Str. 127<br/>
48282 Emsdetten، ألمانيا<br/>
واتساب: 74232888 157 49+<br/>
البريد الإلكتروني: autoKompetenz@gmail.com</p>

<h2>الاستضافة</h2>
<p>هذا الموقع مستضاف من قبل <strong>Vercel Inc.</strong>، سان فرانسيسكو، الولايات المتحدة الأمريكية.<br/>
قاعدة البيانات مستضافة من قبل <strong>Supabase</strong>، سنغافورة.</p>

<h2>الملكية الفكرية</h2>
<p>جميع محتويات هذا الموقع ملك حصري لـ Auto Kompetenz GmbH. يُحظر أي تكاثر دون إذن كتابي مسبق.</p>` },
  },

  '/politique-confidentialite': {
    fr: { title: 'Politique de Confidentialité', content: `
<p><em>Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</em></p>

<h2>1. Responsable du traitement</h2>
<p>Auto Kompetenz GmbH, Neuenkirchener Str. 127, 48282 Emsdetten, Allemagne.<br/>
Contact : autoKompetenz@gmail.com</p>

<h2>2. Données collectées</h2>
<p>Nous collectons les données suivantes :</p>
<ul>
<li><strong>Données d'identification</strong> : nom, prénom, nom d'utilisateur</li>
<li><strong>Données de contact</strong> : adresse email, numéro de téléphone, adresse postale</li>
<li><strong>Données financières</strong> : salaire mensuel (pour la simulation de financement)</li>
<li><strong>Données de navigation</strong> : adresse IP, type de navigateur, pages visitées</li>
<li><strong>Données de commande</strong> : historique des achats, préférences de paiement</li>
</ul>

<h2>3. Finalités du traitement</h2>
<ul>
<li>Gestion des comptes utilisateurs et authentification</li>
<li>Traitement des commandes et du suivi</li>
<li>Simulation de financement personnalisée</li>
<li>Communication (emails de confirmation, notifications)</li>
<li>Amélioration de nos services</li>
<li>Respect de nos obligations légales</li>
</ul>

<h2>4. Base légale du traitement</h2>
<ul>
<li><strong>Exécution du contrat</strong> (Art. 6(1)(b) RGPD) : traitement des commandes</li>
<li><strong>Consentement</strong> (Art. 6(1)(a) RGPD) : cookies non essentiels, marketing</li>
<li><strong>Intérêt légitime</strong> (Art. 6(1)(f) RGPD) : sécurité, amélioration du service</li>
<li><strong>Obligation légale</strong> (Art. 6(1)(c) RGPD) : obligations comptables et fiscales</li>
</ul>

<h2>5. Durée de conservation</h2>
<ul>
<li>Données de compte : durée de la relation commerciale + 3 ans</li>
<li>Données de commande : 10 ans (obligations légales)</li>
<li>Cookies analytiques : 13 mois maximum</li>
</ul>

<h2>6. Transferts de données</h2>
<p>Vos données peuvent être transférées vers :</p>
<ul>
<li><strong>Vercel Inc.</strong> (USA) — hébergement du site web</li>
<li><strong>Supabase Inc.</strong> (USA/Singapore) — base de données</li>
</ul>
<p>Ces transferts sont encadrés par les clauses contractuelles types de la Commission européenne.</p>

<h2>7. Vos droits (RGPD)</h2>
<p>Conformément au RGPD, vous disposez des droits suivants :</p>
<ul>
<li><strong>Droit d'accès</strong> — obtenir une copie de vos données</li>
<li><strong>Droit de rectification</strong> — corriger des données inexactes</li>
<li><strong>Droit à l'effacement</strong> — demander la suppression de vos données</li>
<li><strong>Droit à la portabilité</strong> — recevoir vos données dans un format lisible</li>
<li><strong>Droit d'opposition</strong> — vous opposer au traitement</li>
<li><strong>Droit à la limitation</strong> — restreindre le traitement</li>
</ul>
<p>Pour exercer ces droits : <strong>autoKompetenz@gmail.com</strong><br/>
Vous pouvez également vous plaindre auprès de l'autorité de contrôle allemande (BfDI).</p>

<h2>8. Sécurité</h2>
<p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
<ul>
<li>Chiffrement des mots de passe (bcrypt, coût 12)</li>
<li>Authentification par JWT avec expiration</li>
<li>Connexions sécurisées (HTTPS/TLS)</li>
<li>Accès restreint aux données personnelles</li>
</ul>

<h2>9. Cookies</h2>
<p>Voir notre <a href="/cookies" style="color:#C8102E">Politique de cookies</a> pour plus de détails.</p>

<h2>10. Modifications</h2>
<p>Nous nous réservons le droit de modifier cette politique. Toute modification sera notifiée par email ou via le site.</p>` },
    en: { title: 'Privacy Policy', content: `
<p><em>Last updated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</em></p>
<h2>1. Data Controller</h2>
<p>Auto Kompetenz GmbH, Neuenkirchener Str. 127, 48282 Emsdetten, Germany.<br/>Contact: autoKompetenz@gmail.com</p>
<h2>2. Data Collected</h2>
<ul><li>Identity data: name, username</li><li>Contact data: email, phone, address</li><li>Financial data: monthly salary (for financing simulation)</li><li>Order data: purchase history</li></ul>
<h2>3. Legal Basis (GDPR)</h2>
<ul><li>Contract performance (Art. 6(1)(b))</li><li>Consent (Art. 6(1)(a))</li><li>Legitimate interest (Art. 6(1)(f))</li></ul>
<h2>4. Your Rights</h2>
<p>Under GDPR you have rights to access, rectify, erase, port, object and restrict processing. Contact: autoKompetenz@gmail.com</p>
<h2>5. Hosting</h2>
<p>Vercel Inc. (USA) and Supabase Inc. (Singapore). Transfers covered by EU Standard Contractual Clauses.</p>` },
    de: { title: 'Datenschutzerklärung', content: `
<p><em>Stand: ${new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}</em></p>
<h2>1. Verantwortlicher</h2>
<p>Auto Kompetenz GmbH, Neuenkirchener Str. 127, 48282 Emsdetten.<br/>E-Mail: autoKompetenz@gmail.com</p>
<h2>2. Erhobene Daten</h2>
<ul><li>Identifikationsdaten: Name, Benutzername</li><li>Kontaktdaten: E-Mail, Telefon, Adresse</li><li>Bestelldaten: Kaufhistorie, Zahlungsart</li></ul>
<h2>3. Rechtsgrundlage (DSGVO)</h2>
<ul><li>Vertragserfüllung (Art. 6 Abs. 1 lit. b)</li><li>Einwilligung (Art. 6 Abs. 1 lit. a)</li><li>Berechtigtes Interesse (Art. 6 Abs. 1 lit. f)</li></ul>
<h2>4. Ihre Rechte</h2>
<p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch. Kontakt: autoKompetenz@gmail.com</p>
<h2>5. Hosting</h2>
<p>Vercel Inc. (USA) und Supabase Inc. (Singapur). Übermittlungen erfolgen auf Basis der EU-Standardvertragsklauseln.</p>` },
    ar: { title: 'سياسة الخصوصية', content: `
<h2>1. المتحكم في البيانات</h2>
<p>Auto Kompetenz GmbH، Neuenkirchener Str. 127، 48282 Emsdetten، ألمانيا.<br/>البريد الإلكتروني: autoKompetenz@gmail.com</p>
<h2>2. البيانات المجمعة</h2>
<p>نجمع: بيانات الهوية، بيانات الاتصال، بيانات الطلبات، وبيانات التصفح.</p>
<h2>3. حقوقك</h2>
<p>وفقاً للائحة GDPR، يحق لك الوصول إلى بياناتك وتصحيحها وحذفها. تواصل معنا: autoKompetenz@gmail.com</p>` },
  },

  '/cgv': {
    fr: { title: 'Conditions Générales de Vente', content: `
<p><em>Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</em></p>

<h2>Article 1 — Objet</h2>
<p>Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Auto Kompetenz GmbH (ci-après "le Vendeur") et tout acheteur (ci-après "le Client") effectuant un achat via le site web autokompetenz.com.</p>

<h2>Article 2 — Produits et services</h2>
<p>Le Vendeur propose à la vente des véhicules automobiles neufs et d'occasion, ainsi que des services d'entretien et de réparation automobile. Les caractéristiques essentielles de chaque véhicule sont présentées sur les fiches produit correspondantes.</p>

<h2>Article 3 — Prix</h2>
<p>Les prix sont indiqués en Euros (€) TTC. Le Vendeur se réserve le droit de modifier ses prix à tout moment, les prix applicables étant ceux en vigueur au moment de la commande.</p>

<h2>Article 4 — Modalités de paiement</h2>
<p>Trois formules sont disponibles :</p>
<ul>
<li><strong>Paiement intégral</strong> : Règlement du montant total avec une remise de 5%</li>
<li><strong>Acompte 25%</strong> : Versement d'un acompte de 25% du prix total à la commande, le solde à la livraison</li>
<li><strong>Mensualités</strong> : Paiement en 60 mensualités à un taux d'intérêt de 6% par an (formule PMT)</li>
</ul>

<h2>Article 5 — Commande</h2>
<p>La commande est réputée ferme et définitive après confirmation par email de la part du Vendeur. Le Client reçoit un numéro de bon de commande (format AKxxxxxxxx) lui permettant de suivre sa commande.</p>

<h2>Article 6 — Livraison</h2>
<p>Les délais de livraison sont indiqués à titre indicatif. Le Vendeur s'engage à informer le Client de tout retard. La livraison est effectuée à l'adresse indiquée lors de la commande.</p>

<h2>Article 7 — Droit de rétractation</h2>
<p>Conformément à la directive européenne 2011/83/UE et à la législation allemande (§ 312g BGB), le Client dispose d'un droit de rétractation de 14 jours à compter de la réception du véhicule, sous réserve que le véhicule soit retourné dans son état d'origine.</p>

<h2>Article 8 — Garantie</h2>
<p>Tous les véhicules vendus bénéficient de la garantie légale de conformité (2 ans) et de la garantie contre les vices cachés prévues par le droit allemand (BGB §§ 434-445).</p>

<h2>Article 9 — Responsabilité</h2>
<p>La responsabilité du Vendeur ne saurait être engagée en cas de force majeure ou d'événement indépendant de sa volonté. Le Vendeur n'est pas responsable des dommages indirects ou immatériels.</p>

<h2>Article 10 — Droit applicable et juridiction</h2>
<p>Les présentes CGV sont soumises au droit allemand. Tout litige relèvera de la compétence exclusive des tribunaux d'Osnabrück, Allemagne.</p>

<h2>Article 11 — Médiation</h2>
<p>En cas de litige, le Client peut recourir gratuitement à la plateforme européenne de règlement en ligne des litiges : <a href="https://ec.europa.eu/consumers/odr" style="color:#C8102E" target="_blank">ec.europa.eu/consumers/odr</a></p>` },
    en: { title: 'Terms and Conditions', content: `
<h2>Article 1 — Subject</h2>
<p>These Terms and Conditions govern the contractual relationship between Auto Kompetenz GmbH ("Seller") and any buyer ("Customer") purchasing through this website.</p>
<h2>Article 2 — Prices</h2>
<p>All prices are in Euros (€) including applicable taxes. The Seller reserves the right to modify prices at any time.</p>
<h2>Article 3 — Payment</h2>
<ul><li><strong>Full payment</strong>: 5% discount applied</li><li><strong>25% deposit</strong>: 25% upfront, balance on delivery</li><li><strong>Monthly payments</strong>: 60 instalments at 6% annual rate</li></ul>
<h2>Article 4 — Right of Withdrawal</h2>
<p>Under EU Directive 2011/83/EU, customers have 14 days to withdraw from the purchase.</p>
<h2>Article 5 — Applicable Law</h2>
<p>These Terms are governed by German law. Disputes shall be submitted to the courts of Osnabrück, Germany.</p>` },
    de: { title: 'Allgemeine Geschäftsbedingungen (AGB)', content: `
<h2>§ 1 Geltungsbereich</h2>
<p>Diese AGB gelten für alle Verträge zwischen Auto Kompetenz GmbH ("Verkäufer") und dem Kunden.</p>
<h2>§ 2 Preise</h2>
<p>Alle Preise in Euro (€) inkl. gesetzlicher MwSt.</p>
<h2>§ 3 Zahlungsbedingungen</h2>
<ul><li><strong>Vollzahlung</strong>: 5% Sofortrabatt</li><li><strong>Anzahlung 25%</strong>: 25% bei Bestellung, Rest bei Lieferung</li><li><strong>Ratenzahlung</strong>: 60 Monate, 6% p.a.</li></ul>
<h2>§ 4 Widerrufsrecht</h2>
<p>Gemäß § 312g BGB haben Verbraucher ein 14-tägiges Widerrufsrecht.</p>
<h2>§ 5 Gerichtsstand</h2>
<p>Es gilt deutsches Recht. Gerichtsstand ist Osnabrück.</p>` },
    ar: { title: 'الشروط العامة للبيع', content: `
<h2>المادة 1 — الموضوع</h2>
<p>تحكم هذه الشروط العلاقة التعاقدية بين Auto Kompetenz GmbH والعميل.</p>
<h2>المادة 2 — الأسعار</h2>
<p>جميع الأسعار باليورو (€) شاملة الضرائب.</p>
<h2>المادة 3 — الدفع</h2>
<ul><li>الدفع الكامل: خصم 5%</li><li>دفعة أولى 25%</li><li>أقساط شهرية: 60 شهراً بمعدل 6% سنوياً</li></ul>
<h2>المادة 4 — القانون المطبق</h2>
<p>تخضع هذه الشروط للقانون الألماني.</p>` },
  },

  '/cookies': {
    fr: { title: 'Politique de Cookies', content: `
<p><em>Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</em></p>

<h2>Qu'est-ce qu'un cookie ?</h2>
<p>Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d'un site web. Les cookies permettent au site de mémoriser vos préférences et d'améliorer votre expérience de navigation.</p>

<h2>Cookies que nous utilisons</h2>

<h3>Cookies strictement nécessaires</h3>
<p>Ces cookies sont indispensables au fonctionnement du site. Ils ne peuvent pas être désactivés.</p>
<ul>
<li><code>ak_token</code> — Token d'authentification JWT (session, sécurisé)</li>
<li><code>ak_user</code> — Données utilisateur en cache (session)</li>
<li><code>ak_lang</code> — Préférence de langue (1 an)</li>
<li><code>ak_cookies</code> — Mémorisation du consentement aux cookies (1 an)</li>
</ul>

<h3>Cookies de performance (avec consentement)</h3>
<p>Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site.</p>
<ul>
<li>Données de navigation anonymisées</li>
<li>Pages visitées, durée de visite</li>
</ul>

<h2>Gestion des cookies</h2>
<p>Vous pouvez gérer vos préférences de cookies via :</p>
<ul>
<li>La bannière de cookies présente lors de votre première visite</li>
<li>Les paramètres de votre navigateur</li>
</ul>

<h2>Durée de conservation</h2>
<ul>
<li>Cookies de session : supprimés à la fermeture du navigateur</li>
<li>Cookies persistants : maximum 13 mois</li>
</ul>

<h2>Vos droits</h2>
<p>Pour tout exercice de vos droits relatifs aux cookies : <strong>autoKompetenz@gmail.com</strong></p>` },
    en: { title: 'Cookie Policy', content: `
<h2>What is a cookie?</h2>
<p>A cookie is a small text file placed on your device when you visit a website.</p>
<h2>Cookies we use</h2>
<h3>Strictly Necessary</h3>
<ul><li><code>ak_token</code> — JWT authentication token</li><li><code>ak_user</code> — Cached user data</li><li><code>ak_lang</code> — Language preference</li><li><code>ak_cookies</code> — Cookie consent memory</li></ul>
<h2>Managing cookies</h2>
<p>You can manage cookies through the banner on first visit or via your browser settings.</p>
<h2>Contact</h2>
<p>autoKompetenz@gmail.com</p>` },
    de: { title: 'Cookie-Richtlinie', content: `
<h2>Was sind Cookies?</h2>
<p>Cookies sind kleine Textdateien, die beim Besuch einer Website auf Ihrem Gerät gespeichert werden.</p>
<h2>Von uns verwendete Cookies</h2>
<ul><li><code>ak_token</code> — JWT-Authentifizierungstoken</li><li><code>ak_user</code> — Gecachte Benutzerdaten</li><li><code>ak_lang</code> — Spracheinstellung</li><li><code>ak_cookies</code> — Cookie-Zustimmung</li></ul>
<h2>Cookie-Verwaltung</h2>
<p>Sie können Cookies über das Banner beim ersten Besuch oder über Ihre Browsereinstellungen verwalten.</p>` },
    ar: { title: 'سياسة ملفات تعريف الارتباط', content: `
<h2>ما هي ملفات تعريف الارتباط؟</h2>
<p>ملف تعريف الارتباط هو ملف نصي صغير يُودَع على جهازك عند زيارة موقع ويب.</p>
<h2>ملفات تعريف الارتباط التي نستخدمها</h2>
<ul><li><code>ak_token</code> — رمز المصادقة JWT</li><li><code>ak_lang</code> — تفضيل اللغة</li><li><code>ak_cookies</code> — موافقة ملفات تعريف الارتباط</li></ul>
<h2>إدارة ملفات تعريف الارتباط</h2>
<p>يمكنك إدارة ملفات تعريف الارتباط من خلال اللافتة عند أول زيارة أو عبر إعدادات متصفحك.</p>` },
  },
};

export default function Legal() {
  const { lang } = useLangStore();
  const location = useLocation();
  const page = LEGAL_PAGES[location.pathname];

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  if (!page) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 80, fontWeight: 900, color: '#C8102E' }}>404</p>
        <Link to="/" className="btn-gold" style={{ marginTop: 20 }}>Accueil</Link>
      </div>
    </div>
  );

  const content = page[lang] || page['fr'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', paddingTop: 100 }}>
      {/* Header */}
      <div style={{ padding: '60px 6% 50px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'var(--dark)' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#8A8A90', textDecoration: 'none', marginBottom: 24, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
          ← {lang === 'fr' ? 'Retour' : lang === 'en' ? 'Back' : lang === 'de' ? 'Zurück' : 'رجوع'}
        </Link>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(36px,5vw,68px)', color: '#fff', letterSpacing: '-0.02em' }}>
          {content.title}
        </h1>
        <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
          {Object.keys(LEGAL_PAGES[location.pathname]).map(l => {
            const LANG_LABELS = { fr: '🇫🇷 FR', en: '🇬🇧 EN', de: '🇩🇪 DE', ar: '🇸🇦 AR' };
            return (
              <button key={l} onClick={() => useLangStore.getState().setLang(l)}
                style={{ padding: '6px 14px', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", border: `1px solid ${l === lang ? '#C8102E' : 'rgba(255,255,255,0.1)'}`, background: l === lang ? 'rgba(200,16,46,0.12)' : 'transparent', color: l === lang ? '#C8102E' : '#8A8A90' }}>
                {LANG_LABELS[l]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '60px 6%' }}>
        <div dangerouslySetInnerHTML={{ __html: content.content }} style={{
          color: 'rgba(255,255,255,0.6)', fontSize: 17, lineHeight: 1.8,
        }} />
      </div>

      <style>{`
        .legal-content h1, .legal-content h2, .legal-content h3 { color: #fff; margin: 32px 0 16px; font-family: 'Outfit', sans-serif; }
        div[dangerouslySetInnerHTML] h2 { color: #fff; font-size: 22px; font-weight: 800; margin: 36px 0 14px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        div[dangerouslySetInnerHTML] h3 { color: rgba(255,255,255,0.8); font-size: 18px; font-weight: 700; margin: 24px 0 10px; }
        div[dangerouslySetInnerHTML] p { margin-bottom: 16px; }
        div[dangerouslySetInnerHTML] ul { padding-left: 24px; margin-bottom: 16px; }
        div[dangerouslySetInnerHTML] li { margin-bottom: 8px; }
        div[dangerouslySetInnerHTML] strong { color: #fff; }
        div[dangerouslySetInnerHTML] em { color: #8A8A90; }
        div[dangerouslySetInnerHTML] code { background: rgba(200,16,46,0.1); color: #C8102E; padding: 2px 8px; border-radius: 4px; font-size: 14px; }
        div[dangerouslySetInnerHTML] a { color: #C8102E; }
      `}</style>
    </div>
  );
}
