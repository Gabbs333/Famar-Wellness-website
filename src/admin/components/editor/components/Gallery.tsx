// Gallery - Composant de galerie d'images
// Affiche une grille d'images avec lightbox

import React, { useState } from 'react';

export interface GalleryProps {
  images?: Array<{
    id: string;
    src: string;
    alt: string;
    caption?: string;
    width?: number;
    height?: number;
  }>;
  columns?: 1 | 2 | 3 | 4;
  spacing?: 'none' | 'small' | 'medium' | 'large';
  showCaptions?: boolean;
  lightbox?: boolean;
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  onImageClick?: (imageId: string) => void;
  readOnly?: boolean;
}

const Gallery: React.FC<GalleryProps> = ({
  images = [
    { id: '1', src: 'https://via.placeholder.com/400x300', alt: 'Image 1', caption: 'Première image' },
    { id: '2', src: 'https://via.placeholder.com/400x300', alt: 'Image 2', caption: 'Deuxième image' },
    { id: '3', src: 'https://via.placeholder.com/400x300', alt: 'Image 3', caption: 'Troisième image' },
    { id: '4', src: 'https://via.placeholder.com/400x300', alt: 'Image 4', caption: 'Quatrième image' },
    { id: '5', src: 'https://via.placeholder.com/400x300', alt: 'Image 5', caption: 'Cinquième image' },
    { id: '6', src: 'https://via.placeholder.com/400x300', alt: 'Image 6', caption: 'Sixième image' }
  ],
  columns = 3,
  spacing = 'medium',
  showCaptions = false,
  lightbox = true,
  aspectRatio = 'landscape',
  borderRadius = 'md',
  shadow = 'md',
  onImageClick,
  readOnly = false
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Classes CSS dynamiques
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  };

  const spacingClasses = {
    none: 'gap-0',
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6'
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    landscape: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: ''
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
    lg: 'shadow-lg'
  };

  const handleImageClick = (imageId: string) => {
    if (lightbox) {
      setSelectedImage(imageId);
    }
    if (onImageClick) {
      onImageClick(imageId);
    }
  };

  const handleCloseLightbox = () => {
    setSelectedImage(null);
  };

  const handlePrevImage = () => {
    if (selectedImage) {
      const currentIndex = images.findIndex(img => img.id === selectedImage);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      setSelectedImage(images[prevIndex].id);
    }
  };

  const handleNextImage = () => {
    if (selectedImage) {
      const currentIndex = images.findIndex(img => img.id === selectedImage);
      const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      setSelectedImage(images[nextIndex].id);
    }
  };

  return (
    <div className="gallery-component">
      {/* Grille d'images */}
      <div className={`grid ${gridClasses[columns]} ${spacingClasses[spacing]}`}>
        {images.map(image => (
          <div 
            key={image.id}
            className={`relative overflow-hidden ${borderRadiusClasses[borderRadius]} ${shadowClasses[shadow]} transition-transform duration-300 hover:scale-[1.02] ${lightbox ? 'cursor-pointer' : ''}`}
            onClick={() => handleImageClick(image.id)}
          >
            {/* Conteneur d'image */}
            <div className={`${aspectRatioClasses[aspectRatio]} overflow-hidden bg-gray-100`}>
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            
            {/* Légende */}
            {showCaptions && image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-white text-sm font-medium">{image.caption}</p>
              </div>
            )}
            
            {/* Overlay au survol */}
            {lightbox && !readOnly && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                <div className="bg-white/90 rounded-full p-2">
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m0 0l3-3m-3 3l-3-3" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && lightbox && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={handleCloseLightbox}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
            {/* Bouton fermer */}
            <button
              onClick={handleCloseLightbox}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Navigation */}
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Image sélectionnée */}
            {(() => {
              const image = images.find(img => img.id === selectedImage);
              if (!image) return null;
              
              return (
                <div className="flex flex-col items-center">
                  <div className="relative w-full h-[70vh]">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Informations de l'image */}
                  <div className="mt-4 text-white text-center max-w-2xl">
                    <h3 className="text-xl font-semibold">{image.alt}</h3>
                    {image.caption && (
                      <p className="mt-2 text-gray-300">{image.caption}</p>
                    )}
                    <div className="mt-4 text-sm text-gray-400">
                      Image {images.findIndex(img => img.id === selectedImage) + 1} sur {images.length}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* État vide */}
      {images.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600">Aucune image dans la galerie</p>
          <p className="text-sm text-gray-500 mt-1">
            {readOnly ? 'La galerie est vide' : 'Ajoutez des images pour les afficher ici'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Gallery;