// Testimonials - Composant de témoignages clients
// Affiche une section de témoignages avec avis clients

import React, { useState } from 'react';

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
  content: string;
  rating: number;
  date?: string;
}

export interface TestimonialsProps {
  testimonials?: Testimonial[];
  title?: string;
  subtitle?: string;
  layout?: 'grid' | 'carousel' | 'masonry';
  columns?: 1 | 2 | 3 | 4;
  showAvatars?: boolean;
  showRatings?: boolean;
  showCompany?: boolean;
  backgroundColor?: string;
  textColor?: string;
  readOnly?: boolean;
  onTestimonialClick?: (testimonial: Testimonial) => void;
}

const Testimonials: React.FC<TestimonialsProps> = ({
  testimonials = [
    {
      id: '1',
      name: 'Jean Dupont',
      role: 'CEO',
      company: 'TechCorp',
      avatar: 'https://via.placeholder.com/100',
      content: 'Excellent service ! Notre satisfaction client a augmenté de 40% depuis que nous utilisons ce produit.',
      rating: 5,
      date: '2024-01-15'
    },
    {
      id: '2',
      name: 'Marie Martin',
      role: 'Marketing Director',
      company: 'Innovate Co',
      avatar: 'https://via.placeholder.com/100',
      content: 'Une solution vraiment innovante qui a transformé notre façon de travailler.',
      rating: 5,
      date: '2024-01-10'
    },
    {
      id: '3',
      name: 'Pierre Dubois',
      role: 'CTO',
      company: 'TechStart',
      avatar: 'https://via.placeholder.com/100',
      content: 'La qualité du support technique est exceptionnelle. Réponse rapide et efficace.',
      rating: 4,
      date: '2024-01-05'
    },
    {
      id: '4',
      name: 'Sophie Laurent',
      role: 'Product Manager',
      company: 'Digital Solutions',
      avatar: 'https://via.placeholder.com/100',
      content: 'Notre productivité a augmenté de 60% depuis l\'implémentation de cette solution.',
      rating: 5,
      date: '2024-01-20'
    }
  ],
  title = 'Ce que disent nos clients',
  subtitle = 'Découvrez les témoignages de nos clients satisfaits',
  layout = 'grid',
  columns = 3,
  showAvatars = true,
  showRatings = true,
  showCompany = true,
  backgroundColor = 'bg-white',
  textColor = 'text-gray-800',
  readOnly = false,
  onTestimonialClick
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Classes CSS dynamiques
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const layoutClasses = {
    grid: `grid gap-6 ${gridClasses[columns as keyof typeof gridClasses] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`,
    carousel: 'flex overflow-x-auto snap-x snap-mandatory scrollbar-hide',
    masonry: 'columns-1 md:columns-2 lg:columns-3 gap-6'
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const renderTestimonial = (testimonial: Testimonial, index: number) => (
    <div 
      key={testimonial.id}
      className={`bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer transform hover:-translate-y-1 ${
        layout === 'carousel' ? 'flex-shrink-0 w-80 snap-center' : ''
      }`}
      onClick={() => onTestimonialClick?.(testimonial)}
    >
      {/* En-tête du témoignage */}
      <div className="flex items-start mb-4">
        {showAvatars && testimonial.avatar && (
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-12 h-12 rounded-full mr-4"
          />
        )}
        <div>
          <div className="font-semibold text-gray-900">{testimonial.name}</div>
          <div className="text-sm text-gray-600">
            {testimonial.role}
            {testimonial.company && testimonial.company !== testimonial.role && `, ${testimonial.company}`}
          </div>
        </div>
      </div>

      {/* Note et étoiles */}
      {showRatings && (
        <div className="flex items-center mb-3">
          {renderStars(testimonial.rating)}
          {testimonial.date && (
            <span className="ml-4 text-sm text-gray-500">
              {new Date(testimonial.date).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      )}

      {/* Contenu du témoignage */}
      <blockquote className="text-gray-700 italic mb-4">
        "{testimonial.content}"
      </blockquote>

      {/* Informations supplémentaires */}
      {testimonial.company && showCompany && (
        <div className="text-sm text-gray-600 mt-2">
          <span className="font-medium">Entreprise :</span> {testimonial.company}
        </div>
      )}

      {testimonial.date && (
        <div className="text-sm text-gray-500 mt-2">
          {new Date(testimonial.date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className={`testimonials-component p-8 rounded-xl ${backgroundColor} ${textColor}`}>
      {/* En-tête de section */}
      <div className="text-center mb-8">
        {title && (
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
        )}
        {subtitle && (
          <p className="text-gray-600 mb-6">{subtitle}</p>
        )}
      </div>

      {/* Grille des témoignages */}
      {layout === 'grid' && (
        <div className={layoutClasses.grid}>
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="h-full">
              {renderTestimonial(testimonial, index)}
            </div>
          ))}
        </div>
      )}

      {layout === 'carousel' && (
        <div className="relative">
          <div className="flex space-x-6 overflow-x-auto pb-4">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id} className="flex-shrink-0 w-80">
                {renderTestimonial(testimonial, index)}
              </div>
            ))}
          </div>
        </div>
      )}

      {layout === 'masonry' && (
        <div className={layoutClasses.masonry}>
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="break-inside-avoid mb-6">
              {renderTestimonial(testimonial, index)}
            </div>
          ))}
        </div>
      )}

      {/* Indicateurs pour le carrousel */}
      {layout === 'carousel' && testimonials.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full ${
                index === activeIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-label={`Aller au témoignage ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Statistiques (optionnel) */}
      {!readOnly && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {testimonials.length} témoignages
            </div>
            {showRatings && (
              <div className="text-sm text-gray-600">
                Note moyenne :{' '}
                {(
                  testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
                ).toFixed(1)}
                /5
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;