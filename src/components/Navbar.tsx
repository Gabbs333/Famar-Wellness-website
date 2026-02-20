import { useState, useEffect } from 'react';
import { Menu, X, Phone, MapPin, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import CallbackModal from './CallbackModal';
import Logo from './Logo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Technologies', path: '/technologies' },
    { name: 'À Propos', path: '/a-propos' },
    { name: 'Galerie', path: '/galerie' },
    { name: 'Témoignages', path: '/temoignages' },
    { name: 'Actualités', path: '/actualites' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled || location.pathname !== '/' ? 'bg-white/60 backdrop-blur-lg shadow-sm py-2' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 md:h-28">
            {/* Logo */}
            <Link 
              to="/" 
              className={`flex-shrink-0 flex items-center gap-2 ${
                !scrolled && location.pathname === '/' ? 'text-white' : 'text-gray-900'
              }`}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Logo className="h-20 md:h-28 w-auto" />
              </motion.div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-6">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`font-medium transition-colors duration-200 ${
                      location.pathname === link.path ? 'text-teal-600' : 'text-gray-700 hover:text-teal-600'
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-3 ml-4"
              >
                <button
                  onClick={() => setIsCallbackOpen(true)}
                  className="flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 px-3 py-2 rounded-full hover:bg-teal-50 transition-colors"
                >
                  <PhoneCall size={18} />
                  <span className="hidden xl:inline">Rappel Gratuit</span>
                </button>
                <Link
                  to="/reservation"
                  className="bg-teal-600 text-white px-5 py-2 rounded-full font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20"
                >
                  Prendre Rendez-vous
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-4">
              <button
                onClick={() => setIsCallbackOpen(true)}
                className="text-teal-600 p-2 rounded-full bg-teal-50"
              >
                <PhoneCall size={20} />
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-teal-600 focus:outline-none"
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-2 shadow-lg">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`block px-3 py-3 rounded-md text-base font-medium ${
                      location.pathname === link.path 
                        ? 'text-teal-600 bg-teal-50' 
                        : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/reservation"
                  className="block w-full text-center mt-4 bg-teal-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20"
                >
                  Prendre Rendez-vous
                </Link>
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-gray-600 mb-3 px-3">
                    <Phone size={18} className="text-teal-600" />
                    <span className="text-sm">+237 674 51 81 13</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 px-3">
                    <MapPin size={18} className="text-teal-600" />
                    <span className="text-sm">Bastos, Yaoundé</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <CallbackModal isOpen={isCallbackOpen} onClose={() => setIsCallbackOpen(false)} />
    </>
  );
}
