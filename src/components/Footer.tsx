import { Heart, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Brand */}
          <div className="mb-6 md:mb-0">
            <Link to="/" className="inline-block mb-4">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm inline-block text-white">
                <Logo className="h-32 md:h-40 w-auto" />
              </div>
            </Link>
            <p className="text-sm mt-4 leading-relaxed">
              Cabinet de massothérapie ultra moderne alliant technologies de pointe et soins manuels pour votre santé et bien-être à Bastos, Yaoundé.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-white font-semibold mb-2">Liens Rapides</h4>
            <Link to="/mentions-legales" className="hover:text-white transition-colors">Mentions Légales</Link>
            <Link to="/politique-confidentialite" className="hover:text-white transition-colors">Politique de Confidentialité</Link>
            <Link to="/plan-site" className="hover:text-white transition-colors">Plan du site</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4">Newsletter</h4>
            <p className="text-sm mb-4">Inscrivez-vous pour recevoir nos offres et actualités.</p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-teal-500 w-full"
              />
              <button className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-lg transition-colors">
                <Mail size={20} />
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-xs flex items-center justify-center gap-1">
          <span>© {new Date().getFullYear()} Famar Wellness. Tous droits réservés. Fait avec</span>
          <Heart size={12} className="text-red-500 fill-current" />
          <span>au Cameroun.</span>
        </div>
      </div>
    </footer>
  );
}
