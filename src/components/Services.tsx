import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight } from 'lucide-react';

// Custom Icons Components (Abstract/Artistic)
const IconEMS = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" className="opacity-30 blur-sm" />
  </svg>
);

const IconAndullation = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
    <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="8" className="opacity-30" />
  </svg>
);

const IconTecar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M12 6v12M6 12h12" className="opacity-50" />
    <path d="M12 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" className="opacity-30" />
  </svg>
);

const IconLipo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" className="opacity-30" />
  </svg>
);

const IconScanner = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
    <path d="M4 4h16v16H4z" />
    <path d="M4 12h16M12 4v16" className="opacity-30" />
    <path d="M9 9h6v6H9z" />
  </svg>
);

const IconMassage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
    <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5z" />
    <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
  </svg>
);

const services = [
  {
    title: "Electrostimulation (I-Motion EMS)",
    subtitle: "Musclez-vous sans effort et sans douleur",
    description: "Imaginez faire 4 heures de sport en seulement 20 minutes. C'est ce que permet notre combinaison I-Motion. Elle envoie des petites impulsions électriques indolores qui font travailler tous vos muscles en même temps.",
    benefits: [
      "Mal de dos ? Renforcez votre ceinture abdominale et lombaire rapidement.",
      "Envie de mincir ? Brûlez des calories massivement, même après la séance.",
      "Manque de temps ? 20 minutes suffisent pour des résultats visibles.",
      "Zéro impact sur les articulations : idéal si vous avez mal aux genoux ou au dos."
    ],
    icon: IconEMS,
    color: "text-blue-600 bg-blue-50",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    title: "Thérapie par Andullation",
    subtitle: "Le matelas qui masse et soulage vos douleurs chroniques",
    description: "Allongez-vous et laissez les vibrations douces et la chaleur infrarouge faire le travail. Cette technologie unique stimule la circulation sanguine et détend les muscles en profondeur.",
    benefits: [
      "Douleurs chroniques (fibromyalgie, arthrose) ? Soulagement immédiat.",
      "Stressé ou fatigué ? Une séance équivaut à une sieste réparatrice profonde.",
      "Problèmes de sommeil ? Retrouvez des nuits paisibles.",
      "Jambes lourdes ? Relancez votre circulation sanguine et lymphatique."
    ],
    icon: IconAndullation,
    color: "text-purple-600 bg-purple-50",
    image: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    title: "Tecarthérapie (Winback)",
    subtitle: "L'énergie qui répare votre corps de l'intérieur",
    description: "Utilisée par les sportifs de haut niveau, cette technologie utilise une énergie haute fréquence pour accélérer la régénération naturelle de vos cellules. C'est comme un accélérateur de guérison.",
    benefits: [
      "Blessure sportive (entorse, déchirure) ? Guérissez 2 fois plus vite.",
      "Douleurs articulaires ? Retrouvez votre souplesse sans douleur.",
      "Tensions musculaires ? Dénouez les nœuds les plus tenaces.",
      "Récupération après l'effort ? Éliminez les courbatures instantanément."
    ],
    icon: IconTecar,
    color: "text-orange-600 bg-orange-50",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    title: "Lipo-Laser & Andullation",
    subtitle: "La solution minceur ciblée sans chirurgie",
    description: "Vous n'arrivez pas à perdre ce petit ventre ou cette culotte de cheval malgré le sport ? Le Lipo-Laser cible directement les cellules graisseuses pour les vider, sans aucune douleur ni aiguille.",
    benefits: [
      "Perte de centimètres visible dès les premières séances.",
      "Cible les zones rebelles (ventre, cuisses, bras) impossibles à perdre autrement.",
      "Améliore la qualité de la peau (moins de cellulite).",
      "100% naturel : la graisse est éliminée par votre corps."
    ],
    icon: IconLipo,
    color: "text-pink-600 bg-pink-50",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    title: "Scanner IDIAG M360",
    subtitle: "Le check-up complet de votre dos",
    description: "Avant de traiter, il faut comprendre. Ce scanner révolutionnaire analyse votre colonne vertébrale en mouvement, sans radiation (contrairement aux radios classiques).",
    benefits: [
      "Comprenez enfin l'origine exacte de votre mal de dos.",
      "Visualisez votre colonne vertébrale en 3D sur écran.",
      "Permet de créer un programme de soins 100% personnalisé.",
      "Suivez vos progrès séance après séance avec des données précises."
    ],
    icon: IconScanner,
    color: "text-teal-600 bg-teal-50",
    image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    title: "Massothérapie Sportive",
    subtitle: "L'expertise manuelle au service de votre performance",
    description: "Au-delà des machines, rien ne remplace la main de l'expert. Nos massages sportifs sont conçus pour les corps actifs qui ont besoin de récupération et d'entretien.",
    benefits: [
      "Préparez vos muscles avant une compétition pour éviter les blessures.",
      "Récupérez plus vite après un effort intense.",
      "Éliminez les toxines accumulées dans les muscles.",
      "Détendez-vous profondément tout en soignant votre corps."
    ],
    icon: IconMassage,
    color: "text-lime-600 bg-lime-50",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
];

const massages = [
  { 
    name: "Drainage Lymphatique", 
    description: "Jambes lourdes ? Rétention d'eau ? Ce massage doux stimule la circulation pour dégonfler et détoxifier le corps.",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  { 
    name: "Massage Relaxant", 
    description: "Le classique indémodable. Des mouvements fluides et enveloppants pour oublier le stress de la journée.",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  { 
    name: "Crâne, Cou, Épaule", 
    description: "Idéal pour ceux qui travaillent au bureau. Dénoue les tensions de la nuque et apaise les maux de tête.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  { 
    name: "Massage du Dos", 
    description: "Cible spécifiquement les douleurs lombaires et dorsales. Un soulagement profond pour votre colonne.",
    image: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  { 
    name: "Pieds et Mains", 
    description: "Nos extrémités portent tout notre stress. Ce massage procure une sensation de légèreté incroyable.",
    image: "https://images.unsplash.com/photo-1611094605642-9979b1b909c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  { 
    name: "Massage Femme Enceinte", 
    description: "Un moment de douceur pour maman et bébé. Soulage le dos et les jambes lourdes en toute sécurité.",
    image: "https://images.unsplash.com/photo-1555819206-7b30da4f1506?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  { 
    name: "Massage Deep-Tissue", 
    description: "Pour les tensions installées depuis longtemps. Un massage puissant qui va chercher les nœuds en profondeur.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  { 
    name: "Massage Sportif", 
    description: "Tonique et réparateur. Le meilleur allié de votre entraînement physique.",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
];

export default function Services() {
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);
  const [selectedMassage, setSelectedMassage] = useState<typeof massages[0] | null>(null);

  return (
    <section id="services" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.4, 0.6, 0.4]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-200 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 mix-blend-multiply -z-0" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-lime-200 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 mix-blend-multiply -z-0" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          y: [0, 30, 0],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-200 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply -z-0" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Nos Solutions Thérapeutiques
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-600"
          >
            Nous combinons le meilleur de la technologie moderne et du savoir-faire traditionnel pour votre santé.
          </motion.p>
        </div>

        {/* Main Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => setSelectedService(service)}
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100 group cursor-pointer relative overflow-hidden"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${service.color} transition-transform duration-300 group-hover:scale-110`}>
                <service.icon />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm mb-4 line-clamp-3">
                {service.description}
              </p>
              <div className="flex items-center text-teal-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
                En savoir plus <ArrowRight size={16} className="ml-2" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Massages List */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nos Massages Spécifiques</h3>
            <p className="text-gray-600">Une gamme complète de soins manuels adaptés à vos besoins.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {massages.map((massage, index) => (
              <motion.button
                key={index}
                onClick={() => setSelectedMassage(massage)}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-teal-50 hover:shadow-md transition-all group text-left w-full border border-transparent hover:border-teal-100"
              >
                <div className="w-10 h-10 rounded-full bg-white text-gray-400 flex items-center justify-center mr-4 shadow-sm group-hover:text-teal-600 transition-colors">
                  <span className="font-bold text-lg">{index + 1}</span>
                </div>
                <span className="font-medium text-gray-800 group-hover:text-teal-700 transition-colors">
                  {massage.name}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Service Details Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              layoutId={`service-${selectedService.title}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-[70] flex flex-col md:flex-row"
            >
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="w-full md:w-2/5 h-64 md:h-auto relative">
                <img 
                  src={selectedService.image} 
                  alt={selectedService.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
                <div className="absolute bottom-4 left-4 text-white md:hidden">
                  <h3 className="text-xl font-bold">{selectedService.title}</h3>
                </div>
              </div>

              <div className="w-full md:w-3/5 p-8 md:p-10">
                <div className="hidden md:flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedService.color}`}>
                    <selectedService.icon />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedService.title}</h3>
                </div>

                <h4 className="text-lg font-semibold text-teal-600 mb-4">
                  {selectedService.subtitle}
                </h4>

                <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                  {selectedService.description}
                </p>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                  <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    Pourquoi choisir ce soin ?
                  </h5>
                  <ul className="space-y-3">
                    {selectedService.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700">
                        <div className="w-5 h-5 rounded-full bg-lime-100 text-lime-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href="/reservation"
                  className="block w-full text-center bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20"
                >
                  Je réserve ma séance maintenant
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Massage Details Modal */}
      <AnimatePresence>
        {selectedMassage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMassage(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              layoutId={`massage-${selectedMassage.name}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-[70]"
            >
              <button
                onClick={() => setSelectedMassage(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="h-56 overflow-hidden relative">
                <img 
                  src={selectedMassage.image} 
                  alt={selectedMassage.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-6 text-white">
                  <h3 className="text-2xl font-bold">{selectedMassage.name}</h3>
                </div>
              </div>
              <div className="p-8">
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  {selectedMassage.description}
                </p>
                <a
                  href="/reservation"
                  className="block w-full text-center bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors"
                >
                  Réserver ce massage
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
