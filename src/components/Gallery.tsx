import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, Camera } from 'lucide-react';

const galleryItems = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Cabinet",
    title: "Espace de Détente",
    description: "Un cadre apaisant et moderne conçu pour votre relaxation totale au cœur de Bastos."
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Équipement",
    title: "Technologie I-Motion EMS",
    description: "L'électrostimulation de pointe pour renforcer vos muscles et sculpter votre silhouette."
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Soins",
    title: "Massothérapie Manuelle",
    description: "Des mains expertes pour soulager vos tensions et revitaliser votre corps."
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Équipement",
    title: "Thérapie par Andullation",
    description: "Une technologie vibratoire unique pour soulager les douleurs chroniques et le stress."
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1591343395082-e21b17927612?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Cabinet",
    title: "Salle de Soin Privée",
    description: "Intimité et confort garantis pour une expérience thérapeutique personnalisée."
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Soins",
    title: "Suivi Personnalisé",
    description: "Analyse posturale et plan de traitement sur-mesure avec nos experts."
  }
];

export default function Gallery() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <section id="gallery" className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-teal-600 font-semibold tracking-wider uppercase text-sm flex items-center justify-center gap-2">
              <Camera size={16} />
              Notre Univers
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Visitez Notre Cabinet
            </h2>
            <p className="text-lg text-gray-600">
              Plongez dans l'atmosphère de Famar Wellness. Découvrez nos équipements de pointe et nos espaces dédiés à votre bien-être.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryItems.map((item, index) => (
            <motion.div
              key={item.id}
              layoutId={`card-container-${item.id}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setSelectedId(item.id)}
              className="group relative cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white aspect-[4/3]"
            >
              <motion.img
                layoutId={`card-image-${item.id}`}
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-lime-400 text-xs font-bold uppercase tracking-wider mb-2">{item.category}</span>
                <h3 className="text-white text-xl font-bold mb-1">{item.title}</h3>
                <div className="flex items-center text-white/80 text-sm gap-2 mt-2">
                  <ZoomIn size={16} />
                  <span>Agrandir</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedId && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedId(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
              />
              
              {galleryItems.map((item) => (
                item.id === selectedId && (
                  <motion.div
                    layoutId={`card-container-${item.id}`}
                    key={item.id}
                    className="relative bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row z-[70]"
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                      className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    >
                      <X size={24} />
                    </button>

                    <div className="w-full md:w-2/3 h-64 md:h-auto relative bg-gray-900">
                      <motion.img
                        layoutId={`card-image-${item.id}`}
                        src={item.src}
                        alt={item.title}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="w-full md:w-1/3 p-8 flex flex-col justify-center bg-white">
                      <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-teal-600 font-bold uppercase tracking-wider text-sm mb-2"
                      >
                        {item.category}
                      </motion.span>
                      <motion.h3 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-gray-900 mb-4"
                      >
                        {item.title}
                      </motion.h3>
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-600 leading-relaxed"
                      >
                        {item.description}
                      </motion.p>
                    </div>
                  </motion.div>
                )
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
