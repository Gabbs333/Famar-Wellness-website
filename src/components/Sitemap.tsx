import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Home, Calendar, Info, Image, MessageSquare, FileText, Shield, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';

export default function Sitemap() {
  const siteLinks = [
    {
      category: "Navigation Principale",
      icon: Home,
      links: [
        { name: "Accueil", path: "/", description: "Page d'accueil du cabinet" },
        { name: "Services", path: "/services", description: "Nos soins et thérapies" },
        { name: "Technologies", path: "/technologies", description: "Équipements de pointe" },
        { name: "À Propos", path: "/a-propos", description: "En savoir plus sur nous" },
        { name: "Galerie", path: "/galerie", description: "Photos de notre cabinet" },
        { name: "Témoignages", path: "/temoignages", description: "Avis de nos clients" },
        { name: "Contact", path: "/contact", description: "Contactez-nous" },
      ]
    },
    {
      category: "Prise de Rendez-vous",
      icon: Calendar,
      links: [
        { name: "Réservation en ligne", path: "/reservation", description: "Planifiez votre séance" },
      ]
    },
    {
      category: "Informations Légales",
      icon: Shield,
      links: [
        { name: "Mentions Légales", path: "/mentions-legales", description: "Informations légales" },
        { name: "Politique de Confidentialité", path: "/politique-confidentialite", description: "Protection des données" },
      ]
    },
  ];

  const services = [
    "Electrostimulation (I-Motion EMS)",
    "Thérapie par Andullation",
    "Tecarthérapie (Winback)",
    "Lipo-Laser & Andullation",
    "Scanner pour analyse du dos",
    "Massothérapie Sportive",
    "Massage Relaxant",
  ];

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-6">
              <MapPin className="text-teal-600" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Plan du Site</h1>
            <p className="text-gray-600 text-lg">
              Découvrez toutes les pages de notre site web
            </p>
          </div>

          {/* Main Navigation */}
          <div className="mb-12">
            {siteLinks.map((section, sectionIndex) => (
              <motion.div
                key={section.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <section.icon className="text-teal-600" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.category}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.links.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="group block p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-teal-600 mt-1 flex-shrink-0" size={18} />
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                            {link.name}
                          </h3>
                          <p className="text-sm text-gray-500 group-hover:text-teal-600 transition-colors">
                            {link.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Services Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-lime-100 rounded-lg flex items-center justify-center">
                <FileText className="text-lime-600" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Nos Services</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service, index) => (
                <Link
                  key={index}
                  to="/services"
                  className="group flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-lime-200 hover:bg-lime-50 transition-all"
                >
                  <CheckCircle className="text-lime-600 flex-shrink-0" size={18} />
                  <span className="font-medium text-gray-700 group-hover:text-lime-700 transition-colors">
                    {service}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-teal-50 to-white rounded-2xl p-8 border border-teal-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Contactez-nous</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <MapPin className="text-teal-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                <p className="text-gray-600 text-sm">Bastos, Yaoundé<br />Cameroun</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Phone className="text-teal-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
                <p className="text-gray-600 text-sm">+237 674 51 81 13</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Mail className="text-teal-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                <p className="text-gray-600 text-sm">contact@famarwellness.com</p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Link
                to="/reservation"
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-full font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20"
              >
                <Calendar size={20} />
                Prendre Rendez-vous
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
