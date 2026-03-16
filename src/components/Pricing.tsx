import { motion } from 'motion/react';
import { Sparkles, HandHeart, Dumbbell, Check, Zap, Activity } from 'lucide-react';

export default function Pricing() {
  const massages = [
    {
      name: "Massage Relaxant - 30 min",
      price: "30 000",
      unit: "FCFA",
      description: "Séance de massage relaxant",
      features: [],
      color: "teal"
    },
    {
      name: "Massage Relaxant - 1h",
      price: "50 000",
      unit: "FCFA",
      description: "Séance de massage relaxant",
      features: [],
      color: "teal"
    }
  ];

  const lipoLaser = [
    {
      name: "Lipo-Laser - 1 séance",
      price: "40 000",
      unit: "FCFA",
      description: "Programme de Lipo-Lazer",
      features: [],
      color: "pink"
    },
    {
      name: "Lipo-Laser + I-Motion",
      price: "60 000",
      unit: "FCFA",
      description: "1 séance + Électrostimulation musculaire",
      features: [],
      color: "pink"
    }
  ];

  const analyses = [
    {
      name: "Analyse du dos - Sans Scanner",
      price: "10 000",
      unit: "FCFA",
      description: "Consultation sans scanner",
      features: [],
      color: "blue"
    },
    {
      name: "Analyse du dos - Avec Scanner",
      price: "35 000",
      unit: "FCFA",
      description: "Consultation avec scanner",
      features: [],
      color: "blue"
    }
  ];

  const analysesMassotherapie = [
    {
      name: "Analyse + Massothérapie - 30 min",
      price: "40 000",
      unit: "FCFA",
      description: "Analyse du dos + Massothérapie",
      features: [],
      color: "purple"
    },
    {
      name: "Analyse + Massothérapie - 1h",
      price: "60 000",
      unit: "FCFA",
      description: "Analyse du dos + Massothérapie",
      features: [],
      color: "purple"
    }
  ];

  const andullation = [
    {
      name: "Analyse + Andullation",
      price: "35 000",
      unit: "FCFA",
      description: "Analyse + Thérapie par Andullation - 15 min",
      features: [],
      color: "indigo"
    },
    {
      name: "Andullation seule",
      price: "10 000",
      unit: "FCFA",
      description: "Thérapie par Andullation",
      features: [],
      color: "indigo"
    }
  ];

  const tecar = [
    {
      name: "Analyse + Tecarthérapie",
      price: "35 000",
      unit: "FCFA",
      description: "Analyse du dos + Tecarthérapie",
      features: [],
      color: "orange"
    },
    {
      name: "Combo: Massage + Tecar + Andullation",
      price: "35 000",
      unit: "FCFA",
      description: "Massothérapie + Tecarthérapie + Andullation",
      features: [],
      color: "orange"
    }
  ];

  const electrostimulation = [
    {
      name: "I-Motion - Électrostimulation",
      price: "20 000",
      unit: "FCFA",
      description: "Thérapie avec Électrostimulation musculaire",
      features: ["Brûler les graisses", "Renforcer les muscles", "Éliminer les douleurs"],
      color: "cyan"
    },
    {
      name: "Analyse + Électrostimulation",
      price: "35 000",
      unit: "FCFA",
      description: "Analyse du dos + Électrostimulation musculaire",
      features: [],
      color: "cyan"
    }
  ];

  const complete = [
    {
      name: "Séance Complète",
      price: "50 000",
      unit: "FCFA",
      description: "Scanner + Massothérapie + Électrostimulation + Tecarthérapie + Andullation",
      features: ["Analyse complète du dos", "Tous les soins inclus"],
      color: "lime"
    }
  ];

  const suivi = [
    {
      name: "Suivi Spécial - 1ère séance",
      price: "60 000",
      unit: "FCFA",
      description: "Consultation avec scanner + Première séance",
      features: ["Pour Lombalgie, Hernie Discale, Sciatique", "5 ou 10 séances payables à l'avance"],
      popular: true,
      color: "rose"
    },
    {
      name: "Suivi Spécial - Séance",
      price: "40 000",
      unit: "FCFA",
      description: "Séance de suivi spécial",
      features: ["Pour Lombalgie, Hernie Discale, Sciatique"],
      color: "rose"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; accent: string; light: string }> = {
      pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', accent: 'bg-pink-600', light: 'bg-pink-100' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', accent: 'bg-purple-600', light: 'bg-purple-100' },
      teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600', accent: 'bg-teal-600', light: 'bg-teal-100' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', accent: 'bg-orange-600', light: 'bg-orange-100' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', accent: 'bg-blue-600', light: 'bg-blue-100' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', accent: 'bg-indigo-600', light: 'bg-indigo-100' },
      cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', accent: 'bg-cyan-600', light: 'bg-cyan-100' },
      lime: { bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-600', accent: 'bg-lime-600', light: 'bg-lime-100' },
      rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', accent: 'bg-rose-600', light: 'bg-rose-100' },
    };
    return colors[color] || colors.teal;
  };

  const renderSection = (title: string, icon: React.ReactNode, items: any[], bgColor: string) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-16"
    >
      <div className={`flex items-center gap-3 mb-8`}>
        <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item, index) => {
          const colors = getColorClasses(item.color);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`relative ${colors.bg} rounded-2xl p-6 border ${colors.border} hover:shadow-xl transition-all ${item.popular ? 'ring-2 ring-rose-500 ring-offset-2' : ''}`}
            >
              {item.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Recommandé
                </div>
              )}
              <h3 className="font-bold text-gray-900 mb-1 text-lg">{item.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{item.description}</p>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900">{item.price}</span>
                <span className="text-gray-500"> {item.unit}</span>
              </div>
              {item.features && item.features.length > 0 && (
                <ul className="space-y-2 mt-4">
                  {item.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check size={14} className={`${colors.text} mt-0.5 flex-shrink-0`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap size={16} />
            <span>Tarifs 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-lime-600">Tarifs</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Des tarifs transparents pour tous vos besoins. Choisissez le soin qui vous correspond.
          </p>
        </motion.div>

        {/* Massage Relaxant */}
        {renderSection("Massage Relaxant", <HandHeart className="text-teal-600" size={24} />, massages, "bg-teal-100")}

        {/* Programme Lipo-Laser */}
        {renderSection("Programme Lipo-Laser", <Activity className="text-pink-600" size={24} />, lipoLaser, "bg-pink-100")}

        {/* Analyse du Dos */}
        {renderSection("Analyse du Dos", <Sparkles className="text-blue-600" size={24} />, analyses, "bg-blue-100")}

        {/* Analyse + Massothérapie */}
        {renderSection("Analyse du Dos + Massothérapie", <HandHeart className="text-purple-600" size={24} />, analysesMassotherapie, "bg-purple-100")}

        {/* Andullation */}
        {renderSection("Thérapie par Andullation", <Sparkles className="text-indigo-600" size={24} />, andullation, "bg-indigo-100")}

        {/* Tecarthérapie */}
        {renderSection("Tecarthérapie", <Zap className="text-orange-600" size={24} />, tecar, "bg-orange-100")}

        {/* Électrostimulation */}
        {renderSection("I-Motion Électrostimulation", <Zap className="text-cyan-600" size={24} />, electrostimulation, "bg-cyan-100")}

        {/* Séance Complète */}
        {renderSection("Séance Complète", <Dumbbell className="text-lime-600" size={24} />, complete, "bg-lime-100")}

        {/* Suivi Spécial */}
        {renderSection("Suivi Spécial", <Sparkles className="text-rose-600" size={24} />, suivi, "bg-rose-100")}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-teal-600 to-lime-600 rounded-3xl p-8 md:p-12 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Prêt à commencer votre bien-être ?
            </h2>
            <p className="text-teal-100 mb-8 max-w-2xl mx-auto">
              Réservez votre séance dès maintenant et prenez soin de votre corps avec nos technologies de pointe.
            </p>
            <a
              href="/reservation"
              className="inline-flex items-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-full font-bold hover:bg-teal-50 transition-colors shadow-lg"
            >
              Réserver une séance
            </a>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 text-center text-gray-600"
        >
          <p className="font-semibold">Téléphone : (+237) 674 51 81 13 / 696 19 02 56</p>
          <p className="font-semibold">Email : epohfamar@gmail.com</p>
        </motion.div>
      </div>
    </div>
  );
}
