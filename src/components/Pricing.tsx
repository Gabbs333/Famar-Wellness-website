import { motion } from 'motion/react';

// Custom SVG Icons
const IconMassage = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8">
    <circle cx="32" cy="32" r="28" fill="#ccfbf1" stroke="#0d9488" strokeWidth="2"/>
    <path d="M20 28c2-4 8-6 12-6s10 2 12 6" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M22 36c2 2 6 3 10 3s8-1 10-3" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="32" cy="20" r="3" fill="#0d9488"/>
  </svg>
);

const IconLaser = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8">
    <circle cx="32" cy="32" r="28" fill="#fce7f3" stroke="#db2777" strokeWidth="2"/>
    <path d="M32 12v16M32 36v16M20 22l8 8M36 34l8 8M20 42l8-8M36 26l8-8" stroke="#db2777" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="32" cy="32" r="6" fill="#db2777"/>
  </svg>
);

const IconScanner = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8">
    <rect x="8" y="16" width="48" height="32" rx="4" fill="#dbeafe" stroke="#2563eb" strokeWidth="2"/>
    <path d="M16 28h32M16 36h32" stroke="#2563eb" strokeWidth="2"/>
    <circle cx="32" cy="20" r="4" fill="#2563eb"/>
  </svg>
);

const IconAndullation = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8">
    <circle cx="32" cy="32" r="28" fill="#ede9fe" stroke="#7c3aed" strokeWidth="2"/>
    <path d="M20 32c0-8 5-16 12-16s12 8 12 16-5 16-12 16-12-8-12-16z" fill="#a78bfa" stroke="#7c3aed" strokeWidth="2"/>
    <path d="M32 16v32M24 24l8 8 8-8M24 40l8-8 8 8" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IconTecar = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8">
    <circle cx="32" cy="32" r="28" fill="#ffedd5" stroke="#ea580c" strokeWidth="2"/>
    <path d="M32 16v12l8 8" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="32" cy="44" r="6" fill="#ea580c"/>
    <path d="M20 32c0-6 5-12 12-12s12 6 12 12" stroke="#ea580c" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IconElectro = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8">
    <circle cx="32" cy="32" r="28" fill="#cffafe" stroke="#0891b2" strokeWidth="2"/>
    <path d="M36 16l-8 16h8l-6 16-10-12h8l4-12-8-8h12l-8-12v12z" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const IconComplete = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8">
    <circle cx="32" cy="32" r="28" fill="#ecfccb" stroke="#65a30d" strokeWidth="2"/>
    <path d="M20 32l8 8 16-16" stroke="#65a30d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconMedical = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8">
    <circle cx="32" cy="32" r="28" fill="#fee2e2" stroke="#dc2626" strokeWidth="2"/>
    <path d="M32 20v24M20 32h24" stroke="#dc2626" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="32" cy="32" r="8" fill="#fee2e2" stroke="#dc2626" strokeWidth="2"/>
  </svg>
);

const IconHeart = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8">
    <circle cx="32" cy="32" r="28" fill="#fce7f3" stroke="#ec4899" strokeWidth="2"/>
    <path d="M32 44s-12-8-12-16a6 6 0 0112-6 6 6 0 0112 6c0 8-12 16-12 16z" fill="#ec4899"/>
  </svg>
);

