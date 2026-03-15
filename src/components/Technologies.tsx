import { motion } from 'motion/react';
import { Zap, Activity, Waves, Target, Scan, HeartPulse } from 'lucide-react';

export default function Technologies() {
  return (
    <section id="technologies" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section 1: Electrostimulation */}
        <div className="mb-24">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2"
            >
              <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
                <Zap className="text-blue-600 mb-6" size={48} />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Electrostimulation Musculaire (I-Motion EMS)</h3>
                <p className="text-gray-600 mb-6">
                  Vous pouvez trouver de nombreuses solutions grâce à l'appareil d'électrostimulation Musculaire, la Combinaison I-Motion EMS (que vous pouvez également avoir chez vous) qui permet :
                </p>
                <ul className="space-y-3">
                  {[
                    "Améliorer la force, la vigueur et la mobilité.",
                    "Éliminer douleurs lombaires (Sciatique, Hernie Discale...)",
                    "Brûler les graisses, perdre du poids et éliminer la cellulite.",
                    "Rééquilibrer la musculation.",
                    "Prévenir les blessures et déchirures musculaires.",
                    "Travailler les muscles sans mouvements (rééducation)."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
            <div className="w-full md:w-1/2">
              <img 
                src="https://dvjzkijpcpdjbdbzkbfr.supabase.co/storage/v1/object/public/cms-images/uploads/1773536285529_combi-Imotion-1024x859.png" 
                alt="Electrostimulation" 
                className="rounded-3xl shadow-lg object-cover h-full min-h-[400px]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Tecarthérapie Winback */}
        <div className="mb-24">
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2"
            >
              <div className="bg-orange-50 rounded-3xl p-8 border border-orange-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 -mt-10 -ml-10 w-40 h-40 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
                <HeartPulse className="text-orange-600 mb-6" size={48} />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Tecarthérapie Winback</h3>
                <p className="text-gray-600 mb-4">
                  La tecarthérapie est une technologie de pointe utilisée par les plus grands clubs sportifs internationaux. Elle utilise l'énergie capacitive résistive pour régénérer les tissus en profondeur.
                </p>
                <h4 className="font-semibold text-gray-900 mt-6 mb-2">Bienfaits de la Tecarthérapie</h4>
                <ul className="space-y-3">
                  {[
                    "Accélère la guérison des blessures (entorses, déchirures).",
                    "Soulage les douleurs articulaires et musculaires.",
                    "Améliore la récupération après l'effort.",
                    "Traite les tendinites et pathologies chroniques.",
                    "Réduit les inflammations et œdèmes.",
                    "Optimise la mobilité et la flexibilité."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
            <div className="w-full md:w-1/2">
              <img 
                src="https://dvjzkijpcpdjbdbzkbfr.supabase.co/storage/v1/object/public/cms-images/uploads/1773016105237_WhatsApp%20Image%202026-03-05%20at%2012.06.46.jpeg" 
                alt="Tecarthérapie Winback" 
                className="rounded-3xl shadow-lg object-cover h-full min-h-[400px]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Scanner analyse du dos */}
        <div className="mb-24">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2"
            >
              <div className="bg-teal-50 rounded-3xl p-8 border border-teal-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-teal-200 rounded-full opacity-20 blur-3xl"></div>
                <Scan className="text-teal-600 mb-6" size={48} />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Scanner d'Analyse du Dos (IDIAG M360)</h3>
                <p className="text-gray-600 mb-4">
                  Le scanner IDIAG M360 est une technologie révolutionnaire d'analyse de la colonne vertébrale. Il permet une évaluation précise et objective de votre posture sans radiation.
                </p>
                <h4 className="font-semibold text-gray-900 mt-6 mb-2">Ce que révèle l'analyse</h4>
                <ul className="space-y-3">
                  {[
                    "Analyse de la posture et de l'alignement vertébral.",
                    "Évaluation de la mobilité et de la flexibilité.",
                    "Détection des déséquilibres musculaires.",
                    "Identification des zones de tension et de douleur.",
                    "Mesure de la lordose et de la cyphose.",
                    "Plan thérapeutique personnalisé généré automatiquement."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
            <div className="w-full md:w-1/2">
              <img 
                src="https://dvjzkijpcpdjbdbzkbfr.supabase.co/storage/v1/object/public/cms-images/uploads/1773015773718_WhatsApp%20Image%202026-02-17%20at%2019.49.28%20(1).jpeg" 
                alt="Scanner analyse du dos" 
                className="rounded-3xl shadow-lg object-cover h-full min-h-[400px]"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Lipo-Laser & Andullation */}
        <div className="mb-24">
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2"
            >
              <div className="bg-pink-50 rounded-3xl p-8 border border-pink-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 -mt-10 -ml-10 w-40 h-40 bg-pink-200 rounded-full opacity-20 blur-3xl"></div>
                <Activity className="text-pink-600 mb-6" size={48} />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Lipo-Laser (Liposuccion sans chirurgie)</h3>
                <p className="text-gray-600 mb-4">
                  Cette thérapie scientifiquement reconnue (Low Level Laser Therapy) se base sur la technologie lumineuse pour traiter les cellules adipeuses de manière ciblée et délivrer des résultats immédiats.
                </p>
                <h4 className="font-semibold text-gray-900 mt-6 mb-2">Lipo-Laser & Andullation</h4>
                <p className="text-gray-600">
                  Le Lipo-Laser transforme les cellules adipeuses en eau et lipides. Grâce à la technologie d'Andullation et la stimulation du drainage lymphatique, les déchets sont ensuite évacuées. C'est la combinaison de ces deux technologies qui assure une perte de poids rapide.
                </p>
              </div>
            </motion.div>
            <div className="w-full md:w-1/2">
              <img 
                src="https://dvjzkijpcpdjbdbzkbfr.supabase.co/storage/v1/object/public/cms-images/uploads/1773016052577_WhatsApp%20Image%202026-03-05%20at%2011.51.13%20(1).jpeg" 
                alt="Lipo Laser" 
                className="rounded-3xl shadow-lg object-cover h-full min-h-[400px]"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Andullation */}
        <div className="mb-24">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2"
            >
              <div className="bg-purple-50 rounded-3xl p-8 border border-purple-100 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 -mb-10 -mr-10 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
                <Waves className="text-purple-600 mb-6" size={48} />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Andullation</h3>
                <p className="text-gray-600 mb-4">
                  L'Andullation est une technologie unique qui combine des vibrations mécaniques et de la chaleur infrarouge pour une relaxation profonde et un soulagement des douleurs chroniques.
                </p>
                <h4 className="font-semibold text-gray-900 mt-6 mb-2">Indications et Bienfaits</h4>
                <ul className="space-y-3">
                  {[
                    "Soulagement des douleurs chroniques (fibromyalgia, arthrose).",
                    "Réduction du stress et amélioration du sommeil.",
                    "Stimulation de la circulation sanguine et lymphatique.",
                    "Détente profonde des muscles et des tensions.",
                    "Élimination des toxines et détoxification.",
                    "Soulagement des jambes lourdes."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
            <div className="w-full md:w-1/2">
              <img 
                src="https://dvjzkijpcpdjbdbzkbfr.supabase.co/storage/v1/object/public/cms-images/uploads/1772773238178_WhatsApp%20Image%202026-02-17%20at%2019.44.23.jpeg" 
                alt="Andullation Matelas" 
                className="rounded-3xl shadow-lg object-cover h-full min-h-[400px]"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Anduslim */}
        <div>
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2"
            >
              <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
                <Target className="text-indigo-600 mb-6" size={48} />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">ANDUSLIM : Façonnage et relaxation</h3>
                <p className="text-gray-600 mb-6">
                  ANDUSLIM est une ceinture innovante de thérapie vibratoire qui soutient votre corps grâce à la technologie Andullation. Elle favorise le réchauffement et la relaxation des muscles grâce à sa fonction de chaleur profonde. Elle offre un effet ciblé avec 3 programmes différents et une expérience d'utilisation confortable et efficace.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <span className="block text-sm text-gray-500 mb-1">Durée</span>
                    <span className="font-semibold text-gray-900">15 minutes</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <span className="block text-sm text-gray-500 mb-1">Programmes</span>
                    <span className="font-semibold text-gray-900">Sports, Façonnage, Relaxation</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <span className="block text-sm text-gray-500 mb-1">Effet</span>
                    <span className="font-semibold text-gray-900">Réchauffement profond</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <span className="block text-sm text-gray-500 mb-1">Densité</span>
                    <span className="font-semibold text-gray-900">Faible, Moyenne, Élevée</span>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="w-full md:w-1/2">
              <img 
                src="https://dvjzkijpcpdjbdbzkbfr.supabase.co/storage/v1/object/public/cms-images/uploads/1773016075374_WhatsApp%20Image%202026-03-05%20at%2011.56.51%20(1).jpeg" 
                alt="Relaxation Therapy" 
                className="rounded-3xl shadow-lg object-cover h-full min-h-[400px]"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
