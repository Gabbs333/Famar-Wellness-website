import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero from './Hero';

export default function Home() {
  return (
    <>
      <Hero />
      
      {/* Introduction / Teaser About */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-teal-600 font-semibold tracking-wider uppercase text-sm">Bienvenue chez Famar Wellness</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">
                  Votre santé mérite l'excellence
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Situé au cœur de Bastos à Yaoundé, notre cabinet réinvente la massothérapie en combinant l'expertise manuelle aux technologies les plus avancées (I-Motion, Andullation, Tecarthérapie).
                </p>
                <p className="text-gray-600 leading-relaxed mb-8">
                  Que vous soyez sportif de haut niveau, souffrant de douleurs chroniques ou simplement en quête de bien-être, nous avons une solution personnalisée pour vous.
                </p>
                <Link 
                  to="/a-propos" 
                  className="text-teal-600 font-bold hover:text-teal-700 inline-flex items-center gap-2 group"
                >
                  En savoir plus sur notre approche
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
            <div className="w-full md:w-1/2">
               <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative rounded-3xl overflow-hidden shadow-xl"
              >
                <img 
                  src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Cabinet Famar Wellness" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="text-lime-400 fill-current" size={20} />
                      <Star className="text-lime-400 fill-current" size={20} />
                      <Star className="text-lime-400 fill-current" size={20} />
                      <Star className="text-lime-400 fill-current" size={20} />
                      <Star className="text-lime-400 fill-current" size={20} />
                    </div>
                    <p className="font-medium">"Le meilleur cabinet de Yaoundé"</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Teaser */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Soins Phares</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez nos traitements les plus demandés pour une récupération et un bien-être optimal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Electrostimulation",
                desc: "20 minutes = 4h de sport. Renforcement musculaire et perte de poids rapide.",
                image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              },
              {
                title: "Thérapie par Andullation",
                desc: "Soulagement immédiat des douleurs dorsales et relaxation profonde.",
                image: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              },
              {
                title: "Massages Sportifs",
                desc: "Récupération musculaire et prévention des blessures pour les athlètes.",
                image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="h-48 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{item.desc}</p>
                  <Link to="/services" className="text-teal-600 font-medium text-sm hover:underline">
                    En savoir plus →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/services" 
              className="inline-block px-8 py-3 border border-teal-600 text-teal-600 font-bold rounded-full hover:bg-teal-50 transition-colors"
            >
              Voir tous nos services
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-teal-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Prêt à transformer votre santé ?
          </h2>
          <p className="text-teal-100 text-lg mb-10 max-w-2xl mx-auto">
            Ne laissez plus la douleur ou le stress dicter votre quotidien. Prenez rendez-vous dès aujourd'hui et découvrez la différence Famar Wellness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/reservation"
              className="px-8 py-4 bg-lime-500 text-teal-900 font-bold rounded-full hover:bg-lime-400 transition-colors shadow-lg shadow-lime-500/20"
            >
              Réserver ma séance
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 bg-transparent border border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
