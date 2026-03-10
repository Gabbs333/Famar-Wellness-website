import { motion } from 'motion/react';
import { Shield, Scale, MapPin, Phone, Mail } from 'lucide-react';

export default function LegalNotice() {
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
              <Scale className="text-teal-600" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Mentions Légales</h1>
            <p className="text-gray-600 text-lg">Dernière mise à jour : Mars 2026</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {/* Section 1 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="text-teal-600" size={24} />
                1. Éditeur du site
              </h2>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-gray-700 mb-4">
                  <strong>Famar Wellness</strong>
                </p>
                <p className="text-gray-600">
                  Cabinet de massothérapie et de bien-être<br />
                  Situé à Bastos, Yaoundé, Cameroun
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Responsable de la publication</h2>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-gray-700 mb-2">
                  <strong>Fabrice Marrel Epoh</strong>
                </p>
                <p className="text-gray-600">
                  Massothérapeute certifié<br />
                  Fondateur et directeur de Famar Wellness
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Hébergement</h2>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-gray-600">
                  Le site est hébergé par :<br />
                  <strong>Vercel Inc.</strong><br />
                  440 N Barranca Ave #4133<br />
                  Covina, CA 91723, États-Unis
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Propriété intellectuelle</h2>
              <p className="text-gray-600 mb-4">
                L'ensemble des contenus présents sur ce site (textes, images, vidéos, logos, icônes, sons, logiciels, etc.) est protégé par les lois camerounaises et internationales relatives à la propriété intellectuelle.
              </p>
              <p className="text-gray-600">
                Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site est interdite sans autorisation écrite préalable de Famar Wellness.
              </p>
            </section>

            {/* Section 5 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Responsabilité</h2>
              <p className="text-gray-600 mb-4">
                Les informations fournies sur ce site le sont à titre purement informatif et ne constituent en aucun cas un conseil médical, un diagnostic ou un traitement. Famar Wellness décline toute responsabilité quant à l'utilisation qui pourrait être faite des informations contenues sur ce site.
              </p>
              <p className="text-gray-600">
                Les résultats des traitements peuvent varier d'une personne à l'autre. Les témoignages présents sur le site sont des témoignages authentiques mais les résultats individuels peuvent varier.
              </p>
            </section>

            {/* Section 6 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Liens hypertextes</h2>
              <p className="text-gray-600 mb-4">
                Le site peut contenir des liens vers d'autres sites internet. Famar Wellness n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
              </p>
            </section>

            {/* Section 7 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Droit applicable</h2>
              <p className="text-gray-600">
                Les présentes mentions légales sont régies par le droit camerounais. En cas de litige, les tribunaux de Yaoundé seront seuls compétents.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact</h2>
              <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl p-6 border border-teal-100">
                <p className="text-gray-600 mb-4">
                  Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
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
