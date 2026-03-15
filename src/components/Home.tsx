// Home.tsx - Home page with CMS content support
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Star, Sparkles, Activity, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero from './Hero';
import { useCmsPage, checkCmsPageExists } from '../lib/useCmsPage';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  
  // Check if CMS has content for this page
  const [useCmsContent, setUseCmsContent] = useState(false);
  const { page: cmsPage, loading: cmsLoading } = useCmsPage('accueil');

  useEffect(() => {
    async function checkCms() {
      const exists = await checkCmsPageExists('accueil');
      setUseCmsContent(exists);
    }
    checkCms();
  }, []);

  // If CMS has content, render DynamicHome
  if (useCmsContent && cmsPage && !cmsLoading) {
    return <DynamicHome cmsPage={cmsPage} />;
  }

  // Otherwise, render the default hardcoded content
  return <DefaultHome y={y} scrollYProgress={scrollYProgress} />;
}

// Default hardcoded Home component
function DefaultHome({ y, scrollYProgress }: { y: any; scrollYProgress: any }) {
  return (
    <>
      <Hero />
      
      {/* Introduction / Teaser About */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Animated Background Elements - Optimized */}
        <motion.div 
          useWillChange={true}
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.4, 0.25]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-200 rounded-full blur-[60px] -z-10 will-change-transform"
        />
        <motion.div 
          useWillChange={true}
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            opacity: [0.25, 0.4, 0.25]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-lime-200 rounded-full blur-[60px] -z-10 will-change-transform"
        />
        <motion.div 
          useWillChange={true}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-200 rounded-full blur-[70px] -z-10 will-change-transform"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-12 h-[2px] bg-teal-600"></span>
                  <span className="text-teal-600 font-bold tracking-wider uppercase text-sm">Bienvenue chez Famar Wellness</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                  Votre santé mérite <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-lime-500">
                    l'excellence absolue
                  </span>
                </h2>
                
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Situé au cœur de Bastos à Yaoundé, notre cabinet réinvente la massothérapie en combinant l'expertise manuelle aux technologies les plus avancées (Lipo-laser, scanner et annalyse de dos, Anduslim, Andullation, Tecarthérapie, I-Motion).
                </p>
                
                <p className="text-gray-600 leading-relaxed mb-10">
                  Que vous soyez sportif de haut niveau, souffrant de douleurs chroniques ou simplement en quête de bien-être, nous avons une solution personnalisée pour vous.
                </p>
                
                <Link 
                  to="/a-propos" 
                  className="group inline-flex items-center gap-3 px-6 py-3 bg-gray-50 text-teal-800 rounded-full hover:bg-teal-50 transition-colors duration-300 font-semibold"
                >
                  En savoir plus sur notre approche
                  <span className="bg-teal-600 text-white p-1 rounded-full group-hover:translate-x-1 transition-transform duration-300">
                    <ArrowRight size={16} />
                  </span>
                </Link>
              </motion.div>
            </div>
            
            <div className="w-full md:w-1/2 relative">
               <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative rounded-[2rem] overflow-hidden shadow-2xl z-10"
              >
                <img 
                  src="https://dvjzkijpcpdjbdbzkbfr.supabase.co/storage/v1/object/public/cms-images/uploads/1773015995493_WhatsApp%20Image%202026-02-19%20at%2018.42.26%20(1).jpeg" 
                  alt="Cabinet Famar Wellness" 
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                />
                
                {/* Floating Badge */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20"
                >
                  <div className="flex items-center gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="text-lime-500 fill-current" size={16} />
                    ))}
                  </div>
                  <p className="font-bold text-gray-900 text-sm">"Le meilleur cabinet de Yaoundé"</p>
                </motion.div>
              </motion.div>
              
              {/* Decorative Elements behind image */}
              <div className="absolute -top-10 -right-10 w-full h-full border-2 border-teal-200 rounded-[2rem] -z-10"></div>
              <motion.div 
                useWillChange={true}
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-12 -right-12 text-lime-200 will-change-transform"
              >
                <Sparkles size={120} />
              </motion.div>
              <motion.div 
                useWillChange={true}
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-8 -left-8 text-teal-200 will-change-transform"
              >
                <Sparkles size={80} />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Teaser */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Animated Background Blobs for Services Section - Optimized */}
        <motion.div 
          useWillChange={true}
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            opacity: [0.3, 0.45, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-0 w-[350px] h-[350px] bg-purple-200 rounded-full blur-[60px] -z-0 will-change-transform"
        />
        <motion.div 
          useWillChange={true}
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.4, 0.25]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-20 right-0 w-[400px] h-[400px] bg-teal-200 rounded-full blur-[70px] -z-0 will-change-transform"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Nos Soins Phares</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Découvrez nos traitements les plus demandés pour une récupération et un bien-être optimal.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "Scanner pour analyse de dos",
                desc: "Analyse précise de votre colonne vertébrale pour un diagnostic personnalisé.",
                image: "https://dvjzkijpcpdjbdbzkbfr.supabase.co/storage/v1/object/public/cms-images/uploads/1773015799505_WhatsApp%20Image%202026-02-17%20at%2019.49.38%20(1).jpeg",
                icon: <Zap className="text-white" size={24} />,
                color: "bg-blue-500"
              },
              {
                title: "Lipo-laser = Liposucion sans chirurgie",
                desc: "Élimination non invasive des graisses par technologie laser avancée.",
                image: "https://dvjzkijpcpdjbdbzkbfr.supabase.co/storage/v1/object/public/cms-images/uploads/1773016052577_WhatsApp%20Image%202026-03-05%20at%2011.51.13%20(1).jpeg",
                icon: <Activity className="text-white" size={24} />,
                color: "bg-purple-500"
              },
              {
                title: "Tecatherapie",
                desc: "Traitement thermique profond pour soulager douleurs et tensions.",
                image: "https://dvjzkijpcpdjbdbzkbfr.supabase.co/storage/v1/object/public/cms-images/uploads/1773016105237_WhatsApp%20Image%202026-03-05%20at%2012.06.46.jpeg",
                icon: <Sparkles className="text-white" size={24} />,
                color: "bg-teal-500"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.6 }}
                whileHover={{ y: -10 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="h-64 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                  <div className={`absolute top-4 right-4 ${item.color} p-3 rounded-xl shadow-lg z-20`}>
                    {item.icon}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">{item.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{item.desc}</p>
                  <Link to="/services" className="inline-flex items-center text-teal-600 font-bold hover:text-teal-800 transition-colors">
                    En savoir plus <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Link 
              to="/services" 
              className="inline-block px-10 py-4 border-2 border-teal-600 text-teal-600 font-bold rounded-full hover:bg-teal-600 hover:text-white transition-all duration-300 shadow-lg hover:shadow-teal-600/30"
            >
              Voir tous nos services
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section with Parallax */}
      <section className="py-32 bg-teal-900 relative overflow-hidden flex items-center justify-center">
        <motion.div style={{ y }} className="absolute inset-0 opacity-20">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </motion.div>
        
        {/* Animated Blobs - Optimized */}
        <motion.div 
          useWillChange={true}
          animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-48 h-48 bg-lime-500 rounded-full blur-[50px] will-change-transform"
        />
        <motion.div 
          useWillChange={true}
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-teal-400 rounded-full blur-[60px] will-change-transform"
        />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight"
          >
            Prêt à transformer <br/>
            <span className="text-lime-400">votre santé ?</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-teal-100 text-xl mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Ne laissez plus la douleur ou le stress dicter votre quotidien. Prenez rendez-vous dès aujourd'hui et découvrez la différence Famar Wellness.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link
              to="/reservation"
              className="px-10 py-5 bg-lime-500 text-teal-900 font-bold text-lg rounded-full hover:bg-lime-400 transition-all shadow-xl shadow-lime-500/20 hover:scale-105"
            >
              Réserver ma séance
            </Link>
            <Link
              to="/contact"
              className="px-10 py-5 bg-transparent border-2 border-white text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all hover:scale-105"
            >
              Nous contacter
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}

