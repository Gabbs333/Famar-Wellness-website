import { useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  const blob1Controls = useAnimation();
  const blob2Controls = useAnimation();
  
  useEffect(() => {
    const animateBlobs = async () => {
      await Promise.all([
        blob1Controls.start({
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.45, 0.3],
        }),
        blob2Controls.start({
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.35, 0.2],
        })
      ]);
    };
    
    // Start continuous animation loop
    let cancelled = false;
    const loop = async () => {
      while (!cancelled) {
        await Promise.all([
          blob1Controls.start({
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.45, 0.3],
            transition: { duration: 8, ease: "easeInOut" }
          }),
          blob2Controls.start({
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.35, 0.2],
            transition: { duration: 10, ease: "easeInOut", delay: 1 }
          })
        ]);
      }
    };
    
    loop();
    
    return () => {
      cancelled = true;
    };
  }, [blob1Controls, blob2Controls]);
  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay - Two images side by side */}
      <div className="absolute inset-0 z-0 flex">
        <div className="w-1/2 h-full">
          <img
            src="https://dvjzkijpcpdjbdbzkbfr.supabase.co/storage/v1/object/public/cms-images/uploads/1773016052577_WhatsApp%20Image%202026-03-05%20at%2011.51.13%20(1).jpeg"
            alt="Famar Wellness Treatment"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-1/2 h-full">
          <img
            src="https://dvjzkijpcpdjbdbzkbfr.supabase.co/storage/v1/object/public/cms-images/uploads/1773015799505_WhatsApp%20Image%202026-02-17%20at%2019.49.38%20(1).jpeg"
            alt="Famar Wellness Care"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 to-black/40 mix-blend-multiply" />
      </div>

      {/* Animated Background Blobs - Optimized with CSS */}
      <motion.div 
        animate={blob1Controls}
        useWillChange={true}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500 rounded-full blur-[60px] mix-blend-screen z-0 will-change-transform"
      />
      <motion.div 
        animate={blob2Controls}
        useWillChange={true}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lime-500 rounded-full blur-[50px] mix-blend-screen z-0 will-change-transform"
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left w-full h-full flex flex-col justify-center pt-24 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-lime-500/20 text-lime-300 border border-lime-500/30 text-sm font-semibold tracking-wider mb-4 backdrop-blur-sm">
            CABINET DE MASSOTHÉRAPIE ULTRA MODERNE
          </span>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-4">
            Santé et Bien-Être <br />
            <span className="text-lime-400">au Cameroun</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl font-light leading-relaxed">
            Découvrez une approche globale alliant technologies de pointe et thérapies manuelles pour votre santé physique et mentale.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/reservation"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-teal-900 bg-lime-400 hover:bg-lime-300 transition-all shadow-lg hover:shadow-lime-400/30 transform hover:-translate-y-1"
            >
              Prendre Rendez-vous
              <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center justify-center px-8 py-4 border border-white/30 text-base font-medium rounded-full text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
            >
              Découvrir nos soins
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </div>
      </motion.div>

      {/* Smooth Transition Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white via-white/50 to-transparent z-0 pointer-events-none" />
    </section>
  );
}
