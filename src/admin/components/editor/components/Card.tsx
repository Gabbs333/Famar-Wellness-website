// Card - Composant de carte
// Affiche une carte avec titre, contenu et bouton d'action

import React from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  content?: string;
  image?: {
    src: string;
    alt: string;
    position?: 'top' | 'left' | 'right';
  };
  button?: {
    text: string;
    link: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    icon?: React.ReactNode;
  };
  variant?: 'default' | 'elevated' | 'outline' | 'filled';
  align?: 'left' | 'center' | 'right';
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  backgroundColor?: string;
  textColor?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  readOnly?: boolean;
  onButtonClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  title = 'Titre de la carte',
  subtitle = '',
  content = 'Contenu de la carte. Vous pouvez ajouter du texte, des images ou d\'autres éléments ici.',
  image,
  button = {
    text: 'En savoir plus',
    link: '#',
    variant: 'primary'
  },
  variant = 'default',
  align = 'left',
  maxWidth = 'md',
  shadow = 'md',
  borderRadius = 'md',
  backgroundColor = 'white',
  textColor = 'gray-800',
  padding = 'md',
  readOnly = false,
  onButtonClick
}) => {
  // Classes CSS dynamiques
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg border-0',
    outline: 'bg-transparent border-2 border-gray-300',
    filled: 'bg-gray-50 border-0'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const maxWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full'
  };

  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const borderRadiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const buttonVariantClasses = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100'
  };

  const textColorClasses = {
    'gray-800': 'text-gray-800',
    'gray-700': 'text-gray-700',
    'gray-900': 'text-gray-900',
    'white': 'text-white',
    'black': 'text-black'
  };

  const backgroundColorClasses = {
    'white': 'bg-white',
    'gray-50': 'bg-gray-50',
    'gray-100': 'bg-gray-100',
    'teal-50': 'bg-teal-50',
    'blue-50': 'bg-blue-50',
    'transparent': 'bg-transparent'
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onButtonClick) {
      onButtonClick();
    }
    if (!readOnly && button.link && button.link !== '#') {
      window.open(button.link, '_blank');
    }
  };

  const renderImage = () => {
    if (!image) return null;

    const imagePositionClasses = {
      top: 'w-full',
      left: 'w-1/3 mr-4',
      right: 'w-1/3 ml-4 order-last'
    };

    return (
      <div className={`${imagePositionClasses[image.position || 'top']} ${image.position === 'top' ? 'mb-4' : ''}`}>
        <img
          src={image.src}
          alt={image.alt}
          className={`w-full h-auto object-cover ${borderRadiusClasses[borderRadius]} ${image.position === 'top' ? '' : 'h-48'}`}
        />
      </div>
    );
  };

  const renderContent = () => (
    <div className={`flex-1 ${alignClasses[align]}`}>
      {/* Titre et sous-titre */}
      <div className="mb-3">
        <h3 className={`text-xl font-bold ${textColorClasses[textColor as keyof typeof textColorClasses] || 'text-gray-800'}`}>
          {title}
        </h3>
        {subtitle && (
          <p className={`text-sm mt-1 ${textColorClasses[textColor as keyof typeof textColorClasses]?.replace('text-', 'text-').replace('800', '600') || 'text-gray-600'}`}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Contenu */}
      <div 
        className={`prose prose-sm max-w-none mb-4 ${textColorClasses[textColor as keyof typeof textColorClasses]?.replace('text-', 'text-').replace('800', '700') || 'text-gray-700'}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Bouton */}
      {button && button.text && (
        <div className={`mt-4 ${align === 'center' ? 'flex justify-center' : align === 'right' ? 'flex justify-end' : ''}`}>
          <a
            href={button.link}
            onClick={handleButtonClick}
            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${buttonVariantClasses[button.variant || 'primary']} ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            {button.icon && <span className="mr-2">{button.icon}</span>}
            {button.text}
          </a>
        </div>
      )}
    </div>
  );

  return (
    <div className={`card-component ${maxWidthClasses[maxWidth]} mx-auto`}>
      <div className={`${variantClasses[variant]} ${borderRadiusClasses[borderRadius]} ${shadowClasses[shadow]} ${paddingClasses[padding]} ${backgroundColorClasses[backgroundColor as keyof typeof backgroundColorClasses] || 'bg-white'}`}>
        {image ? (
          <div className={`flex ${image.position === 'left' ? 'flex-row' : image.position === 'right' ? 'flex-row-reverse' : 'flex-col'}`}>
            {renderImage()}
            {renderContent()}
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};

export default Card;