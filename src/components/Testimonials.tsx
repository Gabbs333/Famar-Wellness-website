import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Marie Dubois",
    role: "Patiente",
    content: "Une expérience incroyable. Je souffrais de douleurs dorsales depuis des années, et après quelques séances d'Andullation et de massage, je me sens revivre. Le cabinet est magnifique et très apaisant.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    name: "Jean-Pierre M.",
    role: "Sportif Amateur",
    content: "La préparation avec l'I-Motion EMS a vraiment boosté mes performances. Fabrice est très professionnel et connaît parfaitement les besoins des sportifs. Je recommande vivement !",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    name: "Sophie L.",
    role: "Jeune Maman",
    content: "Les massages prénatals m'ont énormément soulagée pendant ma grossesse. Une écoute attentive et des soins adaptés. Merci pour tout !",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/68.jpg"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-teal-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-lime-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-lime-400 font-semibold tracking-wider uppercase text-sm">Témoignages</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Ce que disent nos patients</h2>
            <div className="w-20 h-1 bg-lime-500 mx-auto rounded-full"></div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 relative"
            >
              <Quote className="absolute top-4 right-4 text-lime-500/20" size={48} />
              
              <div className="flex items-center gap-1 mb-4 text-lime-400">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>

              <p className="text-gray-300 mb-6 italic leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full border-2 border-lime-500/50"
                />
                <div>
                  <h4 className="font-bold text-white">{testimonial.name}</h4>
                  <span className="text-sm text-gray-400">{testimonial.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
