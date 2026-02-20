import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Zap, Layers, ScanLine, HeartPulse, Dumbbell, Sparkles, Baby, Hand, Brain, X } from 'lucide-react';

const services = [
  {
    title: "Electrostimulation (I-Motion EMS)",
    description: "Améliorez votre force, éliminez les douleurs lombaires, brûlez les graisses et prévenez les blessures grâce à la combinaison I-Motion EMS.",
    icon: Zap,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Thérapie par Andullation",
    description: "Soulagez efficacement le stress, les douleurs dorsales, cervicales, hernie discale et fibromyalgie. Idéal pour la récupération sportive.",
    icon: Layers,
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Tecarthérapie (Winback)",
    description: "Utilisée par les grands clubs sportifs pour soulager, guérir et prévenir tout type de blessures, tensions et douleurs.",
    icon: Activity,
    color: "bg-orange-50 text-orange-600",
  },
  {
    title: "Lipo-Laser & Andullation",
    description: "Transformez les cellules adipeuses et évacuez les déchets grâce au drainage lymphatique pour une perte de poids rapide sans chirurgie.",
    icon: ScanLine,
    color: "bg-pink-50 text-pink-600",
  },
  {
    title: "Scanner IDIAG M360",
    description: "Analyse approfondie de la colonne vertébrale pour établir un plan de traitement personnalisé pour la relaxation et le renforcement.",
    icon: HeartPulse,
    color: "bg-teal-50 text-teal-600",
  },
  {
    title: "Massothérapie Sportive",
    description: "Préparation et récupération après l'effort, drainage lymphatique et sanguin, réflexologie plantaire.",
    icon: Dumbbell,
    color: "bg-lime-50 text-lime-600",
  },
];

const massages = [
  { 
    name: "Drainage Lymphatique", 
    icon: Activity,
    description: "Stimule la circulation de la lymphe pour détoxifier l'organisme et renforcer le système immunitaire.",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  { 
    name: "Massage Relaxant", 
    icon: Sparkles,
    description: "Un moment de détente absolue pour évacuer le stress et les tensions accumulées.",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  { 
    name: "Crâne, Cou, Épaule", 
    icon: Brain,
    description: "Cible les zones de tension liées au stress et à la posture pour un soulagement immédiat.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  { 
    name: "Massage du Dos", 
    icon: Layers,
    description: "Soulage les douleurs dorsales, lombaires et cervicales grâce à des techniques spécifiques.",
    image: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  { 
    name: "Pieds et Mains", 
    icon: Hand,
    description: "Réflexologie et massage détente pour soulager les extrémités souvent sollicitées.",
    image: "https://images.unsplash.com/photo-1611094605642-9979b1b909c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  { 
    name: "Massage Femme Enceinte", 
    icon: Baby,
    description: "Un soin doux et adapté pour soulager les maux de la grossesse et se relaxer.",
    image: "https://images.unsplash.com/photo-1555819206-7b30da4f1506?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  { 
    name: "Massage Deep-Tissue", 
    icon: Activity,
    description: "Massage en profondeur pour dénouer les tensions musculaires chroniques.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  { 
    name: "Massage Sportif", 
    icon: Dumbbell,
    description: "Prépare les muscles à l'effort et favorise une récupération optimale après le sport.",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
];

export default function Services() {
  const [selectedMassage, setSelectedMassage] = useState<typeof massages[0] | null>(null);

  return (
    <section id="services" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-teal-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-lime-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

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
            Des technologies de pointe et des soins manuels pour répondre à vos besoins spécifiques.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${service.color} group-hover:scale-110 transition-transform duration-300`}>
                <service.icon size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Massages List */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nos Massages Spécifiques</h3>
            <p className="text-gray-600">Cliquez sur un massage pour en savoir plus.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {massages.map((massage, index) => (
              <motion.button
                key={index}
                onClick={() => setSelectedMassage(massage)}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex flex-col items-center p-4 rounded-xl hover:bg-teal-50 transition-colors group cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mb-3 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                  <massage.icon size={20} />
                </div>
                <span className="font-medium text-gray-800 text-center group-hover:text-teal-700 transition-colors">
                  {massage.name}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-[70]"
            >
              <button
                onClick={() => setSelectedMassage(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="h-48 overflow-hidden">
                <img 
                  src={selectedMassage.image} 
                  alt={selectedMassage.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
                    <selectedMassage.icon size={20} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedMassage.name}</h3>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {selectedMassage.description}
                </p>
                <a
                  href="/reservation"
                  className="block w-full text-center bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors"
                >
                  Réserver ce soin
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