// Dynamic Home component - renders CMS content
function DynamicHome({ cmsPage }: { cmsPage: any }) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Render sections from CMS content
  const renderSections = () => {
    if (!cmsPage.content?.sections) return null;

    return cmsPage.content.sections.map((section: any, index: number) => {
      switch (section.type) {
        case 'hero':
          return <CmsHero key={index} content={section.content} />;
        case 'intro':
          return <CmsIntro key={index} content={section.content} y={y} />;
        case 'services':
          return <CmsServices key={index} content={section.content} />;
        case 'cta':
          return <CmsCTA key={index} content={section.content} y={y} />;
        default:
          return null;
      }
    });
  };

  return (
    <div className="dynamic-home">
      {renderSections()}
    </div>
  );
}

// CMS Hero Section
function CmsHero({ content }: { content: any }) {
  return (
    <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
      {content.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${content.backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
      )}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{content.title}</h1>
        {content.subtitle && (
          <p className="text-xl md:text-2xl mb-8">{content.subtitle}</p>
        )}
        {content.ctaText && content.ctaLink && (
          <Link 
            to={content.ctaLink}
            className="inline-block px-8 py-3 bg-teal-600 text-white font-bold rounded-full hover:bg-teal-700 transition-colors"
          >
            {content.ctaText}
          </Link>
        )}
      </div>
    </section>
  );
}

