// CTA - Composant Call to Action
// Section d'appel à l'action avec titre, sous-titre et bouton

import React from 'react';

export interface CTAProps {
  title?: string;
  subtitle?: string;
  button?: {
    text: string;
    link: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    icon?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  };
  secondaryButton?: {
    text: string;
    link: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    icon?: React.ReactNode;
  };
  layout?: 'centered' | 'left' | 'right' | 'split';
  backgroundColor?: string;
  textColor?: string;
  backgroundImage?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  readOnly?: boolean;
  onPrimaryButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
}

const CTA: React.FC<CTAProps> = ({
  title = 'Prêt à commencer ?',
  subtitle = 'Rejoignez-nous dès aujourd\'hui et découvrez comment nous pouvons vous aider à atteindre vos objectifs.',
  button = {
    text: 'Commencer maintenant',
    link: '#',
    variant: 'primary',
    size: 'lg'
  },
  secondaryButton,
  layout = 'centered',
  backgroundColor = 'bg-gradient-to-r from-teal-600 to-teal-800',
  textColor = 'text-white',
  backgroundImage,
  padding = 'lg',
  borderRadius = 'lg',
  shadow = 'lg',
  readOnly = false,
  onPrimaryButtonClick,
  onSecondaryButtonClick
}) => {
  // Classes CSS dynamiques
  const layoutClasses = {
    centered: 'text-center',
    left: 'text-left',
    right: 'text-right',
    split: 'flex flex-col md:flex-row items-center justify-between text-left'
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  const borderRadiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const buttonVariantClasses = {
    primary: 'bg-white text-teal-700 hover:bg-gray-100',
    secondary: 'bg-transparent border-2 border-white text-white hover:bg-white/10',
    outline: 'bg-transparent border-2 border-gray-300 text-gray-800 hover:bg-gray-50',
    ghost: 'bg-transparent text-white hover:bg-white/10'
  };

  const buttonSizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  const handlePrimaryButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPrimaryButtonClick) {
      onPrimaryButtonClick();
    }
    if (!readOnly && button.link && button.link !== '#') {
      window.open(button.link, '_blank');
    }
  };

  const handleSecondaryButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSecondaryButtonClick) {
      onSecondaryButtonClick();
    }
    if (!readOnly && secondaryButton?.link && secondaryButton.link !== '#') {
      window.open(secondaryButton.link, '_blank');
    }
  };

  const renderContent = () => (
    <div className={layout === 'split' ? 'md:w-2/3' : 'w-full'}>
      {/* Titre */}
      <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textColor}`}>
        {title}
      </h2>
      
      {/* Sous-titre */}
      {subtitle && (
        <p className={`text-lg mb-6 ${textColor} ${textColor.includes('white') ? 'opacity-90' : 'opacity-80'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );

  const renderButtons = () => (
    <div className={`flex flex-wrap gap-4 ${layout === 'centered' ? 'justify-center' : layout === 'right' ? 'justify-end' : ''}`}>
      {/* Bouton principal */}
      {button && button.text && (
        <a
          href={button.link}
          onClick={handlePrimaryButtonClick}
          className={`inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 ${buttonVariantClasses[button.variant || 'primary']} ${buttonSizeClasses[button.size || 'lg']} ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          {button.icon && <span className="mr-2">{button.icon}</span>}
          {button.text}
        </a>
      )}
      
      {/* Bouton secondaire */}
      {secondaryButton && secondaryButton.text && (
        <a
          href={secondaryButton.link}
          onClick={handleSecondaryButtonClick}
          className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 ${buttonVariantClasses[secondaryButton.variant || 'secondary']} px-6 py-3 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          {secondaryButton.icon && <span className="mr-2">{secondaryButton.icon}</span>}
          {secondaryButton.text}
        </a>
      )}
    </div>
  );

  return (
    <div className="cta-component">
      <div 
        className={`relative overflow-hidden ${paddingClasses[padding]} ${borderRadiusClasses[borderRadius]} ${shadowClasses[shadow]} ${backgroundColor}`}
        style={backgroundImage ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        {/* Overlay pour les images de fond */}
        {backgroundImage && (
          <div className="absolute inset-0 bg-black/50"></div>
        )}
        
        <div className={`relative ${layoutClasses[layout]} ${layout === 'split' ? 'items-center' : ''}`}>
          {layout === 'split' ? (
            <>
              {renderContent()}
              <div className="md:w-1/3 mt-6 md:mt-0">
                {renderButtons()}
              </div>
            </>
          ) : (
            <>
              {renderContent()}
              {renderButtons()}
            </>
          )}
        </div>
        
        {/* Éléments décoratifs */}
        {!backgroundImage && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        )}
      </div>
      
      {/* Informations supplémentaires */}
      {!readOnly && (
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Cliquez sur les boutons pour tester les liens d'action</p>
        </div>
      )}
    </div>
  );
};

export default CTA;