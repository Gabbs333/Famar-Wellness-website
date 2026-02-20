import { motion } from 'motion/react';
import { Calendar, ArrowRight } from 'lucide-react';

const posts = [
  {
    title: "Les bienfaits de l'Andullation",
    excerpt: "Découvrez comment la thérapie par andullation peut soulager vos douleurs chroniques et améliorer votre sommeil.",
    date: "15 Fév 2026",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    title: "Préparation sportive avec l'EMS",
    excerpt: "Optimisez vos performances et récupérez plus vite grâce à l'électrostimulation musculaire I-Motion.",
    date: "10 Fév 2026",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    title: "Massage et grossesse",
    excerpt: "Pourquoi le massage est essentiel pour soulager les tensions et préparer le corps pendant la grossesse.",
    date: "05 Fév 2026",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  }
];

export default function Blog() {
  return (
    <section id="blog" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-teal-600 font-semibold tracking-wider uppercase text-sm">Actualités</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Derniers Articles</h2>
          </div>
          <a href="#" className="hidden md:flex items-center text-teal-600 font-medium hover:text-teal-700 transition-colors">
            Voir tout <ArrowRight size={18} className="ml-2" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="rounded-2xl overflow-hidden mb-4 aspect-video">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar size={14} className="mr-2" />
                {post.date}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {post.excerpt}
              </p>
            </motion.article>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <a href="#" className="inline-flex items-center text-teal-600 font-medium hover:text-teal-700 transition-colors">
            Voir tout <ArrowRight size={18} className="ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
}
