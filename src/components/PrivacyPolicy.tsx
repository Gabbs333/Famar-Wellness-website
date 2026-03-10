import { motion } from 'motion/react';
import { Shield, Lock, Eye, User, Mail, Phone, MapPin, Trash2 } from 'lucide-react';

export default function PrivacyPolicy() {
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
              <Shield className="text-teal-600" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Politique de Confidentialité</h1>
            <p className="text-gray-600 text-lg">Dernière mise à jour : Mars 2026</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl p-6 border border-teal-100 mb-12">
              <p className="text-gray-700">
                Chez <strong>Famar Wellness</strong>, nous accordons une importance primordiale à la protection de vos données personnelles. Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre site web.
              </p>
            </div>

            {/* Section 1 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="text-teal-600" size={24} />
                1. Données collectées
              </h2>
              <p className="text-gray-600 mb-4">
                Nous collectons les données suivantes :
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 bg-gray-50 rounded-xl p-6 border border-gray-100">
                <li><strong>Via le formulaire de contact :</strong> Nom, prénom, numéro de téléphone, adresse email, message</li>
                <li><strong>Via la newsletter :</strong> Adresse email</li>
                <li><strong>Via le système de réservation :</strong> Nom, prénom, coordonnées, informations de réservation</li>
                <li><strong>Données de navigation :</strong> Adresse IP, type de navigateur, pages visitées (via cookies analytiques)</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="text-teal-600" size={24} />
                2. Utilisation des données
              </h2>
              <p className="text-gray-600 mb-4">
                Vos données sont utilisées pour :
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 bg-gray-50 rounded-xl p-6 border border-gray-100">
                <li>Répondre à vos demandes de contact</li>
                <li>Gérer vos réservations de séances</li>
                <li>Vous envoyer notre newsletter (avec votre consentement)</li>
                <li>Améliorer notre site web et notre服务水平</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="text-teal-600" size={24} />
                3. Protection des données
              </h2>
              <p className="text-gray-600 mb-4">
                Nous mettons en œuvre les mesures de sécurité suivantes pour protéger vos données :
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Utilisation du protocole HTTPS pour toutes les connexions</li>
                <li>Stockage des données sur des serveurs sécurisés</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Politique de mot de passe stricte pour l'administration</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies</h2>
              <p className="text-gray-600 mb-4">
                Notre site utilise des cookies pour améliorer votre expérience de navigation. Les cookies sont de petits fichiers stockés sur votre appareil qui nous aident à :
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 bg-gray-50 rounded-xl p-6 border border-gray-100">
                <li>Analyser le trafic et les performances du site</li>
                <li>Mémoriser vos préférences</li>
                <li>Sécuriser votre session</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Vous pouvez à tout moment désactiver les cookies dans les paramètres de votre navigateur.
              </p>
            </section>

            {/* Section 5 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trash2 className="text-teal-600" size={24} />
                5. Vos droits
              </h2>
              <p className="text-gray-600 mb-4">
                Conformément à la réglementation camerounaise et au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 bg-gray-50 rounded-xl p-6 border border-gray-100">
                <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> Demander la correction de données erronées</li>
                <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
                <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
                <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Pour exercer ces droits, contactez-nous à : <strong>contact@famarwellness.com</strong>
              </p>
            </section>

            {/* Section 6 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Conservation des données</h2>
              <p className="text-gray-600 mb-4">
                Nous conservons vos données personnelles pour les durées suivantes :
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Données de contact :</strong> 3 ans après le dernier contact</li>
                <li><strong>Données de réservation :</strong> 5 ans (obligations comptables)</li>
                <li><strong>Données de newsletter :</strong> Jusqu'à votre désinscription</li>
                <li><strong>Données analytiques :</strong> 13 mois maximum</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Transfert de données</h2>
              <p className="text-gray-600">
                Vos données peuvent être hébergées sur des serveurs situés hors du Cameroun (notamment aux États-Unis pour Vercel). Ces transferts sont encadrés par des mesures de protection appropriées conformément à la réglementation en vigueur.
              </p>
            </section>

            {/* Section 8 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modifications</h2>
              <p className="text-gray-600">
                Cette politique de confidentialité peut être modifiée à tout moment. En cas de modification substantielle, nous vous en informerons via notre site web.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact</h2>
              <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl p-6 border border-teal-100">
                <p className="text-gray-600 mb-4">
                  Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, contactez-nous :
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="text-teal-600" size={20} />
                    <span>Bastos, Yaoundé, Cameroun</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="text-teal-600" size={20} />
                    <span>+237 674 51 81 13</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="text-teal-600" size={20} />
                    <span>contact@famarwellness.com</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
