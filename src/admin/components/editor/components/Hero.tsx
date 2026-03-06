// Hero - Composant de section d'accueil
// Section d'accueil avec titre, sous-titre et bouton d'action

import React from 'react';

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundColor?: string;
  textColor?: string;
  backgroundImage?: string;
  height?: 'small' | 'medium' | 'large' | 'full';
  align?: 'left' | 'center' | 'right';
  onUpdate?: (props: Partial<HeroProps>) => void;
}

const Hero: React.FC<HeroProps> = ({
  title = 'Titre principal',
  subtitle = 'Sous-titre descriptif',
  ctaText = 'En savoir plus',
  ctaLink = '#',
  backgroundColor = 'gradient-teal',
  textColor = 'white',
  backgroundImage,
  height = 'medium',
  align = 'center',
  onUpdate
}) => {
  // Obtenir les classes CSS en fonction des props
  const getHeightClass = () => {
    switch (height) {
      case 'small': return 'py-12';
      case 'medium': return 'py-16';
      case 'large': return 'py-24';
      case 'full': return 'py-32';
      default: return 'py-16';
    }
  };

  const getBackgroundClass = () => {
    if (backgroundImage) {
      return 'bg-cover bg-center';
    }
    
    switch (backgroundColor) {
      case 'gradient-teal': return 'bg-gradient-to-r from-teal-600 to-teal-800';
      case 'gradient-blue': return 'bg-gradient-to-r from-blue-600 to-blue-800';
      case 'gradient-purple': return 'bg-gradient-to-r from-purple-600 to-purple-800';
      case 'white': return 'bg-white';
      case 'gray': return 'bg-gray-100';
      case 'dark': return 'bg-gray-900';
      default: return 'bg-gradient-to-r from-teal-600 to-teal-800';
    }
  };

  const getTextColorClass = () => {
    switch (textColor) {
      case 'white': return 'text-white';
      case 'black': return 'text-gray-900';
      case 'gray': return 'text-gray-700';
      default: return 'text-white';
    }
  };

  const getAlignClass = () => {
    switch (align) {
      case 'left': return 'text-left';
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-center';
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onUpdate) onUpdate({ title: e.target.value });
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onUpdate) onUpdate({ subtitle: e.target.value });
  };

  const handleCtaTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onUpdate) onUpdate({ ctaText: e.target.value });
  };

  return (
    <div 
      className={`relative ${getHeightClass()} ${getBackgroundClass()} ${getTextColorClass()} overflow-hidden`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {/* Overlay pour les images de fond */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={getAlignClass()}>
          {/* Titre */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {onUpdate ? (
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-inherit text-center"
                placeholder="Titre principal"
              />
            ) : (
              title
            )}
          </h1>
          
          {/* Sous-titre */}
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            {onUpdate ? (
              <textarea
                value={subtitle}
                onChange={handleSubtitleChange}
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-inherit text-center resize-none"
                placeholder="Sous-titre descriptif"
                rows={2}
              />
            ) : (
              subtitle
            )}
          </p>
          
          {/* Bouton d'action */}
          {ctaText && (
            <div className="mt-8">
              {onUpdate ? (
                <div className="flex flex-col items-center space-y-4">
                  <input
                    type="text"
                    value={ctaText}
                    onChange={handleCtaTextChange}
                    className="px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-center text-white placeholder-white placeholder-opacity-70"
                    placeholder="Texte du bouton"
                  />
                  <a
                    href={ctaLink}
                    className="inline-block bg-white text-teal-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                  >
                    {ctaText}
                  </a>
                </div>
              ) : (
                <a
                  href={ctaLink}
                  className="inline-block bg-white text-teal-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                >
                  {ctaText}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
export type { HeroProps };