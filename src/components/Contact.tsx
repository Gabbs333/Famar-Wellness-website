import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    phone: '',
    email: '',
    city: '',
    subject: '',
    message: '',
    newsletter: false
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.name || !formData.phone || !formData.email) {
      setError('Les champs Nom, Téléphone et Email sont obligatoires.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.name} ${formData.firstName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          message: `Sujet: ${formData.subject}\nVille: ${formData.city}\n\nMessage: ${formData.message}`,
          type: 'contact'
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSuccess(true);
        // Reset form
        setFormData({
          name: '',
          firstName: '',
          phone: '',
          email: '',
          city: '',
          subject: '',
          message: '',
          newsletter: false
        });
        
        // If newsletter checkbox is checked, subscribe
        if (formData.newsletter) {
          try {
            await fetch('/api/newsletter', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: formData.email }),
            });
          } catch (err) {
            // Silent fail for newsletter subscription
            console.log('Newsletter subscription failed:', err);
          }
        }
      } else {
        setError(data.error || `Erreur serveur (${response.status})`);
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError('Erreur de connexion au serveur. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Prenez Rendez-vous</h2>
            <p className="text-gray-400 mb-10 text-lg">
              Notre équipe est à votre disposition pour répondre à toutes vos questions et vous accompagner vers le bien-être.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Notre Adresse</h3>
                  <p className="text-gray-400">Carrefour Bastos, en face de Kenny's Great House</p>
                  <p className="text-gray-400">Yaoundé, Cameroun</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-400 group-hover:bg-lime-500 group-hover:text-white transition-all duration-300">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Téléphone</h3>
                  <p className="text-gray-400 hover:text-white transition-colors cursor-pointer">+237 674 51 81 13</p>
                  <p className="text-gray-400 hover:text-white transition-colors cursor-pointer">+237 696 19 02 56</p>
                  <p className="text-gray-500 text-sm mt-1">+32 465 78 26 61 (International)</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Email</h3>
                  <p className="text-gray-400 hover:text-white transition-colors cursor-pointer">epohfamar@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink-500 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl p-8 text-gray-900 shadow-2xl"
          >
            <h3 className="text-2xl font-bold mb-6">Envoyez-nous un message</h3>
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
                Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input 
                    type="text" 
                    name="name"
                    required 
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all" 
                    placeholder="Votre nom" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all" 
                    placeholder="Votre prénom" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    required 
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all" 
                    placeholder="Votre numéro" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input 
                    type="email" 
                    name="email"
                    required 
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all" 
                    placeholder="votre@email.com" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all" 
                    placeholder="Votre ville" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
                  <select 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                  >
                    <option value="">Votre demande concerne...</option>
                    <option value="rdv">Prise de rendez-vous</option>
                    <option value="info">Demande d'information</option>
                    <option value="partenariat">Partenariat</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  rows={4} 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all" 
                  placeholder="Comment pouvons-nous vous aider ?"
                ></textarea>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="newsletter" 
                  name="newsletter"
                  checked={formData.newsletter}
                  onChange={handleChange}
                  className="mt-1 rounded text-teal-600 focus:ring-teal-500" 
                />
                <label htmlFor="newsletter" className="text-sm text-gray-500">
                  J'accepte de recevoir des informations et offres commerciales par email.
                </label>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