// CMS Intro Section
function CmsIntro({ content, y }: { content: any; y: any }) {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              {content.title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {content.description}
            </p>
            {content.linkText && (
              <Link 
                to={content.link || '/a-propos'} 
                className="group inline-flex items-center gap-3 px-6 py-3 bg-gray-50 text-teal-800 rounded-full hover:bg-teal-50 transition-colors duration-300 font-semibold"
              >
                {content.linkText}
                <span className="bg-teal-600 text-white p-1 rounded-full group-hover:translate-x-1 transition-transform duration-300">
                  <ArrowRight size={16} />
                </span>
              </Link>
            )}
          </div>
          <div className="w-full md:w-1/2">
            {content.image && (
              <img 
                src={content.image} 
                alt={content.title} 
                className="w-full rounded-[2rem] shadow-2xl"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// CMS Services Section
function CmsServices({ content }: { content: any }) {
  const services = content.services || [];
  
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">{content.title}</h2>
          {content.description && (
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">{content.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {services.map((service: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="h-64 overflow-hidden relative">
                {service.image && (
                  <>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                    <img src={service.image} alt={service.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                  </>
                )}
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                <Link to="/services" className="inline-flex items-center text-teal-600 font-bold hover:text-teal-800 transition-colors">
                  En savoir plus <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CMS CTA Section
function CmsCTA({ content, y }: { content: any; y: any }) {
  return (
    <section className="py-32 bg-teal-900 relative overflow-hidden flex items-center justify-center">
      <motion.div style={{ y }} className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
          {content.title}
        </h2>
        {content.description && (
          <p className="text-teal-100 text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
            {content.description}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {content.primaryButtonText && content.primaryButtonLink && (
            <Link
              to={content.primaryButtonLink}
              className="px-10 py-5 bg-lime-500 text-teal-900 font-bold text-lg rounded-full hover:bg-lime-400 transition-all shadow-xl shadow-lime-500/20 hover:scale-105"
            >
              {content.primaryButtonText}
            </Link>
          )}
          {content.secondaryButtonText && content.secondaryButtonLink && (
            <Link
              to={content.secondaryButtonLink}
              className="px-10 py-5 bg-transparent border-2 border-white text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all hover:scale-105"
            >
              {content.secondaryButtonText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
