import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useLangStore } from '../store';

export default function Warranty() {
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const l = lang || 'fr';

  const C = {
    bg: '#f5f5f5',
    card: '#ffffff',
    card2: '#ececec',
    border: 'rgba(0,0,0,0.1)',
    text: '#111111',
    text2: '#444444',
    text3: '#888888',
    red: '#C8102E',
    shadow: '0 4px 24px rgba(0,0,0,0.08)',
  };

  const coverageItems = [
    { 
      title: l==='fr'?'Moteur & boîte de vitesses':l==='en'?'Engine & Transmission':l==='de'?'Motor & Getriebe':l==='es'?'Motor y transmisión':l==='it'?'Motore e trasmissione':'Motor e transmissão',
      desc: l==='fr'?'Protection complète du groupe motopropulseur, y compris les pièces internes du moteur, la culasse, le bloc moteur, les pistons, les bielles, le vilebrequin et la boîte de vitesses.':l==='en'?'Complete powertrain protection including internal engine parts, cylinder head, engine block, pistons, connecting rods, crankshaft and transmission.':l==='de'?'Vollständiger Antriebsstrangschutz einschließlich interner Motorteile, Zylinderkopf, Motorblock, Kolben, Pleuel, Kurbelwelle und Getriebe.':l==='es'?'Protección completa del tren motriz, incluidas las piezas internas del motor, culata, bloque del motor, pistones, bielas, cigüeñal y transmisión.':l==='it'?'Protezione completa del powertrain inclusi i pezzi interni del motore, testata, blocco motore, pistoni, bielle, albero a gomiti e trasmissione.':l==='pt'?'Proteção completa do trem de força, incluindo peças internas do motor, cabeçote, bloco do motor, pistões, bielas, virabrequim e transmissão.',
      icon: '⚙️'
    },
    { 
      title: l==='fr'?'Système de refroidissement':l==='en'?'Cooling System':l==='de'?'Kühlsystem':l==='es'?'Sistema de refrigeración':l==='it'?'Sistema di raffreddamento':'Sistema de refrigeração',
      desc: l==='fr'?'Radiateur, pompe à eau, thermostat, durites, ventilateur de refroidissement et tous les composants du circuit de refroidissement.':l==='en'?'Radiator, water pump, thermostat, hoses, cooling fan and all cooling system components.':l==='de'?'Kühler, Wasserpumpe, Thermostat, Schläuche, Lüfter und alle Kühlsystemkomponenten.':l==='es'?'Radiador, bomba de agua, termostato, mangueras, ventilador de refrigeración y todos los componentes del sistema de refrigeración.':l==='it'?'Radiatore, pompa dell\'acqua, termostato, tubi, ventilatore di raffreddamento e tutti i componenti del sistema di raffreddamento.':l==='pt'?'Radiador, bomba de água, termostato, mangueiras, ventilador de refrigeração e todos os componentes do sistema de refrigeração.',
      icon: '❄️'
    },
    { 
      title: l==='fr'?'Direction & freinage':l==='en'?'Steering & Braking':l==='de'?'Lenkung & Bremsen':l==='es'?'Dirección y frenado':l==='it'?'Sterzo e frenatura':'Direção e frenagem',
      desc: l==='fr'?'Direction assistée, pompe de direction, colonne de direction, maître-cylindre, étriers de frein, plaquettes, disques et système ABS.':l==='en'?'Power steering, steering pump, steering column, master cylinder, brake calipers, pads, discs and ABS system.':l==='de'?'Servolenkung, Lenkpumpe, Lenksäule, Hauptbrezylinder, Bremssättel, Beläge, Scheiben und ABS-System.':l==='es'?'Dirección asistida, bomba de dirección, columna de dirección, cilindro maestro, pinzas de freno, pastillas, discos y sistema ABS.':l==='it'?'Servosterzo, pompa dello sterzo, colonna dello sterzo, cilindro principale, pinze freno, pastiglie, dischi e sistema ABS.':l==='pt'?'Direção assistida, bomba de direção, coluna de direção, cilindro mestre, pinças de freio, pastilhas, discos e sistema ABS.',
      icon: '🛞'
    },
    { 
      title: l==='fr'?'Électronique embarquée':l==='en'?'On-board Electronics':l==='de'?'Bordelektronik':l==='es'?'Electrónica a bordo':l==='it'?'Elettronica di bordo':'Eletrônica embarcada',
      desc: l==='fr'?'ECU, capteurs, calculateurs, système d\'injection, allumage électronique, tableau de bord et tous les modules électroniques.':l==='en'?'ECU, sensors, control units, injection system, electronic ignition, dashboard and all electronic modules.':l==='de'?'Steuergerät, Sensoren, Steuergeräte, Einspritzsystem, elektronische Zündung, Armaturenbrett und alle elektronischen Module.':l==='es'?'ECU, sensores, unidades de control, sistema de inyección, encendido electrónico, tablero y todos los módulos electrónicos.':l==='it'?'ECU, sensori, unità di controllo, sistema di iniezione, accensione elettronica, cruscotto e tutti i moduli elettronici.':l==='pt'?'ECU, sensores, unidades de controle, sistema de injeção, ignição eletrônica, painel e todos os módulos eletrônicos.',
      icon: '📟'
    },
    { 
      title: l==='fr'?'Climatisation':l==='en'?'Air Conditioning':l==='de'?'Klimaanlage':l==='es'?'Aire acondicionado':l==='it'?'Climatizzazione':'Ar condicionado',
      desc: l==='fr'?'Compresseur, condenseur, évaporateur, détendeur, système de chauffage et tous les composants du circuit de climatisation.':l==='en'?'Compressor, condenser, evaporator, expansion valve, heating system and all AC components.':l==='de'?'Kompressor, Kondensator, Verdampfer, Expansionsventil, Heizsystem und alle Klimaanlagenkomponenten.':l==='es'?'Compresor, condensador, evaporador, válvula de expansión, sistema de calefacción y todos los componentes del aire acondicionado.':l==='it'?'Compressore, condensatore, evaporatore, valvola di espansione, sistema di riscaldamento e tutti i componenti del climatizzatore.':l==='pt'?'Compressor, condensador, evaporador, válvula de expansão, sistema de aquecimento e todos os componentes do ar condicionado.',
      icon: '❄️'
    },
    { 
      title: l==='fr'?'Système électrique':l==='en'?'Electrical System':l==='de'?'Elektrisches System':l==='es'?'Sistema eléctrico':l==='it'?'Sistema elettrico':'Sistema elétrico',
      desc: l==='fr'?'Alternateur, démarreur, batterie, faisceau électrique, fusibles, relais et tous les composants électriques.':l==='en'?'Alternator, starter, battery, wiring harness, fuses, relays and all electrical components.':l==='de'?'Lichtmaschine, Anlasser, Batterie, Kabelbaum, Sicherungen, Relais und alle elektrischen Komponenten.':l==='es'?'Alternador, motor de arranque, batería, arnés de cables, fusibles, relés y todos los componentes eléctricos.':l==='it'?'Alternatore, motorino di avviamento, batteria, cablaggio, fusibili, relè e tutti i componenti elettrici.':l==='pt'?'Alternador, motor de partida, bateria, chicote elétrico, fusíveis, relés e todos os componentes elétricos.',
      icon: '⚡'
    },
  ];

  const extensionOptions = [
    {
      title: l==='fr'?'Extension 24 mois':l==='en'?'24-month Extension':l==='de'?'24 Monate Erweiterung':l==='es'?'Extensión 24 meses':l==='it'?'Estensione 24 mesi':'Extensão 24 meses',
      price: l==='fr'?'À partir de 299€':l==='en'?'From 299€':l==='de'?'Ab 299€':l==='es'?'Desde 299€':l==='it'?'Da 299€':'A partir de 299€',
      features: [
        l==='fr'?'✓ Couverture moteur et transmission':l==='en'?'✓ Engine and transmission coverage':l==='de'?'✓ Motor- und Getriebeschutz':l==='es'?'✓ Cobertura de motor y transmisión':l==='it'?'✓ Copertura motore e trasmissione':'✓ Cobertura de motor e transmissão',
        l==='fr'?'✓ Pièces et main-d\'œuvre':l==='en'?'✓ Parts and labor':l==='de'?'✓ Teile und Arbeitszeit':l==='es'?'✓ Piezas y mano de obra':l==='it'?'✓ Ricambi e manodopera':'✓ Peças e mão de obra',
        l==='fr'?'✓ Assistance dépannage':l==='en'?'✓ Breakdown assistance':l==='de'?'✓ Pannenhilfe':l==='es'?'✓ Asistencia de averías':l==='it'?'✓ Assistenza guasto':'✓ Assistência de pane',
      ]
    },
    {
      title: l==='fr'?'Extension 36 mois':l==='en'?'36-month Extension':l==='de'?'36 Monate Erweiterung':l==='es'?'Extensión 36 meses':l==='it'?'Estensione 36 mesi':'Extensão 36 meses',
      price: l==='fr'?'À partir de 499€':l==='en'?'From 499€':l==='de'?'Ab 499€':l==='es'?'Desde 499€':l==='it'?'Da 499€':'A partir de 499€',
      features: [
        l==='fr'?'✓ Couverture complète':l==='en'?'✓ Full coverage':l==='de'?'✓ Vollständige Abdeckung':l==='es'?'✓ Cobertura completa':l==='it'?'✓ Copertura completa':'✓ Cobertura completa',
        l==='fr'?'✓ Véhicule de remplacement':l==='en'?'✓ Replacement vehicle':l==='de'?'✓ Ersatzfahrzeug':l==='es'?'✓ Vehículo de reemplazo':l==='it'?'✓ Veicolo sostitutivo':'✓ Veículo substituto',
        l==='fr'?'✓ Assistance 24/7':l==='en'?'✓ 24/7 assistance':l==='de'?'✓ 24/7 Assistance':l==='es'?'✓ Asistencia 24/7':l==='it'?'✓ Assistenza 24/7':'✓ Assistência 24/7',
        l==='fr'?'✓ Garantie carrosserie':l==='en'?'✓ Body warranty':l==='de'?'✓ Karossergarantie':l==='es'?'✓ Garantía de carrocería':l==='it'?'✓ Garanzia carrozzeria':'✓ Garantia de carroceria',
      ]
    },
    {
      title: l==='fr'?'Premium Gold':l==='en'?'Premium Gold':l==='de'?'Premium Gold':l==='es'?'Premium Gold':l==='it'?'Premium Gold':'Premium Gold',
      price: l==='fr'?'À partir de 799€':l==='en'?'From 799€':l==='de'?'Ab 799€':l==='es'?'Desde 799€':l==='it'?'Da 799€':'A partir de 799€',
      features: [
        l==='fr'?'✓ Tous les avantages Premium':l==='en'?'✓ All Premium benefits':l==='de'?'✓ Alle Premium-Vorteile':l==='es'?'✓ Todos los beneficios Premium':l==='it'?'✓ Tutti i vantaggi Premium':'✓ Todos os benefícios Premium',
        l==='fr'?'✓ Kilométrage illimité':l==='en'?'✓ Unlimited mileage':l==='de'?'✓ Unbegrenzte Kilometer':l==='es'?'✓ Kilometraje ilimitado':l==='it'?'✓ Chilometraggio illimitato':'✓ Quilometragem ilimitado',
        l==='fr'?'✓ Hôtel en cas de panne':l==='en'?'✓ Hotel in case of breakdown':l==='de'?'✓ Hotel bei Panne':l==='es'?'✓ Hotel en caso de avería':l==='it'?'✓ Hotel in caso di guasto':'✓ Hotel em caso de pane',
        l==='fr'?'✓ Rapatriement véhicule':l==='en'?'✓ Vehicle repatriation':l==='de'?'✓ Fahrzeugrückführung':l==='es'?'✓ Repatriación del vehículo':l==='it'?'✓ Rimpatrio veicolo':'✓ Repatriação do veículo',
      ]
    },
  ];

  return (
    <div style={{ minHeight:'100vh', background:C.bg, paddingTop:76 }}>
      
      {/* Hero */}
      <section style={{ 
        position:'relative', 
        height: isMobile ? '60vh' : '70vh', 
        minHeight:500, 
        display:'flex', 
        alignItems:'center', 
        overflow:'hidden',
        background:'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
      }}>
        <motion.div 
          initial={{ opacity:0, scale:1.1 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ duration:1.2 }}
          style={{ 
            position:'absolute', 
            inset:0,
            backgroundImage:'url(https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1800&q=80)',
            backgroundSize:'cover',
            backgroundPosition:'center',
            opacity:0.3
          }}
        />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 100%)' }} />
        
        <motion.div 
          initial={{ opacity:0, y:40 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.8, delay:0.2 }}
          style={{ position:'relative', zIndex:2, padding: isMobile ? '0 5%' : '0 7%', maxWidth:900 }}
        >
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(200,16,46,0.2)', border:'1px solid rgba(200,16,46,0.4)', borderRadius:4, padding:'8px 18px', marginBottom:24 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#C8102E', display:'inline-block' }} />
            <span style={{ fontSize:12, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.9)' }}>
              {l==='fr'?'Protection':l==='en'?'Protection':l==='de'?'Schutz':l==='es'?'Protección':l==='it'?'Protezione':'Proteção'}
            </span>
          </div>
          <h1 style={{ 
            fontFamily:"'Outfit',sans-serif", 
            fontWeight:900, 
            fontSize: isMobile ? 'clamp(36px,8vw,64px)' : 'clamp(48px,6vw,88px)', 
            color:'#fff', 
            letterSpacing:'-0.03em', 
            lineHeight:1.1, 
            marginBottom:20 
          }}>
            {l==='fr'?'Garantie\nGerman Auto Cars':l==='en'?'German Auto Cars\nWarranty':l==='de'?'German Auto Cars\nGarantie':l==='es'?'Garantía\nGerman Auto Cars':l==='it'?'Garanzia\nGerman Auto Cars':'Garantia\nGerman Auto Cars'}
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18, color:'rgba(255,255,255,0.7)', lineHeight:1.7, maxWidth:600, marginBottom:32 }}>
            {l==='fr'?'Une protection complète pour votre véhicule avec des garanties étendues et une assistance 24/7. Roulez l\'esprit tranquille.':l==='en'?'Complete protection for your vehicle with extended warranties and 24/7 assistance. Drive with peace of mind.':l==='de'?'Umfassender Schutz für Ihr Fahrzeug mit erweiterten Garantien und 24/7 Assistance. Fahren Sie sorgenfrei.':l==='es'?'Protección completa para su vehículo con garantías extendidas y asistencia 24/7. Conduzca con tranquilidad.':l==='it'?'Protezione completa per il vostro veicolo con garanzie estese e assistenza 24/7. Guidate tranquilli.':l==='pt'?'Proteção completa para seu veículo com garantias estendidas e assistência 24/7. Dirija com tranquilidade.'}
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <Link to="/catalog" style={{ 
              background:'linear-gradient(135deg,#C8102E,#9B0B22)', 
              color:'#fff', 
              textDecoration:'none', 
              fontFamily:"'Outfit',sans-serif", 
              fontSize:14, 
              fontWeight:700, 
              padding:'14px 28px', 
              borderRadius:8, 
              display:'inline-flex', 
              alignItems:'center', 
              gap:8,
              boxShadow:'0 4px 16px rgba(200,16,46,0.4)'
            }}>
              {l==='fr'?'Voir les véhicules':l==='en'?'View vehicles':l==='de'?'Fahrzeuge ansehen':l==='es'?'Ver vehículos':l==='it'?'Vedi veicoli':'Ver veículos'} →
            </Link>
            <Link to="/insurance" style={{ 
              background:'rgba(255,255,255,0.1)', 
              color:'#fff', 
              textDecoration:'none', 
              fontFamily:"'Outfit',sans-serif", 
              fontSize:14, 
              fontWeight:700, 
              padding:'14px 28px', 
              borderRadius:8, 
              border:'1px solid rgba(255,255,255,0.3)',
              display:'inline-flex', 
              alignItems:'center', 
              gap:8
            }}>
              {l==='fr'?'Assurances':l==='en'?'Insurance':l==='de'?'Versicherung':l==='es'?'Seguros':l==='it'?'Assicurazione':'Seguros'}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Basic Warranty */}
      <section className="section-pad">
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <motion.div 
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6 }}
            style={{ textAlign:'center', marginBottom:48 }}
          >
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>
              {l==='fr'?'INCLUSE':l==='en'?'INCLUDED':l==='de'?'INKLUSIVE':l==='es'?'INCLUIDO':l==='it'?'INCLUSO':'INCLUÍDO'}
            </div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:C.text, letterSpacing:'-0.02em' }}>
              {l==='fr'?'Garantie Basique\nGerman Auto Cars':l==='en'?'German Auto Cars\nBasic Warranty':l==='de'?'German Auto Cars\nBasisgarantie':l==='es'?'Garantía Básica\nGerman Auto Cars':l==='it'?'Garanzia Base\nGerman Auto Cars':'Garantia Básica\nGerman Auto Cars'}
            </h2>
            <p style={{ fontSize:16, color:C.text3, marginTop:12, maxWidth:600, margin:'12px auto 0' }}>
              {l==='fr'?'Incluse dans toutes les commandes. Valable 12 mois ou 10 000 km (première échéance atteinte).':l==='en'?'Included in all orders. Valid 12 months or 10,000 km (first threshold reached).':l==='de'?'In allen Bestellungen enthalten. Gültig 12 Monate oder 10.000 km (erste Schwelle erreicht).':l==='es'?'Incluida en todos los pedidos. Válida 12 meses o 10.000 km (primer umbral alcanzado).':l==='it'?'Inclusa in tutti gli ordini. Valida 12 mesi o 10.000 km (prima soglia raggiunta).':'Incluída em todos os pedidos. Válida 12 meses ou 10.000 km (primeiro limite atingido).'}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6, delay:0.1 }}
            style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding: isMobile ? 32 : 48, marginBottom:48, boxShadow:C.shadow }}
          >
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:24, marginBottom:32 }}>
              {[
                { value:'12', label:l==='fr'?'MOIS':l==='en'?'MONTHS':l==='de'?'MONATE':l==='es'?'MESES':l==='it'?'MESI':'MESES', icon:'📅' },
                { value:'10 000', label:l==='fr'?'KM':l==='en'?'KM':l==='de'?'KM':l==='es'?'KM':l==='it'?'KM':'KM', icon:'📏' },
                { value:'100%', label:l==='fr'?'COUVERTURE':l==='en'?'COVERAGE':l==='de'?'ABDECKUNG':l==='es'?'COBERTURA':l==='it'?'COBERTURA':'COBERTURA', icon:'🛡️' },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign:'center', padding:24, background:C.card2, borderRadius:16 }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>{stat.icon}</div>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:48, color:C.red, lineHeight:1 }}>{stat.value}</div>
                  <div style={{ fontSize:12, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:C.text3, marginTop:8 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Coverage Grid */}
          <motion.div 
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6, delay:0.2 }}
            style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:20 }}
          >
            {coverageItems.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity:0, y:20 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ delay:i*0.1, duration:0.5 }}
                style={{ 
                  background:C.card, 
                  border:`1px solid ${C.border}`, 
                  borderRadius:16, 
                  padding:28, 
                  boxShadow:C.shadow,
                  transition:'all 0.3s'
                }}
                onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(200,16,46,0.4)'; e.currentTarget.style.transform='translateY(-4px)';}}
                onMouseOut={e=>{e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform='none';}}
              >
                <div style={{ display:'flex', gap:16, marginBottom:16 }}>
                  <div style={{ width:56, height:56, borderRadius:12, background:'linear-gradient(135deg,rgba(200,16,46,0.15),rgba(200,16,46,0.05))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:18, color:C.text, marginBottom:8 }}>{item.title}</h3>
                  </div>
                </div>
                <p style={{ fontSize:14, color:C.text2, lineHeight:1.7 }}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Extension Options */}
      <section style={{ background:C.card2, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}` }} className="section-pad">
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <motion.div 
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6 }}
            style={{ textAlign:'center', marginBottom:48 }}
          >
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>
              {l==='fr'?'EXTENSIONS':l==='en'?'EXTENSIONS':l==='de'?'ERWEITERUNGEN':l==='es'?'EXTENSIONES':l==='it'?'ESTENSIONI':'EXTENSÕES'}
            </div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:C.text, letterSpacing:'-0.02em' }}>
              {l==='fr'?'Options d\'Extension\nde Garantie':l==='en'?'Warranty\nExtension Options':l==='de'?'Garantie-\nErweiterungsoptionen':l==='es'?'Opciones de\nExtensión de Garantía':l==='it'?'Opzioni di\nEstensione Garanzia':'Opções de\nExtensão de Garantia'}
            </h2>
            <p style={{ fontSize:16, color:C.text3, marginTop:12, maxWidth:600, margin:'12px auto 0' }}>
              {l==='fr'?'Étendez votre protection jusqu\'à 36 mois avec nos options d\'extension premium.':l==='en'?'Extend your protection up to 36 months with our premium extension options.':l==='de'?'Erweitern Sie Ihren Schutz bis zu 36 Monate mit unseren Premium-Erweiterungsoptionen.':l==='es'?'Amplíe su protección hasta 36 meses con nuestras opciones de extensión premium.':l==='it'?'Estendete la vostra protezione fino a 36 mesi con le nostre opzioni di estensione premium.':l==='pt'?'Estenda sua proteção até 36 meses com nossas opções de extensão premium.'}
            </p>
          </motion.div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:24 }}>
            {extensionOptions.map((option, i) => (
              <motion.div 
                key={i}
                initial={{ opacity:0, y:30 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ delay:i*0.1, duration:0.5 }}
                style={{ 
                  background:C.card, 
                  border:`1px solid ${C.border}`, 
                  borderRadius:20, 
                  padding:32, 
                  boxShadow:C.shadow,
                  transition:'all 0.3s',
                  position:'relative',
                  overflow:'hidden'
                }}
                onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(200,16,46,0.4)'; e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(200,16,46,0.15)';}}
                onMouseOut={e=>{e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=C.shadow;}}
              >
                {i === 2 && (
                  <div style={{ position:'absolute', top:0, right:0, background:'linear-gradient(135deg,#C8102E,#9B0B22)', color:'#fff', fontSize:10, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', padding:'6px 16px', borderBottomLeftRadius:12 }}>
                    {l==='fr'?'POPULAIRE':l==='en'?'POPULAR':l==='de'?'BELIEBT':l==='es'?'POPULAR':l==='it'?'POPOLARE':'POPULAR'}
                  </div>
                )}
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:22, color:C.text, marginBottom:12 }}>{option.title}</h3>
                <div style={{ fontSize:28, fontWeight:900, color:C.red, marginBottom:24 }}>{option.price}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {option.features.map((feature, fi) => (
                    <div key={fi} style={{ fontSize:14, color:C.text2, fontWeight:600, lineHeight:1.6 }}>{feature}</div>
                  ))}
                </div>
                <button style={{ 
                  width:'100%', 
                  marginTop:24, 
                  padding:'14px 20px', 
                  background:'linear-gradient(135deg,#C8102E,#9B0B22)', 
                  color:'#fff', 
                  border:'none', 
                  borderRadius:10, 
                  fontSize:14, 
                  fontWeight:700, 
                  fontFamily:"'Outfit',sans-serif",
                  cursor:'pointer',
                  transition:'all 0.3s'
                }}>
                  {l==='fr'?'Choisir cette option':l==='en'?'Choose this option':l==='de'?'Diese Option wählen':l==='es'?'Elegir esta opción':l==='it'?'Scegli questa opzione':'Escolher esta opção'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Exclusions */}
      <section className="section-pad">
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <motion.div 
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6 }}
            style={{ textAlign:'center', marginBottom:48 }}
          >
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>
              {l==='fr'?'EXCLUSIONS':l==='en'?'EXCLUSIONS':l==='de'?'AUSSCHLÜSSE':l==='es'?'EXCLUSIONES':l==='it'?'ESCLUSIONI':'EXCLUSÕES'}
            </div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:C.text, letterSpacing:'-0.02em' }}>
              {l==='fr'?'Ce qui n\'est pas\ncouvert':l==='en'?'What is not\ncovered':l==='de'?'Was nicht\nabgedeckt ist':l==='es'?'Lo que no está\ncubierto':l==='it'?'Cosa non è\ncoperto':'O que não está\ncoberto'}
            </h2>
          </motion.div>

          <motion.div 
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6, delay:0.1 }}
            style={{ background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:16, padding: isMobile ? 28 : 40 }}
          >
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:20 }}>
              {[
                l==='fr'?'✗ Pièces d\'usure (plaquettes, disques, pneus, essuie-glaces)':l==='en'?'✗ Wear parts (brake pads, discs, tires, wipers)':l==='de'?'✗ Verschleißteile (Bremsbeläge, Scheiben, Reifen, Scheibenwischer)':l==='es'?'✗ Piezas de desgaste (pastillas, discos, neumáticos, limpiaparabrisas)':l==='it'?'✗ Pezzi di usura (pastiglie, dischi, pneumatici, tergicristallo)':'✗ Peças de desgaste (pastilhas, discos, pneus, limpadores)',
                l==='fr'?'✗ Entretien courant (huile, filtres, bougies)':l==='en'?'✗ Routine maintenance (oil, filters, spark plugs)':l==='de'?'✗ Routine-Wartung (Öl, Filter, Zündkerzen)':l==='es'?'✗ Mantenimiento rutinario (aceite, filtros, bujías)':l==='it'?'✗ Manutenzione ordinaria (olio, filtri, candele)':'✗ Manutenção de rotina (óleo, filtros, velas)',
                l==='fr'?'✗ Carrosserie et peinture (sauf option carrosserie)':l==='en'?'✗ Body and paint (unless body option selected)':l==='de'?'✗ Karosserie und Lack (außer Karosserie-Option)':l==='es'?'✗ Carrocería y pintura (salvo opción de carrocería)':l==='it'?'✗ Carrozzeria e vernice (salvo opzione carrozzeria)':'✗ Carroceria e pintura (exceto opção de carroceria)',
                l==='fr'?'✗ Accessoires et modifications non conformes':l==='en'?'✗ Non-compliant accessories and modifications':l==='de'?'✗ Nicht konforme Zubehörteile und Modifikationen':l==='es'?'✗ Accesorios y modificaciones no conformes':l==='it'?'✗ Accessori e modifiche non conformi':'✗ Acessórios e modificações não conformes',
                l==='fr'?'✗ Dommages résultant d\'un accident ou négligence':l==='en'?'✗ Damage resulting from accident or negligence':l==='de'?'✗ Schäden durch Unfall oder Fahrlässigkeit':l==='es'?'✗ Daños resultantes de accidente o negligencia':l==='it'?'✗ Danni derivanti da incidente o negligenza':'✗ Danos resultantes de acidente ou negligência',
                l==='fr'?'✗ Utilisation commerciale ou compétition':l==='en'?'✗ Commercial use or competition':l==='de'?'✗ Gewerbliche Nutzung oder Wettbewerb':l==='es'?'✗ Uso comercial o competición':l==='it'?'✗ Uso commerciale o competizione':'✗ Uso comercial ou competição',
              ].map((item, i) => (
                <div key={i} style={{ fontSize:14, color:C.text2, lineHeight:1.7, fontWeight:600 }}>{item}</div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:'linear-gradient(135deg,#0a0a0a,#1a1a1a)', borderTop:`1px solid ${C.border}` }} className="section-pad">
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <motion.div 
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6 }}
          >
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize: isMobile ? 32 : 42, color:'#fff', letterSpacing:'-0.02em', marginBottom:20 }}>
              {l==='fr'?'Prêt à protéger votre véhicule?':l==='en'?'Ready to protect your vehicle?':l==='de'?'Bereit, Ihr Fahrzeug zu schützen?':l==='es'?'¿Listo para proteger su vehículo?':l==='it'?'Pronto a proteggere il tuo veicolo?':'Pronto para proteger seu veículo?'}
            </h2>
            <p style={{ fontSize:16, color:'rgba(255,255,255,0.7)', lineHeight:1.7, marginBottom:32 }}>
              {l==='fr'?'Contactez-nous pour discuter des options de garantie adaptées à vos besoins.':l==='en'?'Contact us to discuss warranty options tailored to your needs.':l==='de'?'Kontaktieren Sie uns, um Garantieoptionen zu besprechen, die auf Ihre Bedürfnisse zugeschnitten sind.':l==='es'?'Contáctenos para discutir opciones de garantía adaptadas a sus necesidades.':l==='it'?'Contattateci per discutere le opzioni di garanzia adatte alle tue esigenze.':l==='pt'?'Entre em contato conosco para discutir opções de garantia adaptadas às suas necessidades.'}
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <a href="https://wa.me/4915788823274" target="_blank" rel="noopener noreferrer" style={{ 
                background:'#25D366', 
                color:'#fff', 
                textDecoration:'none', 
                fontFamily:"'Outfit',sans-serif", 
                fontSize:14, 
                fontWeight:700, 
                padding:'14px 28px', 
                borderRadius:8, 
                display:'inline-flex', 
                alignItems:'center', 
                gap:8,
                boxShadow:'0 4px 16px rgba(37,211,102,0.3)'
              }}>
                💬 WhatsApp
              </a>
              <Link to="/catalog" style={{ 
                background:'rgba(255,255,255,0.1)', 
                color:'#fff', 
                textDecoration:'none', 
                fontFamily:"'Outfit',sans-serif", 
                fontSize:14, 
                fontWeight:700, 
                padding:'14px 28px', 
                borderRadius:8, 
                border:'1px solid rgba(255,255,255,0.3)',
                display:'inline-flex', 
                alignItems:'center', 
                gap:8
              }}>
                {l==='fr'?'Voir les véhicules':l==='en'?'View vehicles':l==='de'?'Fahrzeuge ansehen':l==='es'?'Ver vehículos':l==='it'?'Vedi veicoli':'Ver veículos'}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
