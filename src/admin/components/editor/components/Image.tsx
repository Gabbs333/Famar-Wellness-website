// Image - Composant d'image
// Image avec légende, redimensionnement et options d'affichage

import React, { useState } from 'react';

interface ImageProps {
  src?: string;
  alt?: string;
  caption?: string;
  width?: 'auto' | 'full' | 'half' | 'third' | 'quarter';
  align?: 'left' | 'center' | 'right';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  onUpdate?: (props: Partial<ImageProps>) => void;
  onSelectImage?: () => void;
}

const Image: React.FC<ImageProps> = ({
  src = 'https://via.placeholder.com/800x400',
  alt = 'Description de l\'image',
  caption = '',
  width = 'full',
  align = 'center',
  borderRadius = 'md',
  shadow = 'md',
  onUpdate,
  onSelectImage
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editAlt, setEditAlt] = useState(alt);
  const [editCaption, setEditCaption] = useState(caption);

  // Obtenir les classes CSS
  const getWidthClass = () => {
    switch (width) {
      case 'auto': return 'w-auto';
      case 'full': return 'w-full';
      case 'half': return 'w-1/2';
      case 'third': return 'w-1/3';
      case 'quarter': return 'w-1/4';
      default: return 'w-full';
    }
  };

  const getAlignClass = () => {
    switch (align) {
      case 'left': return 'float-left mr-4 mb-4';
      case 'center': return 'mx-auto';
      case 'right': return 'float-right ml-4 mb-4';
      default: return 'mx-auto';
    }
  };

  const getBorderRadiusClass = () => {
    switch (borderRadius) {
      case 'none': return 'rounded-none';
      case 'sm': return 'rounded-sm';
      case 'md': return 'rounded-md';
      case 'lg': return 'rounded-lg';
      case 'full': return 'rounded-full';
      default: return 'rounded-md';
    }
  };

  const getShadowClass = () => {
    switch (shadow) {
      case 'none': return 'shadow-none';
      case 'sm': return 'shadow-sm';
      case 'md': return 'shadow-md';
      case 'lg': return 'shadow-lg';
      default: return 'shadow-md';
    }
  };

  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditAlt(e.target.value);
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditCaption(e.target.value);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({ 
        alt: editAlt,
        caption: editCaption
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditAlt(alt);
    setEditCaption(caption);
    setIsEditing(false);
  };

  const handleImageClick = () => {
    if (onSelectImage) {
      onSelectImage();
    } else if (onUpdate) {
      setIsEditing(true);
    }
  };

  return (
    <div className={`${getWidthClass()} ${getAlignClass()} mb-4`}>
      <div className="relative group">
        {/* Image */}
        <img
          src={src}
          alt={alt}
          className={`${getBorderRadiusClass()} ${getShadowClass()} w-full h-auto object-cover cursor-pointer transition-transform duration-200 group-hover:scale-[1.02]`}
          onClick={handleImageClick}
        />
        
        {/* Overlay d'édition */}
        {onUpdate && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded shadow-sm hover:bg-gray-50"
            >
              Éditer
            </button>
          </div>
        )}
      </div>
      
      {/* Légende */}
      {caption && (
        <p className="text-center text-gray-600 text-sm mt-2 italic">
          {caption}
        </p>
      )}
      
      {/* Éditeur */}
      {isEditing && onUpdate && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Éditer l'image</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Texte alternatif (alt)
              </label>
              <input
                type="text"
                value={editAlt}
                onChange={handleAltChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Description de l'image pour l'accessibilité"
              />
              <p className="text-xs text-gray-500 mt-1">
                Important pour le SEO et l'accessibilité
              </p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Légende
              </label>
              <input
                type="text"
                value={editCaption}
                onChange={handleCaptionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Légende optionnelle"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Largeur
                </label>
                <select
                  value={width}
                  onChange={(e) => onUpdate({ width: e.target.value as ImageProps['width'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="auto">Auto</option>
                  <option value="full">Pleine largeur</option>
                  <option value="half">Moitié</option>
                  <option value="third">Tiers</option>
                  <option value="quarter">Quart</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Alignement
                </label>
                <select
                  value={align}
                  onChange={(e) => onUpdate({ align: e.target.value as ImageProps['align'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="left">Gauche</option>
                  <option value="center">Centre</option>
                  <option value="right">Droite</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Coins arrondis
                </label>
                <select
                  value={borderRadius}
                  onChange={(e) => onUpdate({ borderRadius: e.target.value as ImageProps['borderRadius'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="none">Aucun</option>
                  <option value="sm">Petit</option>
                  <option value="md">Moyen</option>
                  <option value="lg">Grand</option>
                  <option value="full">Rond</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ombre
                </label>
                <select
                  value={shadow}
                  onChange={(e) => onUpdate({ shadow: e.target.value as ImageProps['shadow'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="none">Aucune</option>
                  <option value="sm">Petite</option>
                  <option value="md">Moyenne</option>
                  <option value="lg">Grande</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Image;
export type { ImageProps };