export default function Pricing() {
  const sections = [
    {
      title: "Massage Relaxant",
      icon: <IconMassage />,
      bgColor: "bg-teal-100",
      items: [
        {
          name: "30 Minutes",
          price: "30 000",
          description: "Séance de massage relaxant de 30 minutes pour une détente rapide et efficace.",
          features: ["Soulage les tensions", "Détente immédiate", "Améliore la circulation"],
          popular: false,
          color: "teal"
        },
        {
          name: "1 Heure",
          price: "50 000",
          description: "Séance de massage relaxant complète d'une heure pour une relaxation profonde.",
          features: ["Massage complet du corps", "Détente totale", "Effet prolongé"],
          popular: false,
          color: "teal"
        }
      ]
    },
    {
      title: "Programme Lipo-Laser",
      icon: <IconLaser />,
      bgColor: "bg-pink-100",
      items: [
        {
          name: "Lipo-Laser Seul",
          price: "40 000",
          description: "Séance de traitement minceur par technologie Lipo-Laser pour cibler les graisses localisées.",
          features: ["Technologie lumineuse avancée", "Cible les adipocytes", "Résultats visibles"],
          popular: true,
          color: "pink"
        },
        {
          name: "Lipo-Laser + I-Motion",
          price: "60 000",
          description: "Combo minceur : Lipo-Laser associé à l'électrostimulation musculaire pour des résultats optimaux.",
          features: ["Double action", "Brûle les graisses", "Renforce les muscles"],
          popular: false,
          color: "pink"
        }
      ]
    },
    {
      title: "Analyse du Dos",
      icon: <IconScanner />,
      bgColor: "bg-blue-100",
      items: [
        {
          name: "Sans Scanner",
          price: "10 000",
          description: "Consultation initiale pour évaluer votre dos sans imagerie scanner.",
          features: ["Évaluation posturale", "Identification des tensions", "Conseils personnalisés"],
          popular: false,
          color: "blue"
        },
        {
          name: "Avec Scanner",
          price: "35 000",
          description: "Analyse complète de votre colonne vertébrale avec le scanner IDIAG pour un diagnostic précis.",
          features: ["Analyse 3D de la colonne", "Plan thérapeutique personnalisé", "Sans radiation"],
          popular: false,
          color: "blue"
        }
      ]
    },
    {
      title: "Analyse + Massothérapie",
      icon: <IconMassage />,
      bgColor: "bg-purple-100",
      items: [
        {
          name: "30 Minutes",
          price: "40 000",
          description: "Analyse du dos suivie d'une séance de massage thérapeutique de 30 minutes.",
          features: ["Diagnostic précis", "Traitement ciblé", "Soulagement rapide"],
          popular: false,
          color: "purple"
        },
        {
          name: "1 Heure",
          price: "60 000",
          description: "Bilan complet du dos et massage thérapeutique approfondi d'une heure.",
          features: ["Analyse complète", "Massage profond", "Plan de traitement"],
          popular: false,
          color: "purple"
        }
      ]
    },
    {
      title: "Andullation",
      icon: <IconAndullation />,
      bgColor: "bg-indigo-100",
      items: [
        {
          name: "Analyse + Andullation",
          price: "35 000",
          description: "Analyse du dos associée à une séance de thérapie par Andullation de 15 minutes.",
          features: ["Vibrations thérapeutiques", "Chaleur infrarouge", "Relaxation profonde"],
          popular: true,
          color: "indigo"
        },
        {
          name: "Andullation Seule",
          price: "10 000",
          description: "Séance de thérapie par Andullation pour relaxer et soulager les tensions.",
          features: ["Vibrations relaxantes", "Soulagement musculaire", "Bien-être immédiat"],
          popular: false,
          color: "indigo"
        }
      ]
    },
    {
      title: "Tecarthérapie",
      icon: <IconTecar />,
      bgColor: "bg-orange-100",
      items: [
        {
          name: "Analyse + Tecarthérapie",
          price: "35 000",
          description: "Analyse du dos combinée à une séance de Tecarthérapie Winback pour régénérer les tissus.",
          features: ["Énergie capacitive résistive", "Guérison accélérée", "Pour sportifs"],
          popular: false,
          color: "orange"
        },
        {
          name: "Combo Complet",
          price: "35 000",
          description: "Massage, Tecarthérapie et Andullation combinés en une séance complète.",
          features: ["Triple technologie", "Traitement holistique", "Résultats optimaux"],
          popular: false,
          color: "orange"
        }
      ]
    },
    {
      title: "I-Motion Électrostimulation",
      icon: <IconElectro />,
      bgColor: "bg-cyan-100",
      items: [
        {
          name: "I-Motion Seul",
          price: "20 000",
          description: "Séance d'électrostimulation musculaire pour brûler les graisses et renforcer les muscles.",
          features: ["Brûle les graisses", "Renforce les muscles", "Élimine les douleurs"],
          popular: false,
          color: "cyan"
        },
        {
          name: "Analyse + Electro",
          price: "35 000",
          description: "Analyse du dos associée à une séance d'électrostimulation pour un traitement complet.",
          features: ["Diagnostic + traitement", "Musculation passive", "Rééducation"],
          popular: false,
          color: "cyan"
        }
      ]
    },
    {
      title: "Séance Complète",
      icon: <IconComplete />,
      bgColor: "bg-lime-100",
      items: [
        {
          name: "Tout Compris",
          price: "50 000",
          description: "La formule complète : Scanner + Massothérapie + Électrostimulation + Tecarthérapie + Andullation.",
          features: ["6 technologies en 1", "Traitement intégral", "L'expérience complète"],
          popular: false,
          color: "lime"
        }
      ]
    },
    {
      title: "Suivi Spécial",
      icon: <IconMedical />,
      bgColor: "bg-rose-100",
      items: [
        {
          name: "Bilan + 1ère Séance",
          price: "60 000",
          description: "Pour lombalgie, hernie discale, sciatique : Consultation avec scanner + première séance de traitement.",
          features: ["Pour pathologies chroniques", "5 ou 10 séances à l'avance", "Suivi personnalisé"],
          popular: true,
          color: "rose"
        },
        {
          name: "Séance de Suivi",
          price: "40 000",
          description: "Séance de suivi pour les pathologies chroniques (lombalgie, hernie discale, sciatique).",
          features: ["Traitement spécialisé", "Adapté à votre pathologie", "Suivi régulier"],
          popular: false,
          color: "rose"
        }
      ]
    }
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; btn: string; badge: string }> = {
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600', btn: 'bg-teal-600', badge: 'bg-teal-500' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', btn: 'bg-pink-600', badge: 'bg-pink-500' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', btn: 'bg-blue-600', badge: 'bg-blue-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', btn: 'bg-purple-600', badge: 'bg-purple-500' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', btn: 'bg-indigo-600', badge: 'bg-indigo-500' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', btn: 'bg-orange-600', badge: 'bg-orange-500' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', btn: 'bg-cyan-600', badge: 'bg-cyan-500' },
    lime: { bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-600', btn: 'bg-lime-600', badge: 'bg-lime-500' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', btn: 'bg-rose-600', badge: 'bg-rose-500' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-gradient-to-r from-teal-500 to-lime-500 text-white text-sm font-bold px-4 py-2 rounded-full mb-4">
            TARIFS 2026
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-lime-600">Tarifs</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Des soins personnalisés pour votre bien-être. Choisissez la formule adaptée à vos besoins.
          </p>
        </motion.div>

        {/* Sections */}
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={sectionIndex}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: sectionIndex * 0.05 }}
            className="mb-12"
          >
            {/* Section Title */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-14 h-14 ${section.bgColor} rounded-2xl flex items-center justify-center shadow-md`}>
                {section.icon}
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
              <h2 className="text-2xl font-bold text-gray-900 whitespace-nowrap">{section.title}</h2>
              <div className="flex-1 h-px bg-gradient-to-l from-gray-300 to-transparent"></div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg={section.items.length > 2 ? 3 : 2} gap-6">
              {section.items.map((item, itemIndex) => {
                const colors = colorMap[item.color] || colorMap.teal;
                const isPopular = item.popular;
                return (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: itemIndex * 0.1 }}
                    className={`relative ${isPopular ? colors.badge : colors.bg} rounded-2xl border ${isPopular ? 'border-' + item.color + '-400' : colors.border} shadow-sm hover:shadow-2xl transition-all duration-300 ${isPopular ? 'ring-2 ring-offset-2 ' + colors.badge : ''}`}
                  >
                    {item.popular && (
                      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${colors.badge} text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md z-10`}>
                        Populaire
                      </div>
                    )}
                    
                    <div className="p-6">
                      <h3 className={`font-bold text-xl mb-2 ${isPopular ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
                      <p className={`text-sm mb-4 leading-relaxed ${isPopular ? 'text-white/90' : 'text-gray-600'}`}>{item.description}</p>
                      
                      <div className="mb-6">
                        <span className={`text-4xl font-extrabold ${isPopular ? 'text-white' : 'text-gray-900'}`}>{item.price}</span>
                        <span className={`text-lg ml-1 ${isPopular ? 'text-white/80' : 'text-gray-500'}`}>Fcfa</span>
                      </div>

                      {item.features.length > 0 && (
                        <ul className="space-y-2 mb-6">
                          {item.features.map((feature, i) => (
                            <li key={i} className={`flex items-center gap-2 text-sm ${isPopular ? 'text-white/90' : 'text-gray-700'}`}>
                              <svg className={`w-4 h-4 ${isPopular ? 'text-white' : colors.text} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}

                      <a
                        href="/reservation"
                        className={`block w-full ${isPopular ? 'bg-white text-' + item.color + '-600 hover:bg-gray-100' : colors.btn + ' text-white'} text-center py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg`}
                      >
                        Réserver
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-teal-600 to-lime-600 rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Une question sur nos tarifs ?
            </h2>
            <p className="text-teal-100 mb-8 max-w-xl mx-auto">
              N'hésitez pas à nous contacter pour plus d'informations ou pour réserver votre séance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/reservation"
                className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-full font-bold hover:bg-teal-50 transition-colors shadow-lg"
              >
                Réserver maintenant
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-colors"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center text-gray-600"
        >
          <p className="font-semibold text-lg">📞 (+237) 674 51 81 13 / 696 19 02 56</p>
          <p className="font-semibold">📧 epohfamar@gmail.com</p>
          <p className="text-sm mt-2">Bastos, Yaoundé, Cameroun</p>
        </motion.div>
      </div>
    </div>
  );
}
