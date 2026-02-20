import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-square">
              <img 
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Fabrice Marrel Epoh - Massothérapeute" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <h3 className="text-2xl font-bold">Fabrice Marrel Epoh</h3>
                <p className="text-lime-300 font-medium">Massothérapeute</p>
              </div>
            </div>
            {/* Decorative blob */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-lime-400 rounded-full mix-blend-multiply filter blur-2xl opacity-50 -z-10" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-400 rounded-full mix-blend-multiply filter blur-2xl opacity-50 -z-10" />
          </motion.div>

          {/* Content Section */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <span className="text-teal-600 font-semibold tracking-wider uppercase text-sm">À Propos de Nous</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">
              HHP Approche Globale : <br />
              <span className="text-gray-500">De l'analyse au traitement</span>
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Après une analyse approfondie de la colonne vertébrale à l’aide du scanner IDIAG M360, un plan de traitement pour la relaxation et le renforcement musculaire est automatiquement établi.
            </p>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              Le tonus musculaire trop important est réduit grâce à la thérapie par Andullation. Les exercices de stabilité et de mobilité inclus dans le plan assurent l’activation des muscles laxes.
            </p>

            <div className="space-y-4 mb-8">
              {[
                "Analyse de la posture et de la mobilité (Scanner IDIAG M360)",
                "Plan thérapeutique généré automatiquement",
                "Thérapie par l'exercice en cabinet",
                "Traitements sur l'ANDUMEDIC Pro"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="text-lime-500 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border-l-4 border-teal-500">
              <p className="italic text-gray-600">
                "Je pratique également La TECARTHERAPIE WINBACK, utilisée dans tous les grands clubs de football et sportifs en général, très pratique pour soulager, guérir et prévenir tout type de blessures."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
