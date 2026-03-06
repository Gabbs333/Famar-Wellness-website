// Text - Composant de bloc de texte
// Bloc de texte avec formatage riche et options de mise en page

import React, { useState } from 'react';

interface TextProps {
  content?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  backgroundColor?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  onUpdate?: (props: Partial<TextProps>) => void;
  readOnly?: boolean;
}

const Text: React.FC<TextProps> = ({
  content = '<p>Votre texte ici...</p>',
  textAlign = 'left',
  maxWidth = 'full',
  backgroundColor = 'transparent',
  padding = 'medium',
  onUpdate,
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  // Obtenir les classes CSS
  const getAlignClass = () => {
    switch (textAlign) {
      case 'left': return 'text-left';
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      case 'justify': return 'text-justify';
      default: return 'text-left';
    }
  };

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-full';
    }
  };

  const getBackgroundClass = () => {
    switch (backgroundColor) {
      case 'white': return 'bg-white';
      case 'gray': return 'bg-gray-50';
      case 'teal': return 'bg-teal-50';
      case 'blue': return 'bg-blue-50';
      case 'transparent': return 'bg-transparent';
      default: return 'bg-transparent';
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case 'none': return 'p-0';
      case 'small': return 'p-4';
      case 'medium': return 'p-6';
      case 'large': return 'p-8';
      default: return 'p-6';
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({ content: editContent });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  const handleDoubleClick = () => {
    if (!readOnly && onUpdate) {
      setIsEditing(true);
    }
  };

  return (
    <div 
      className={`${getMaxWidthClass()} ${getBackgroundClass()} ${getPaddingClass()} rounded-lg`}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing && onUpdate ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700">Éditer le texte</h3>
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
          
          <textarea
            value={editContent}
            onChange={handleContentChange}
            className="w-full h-64 font-mono text-sm border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Entrez votre texte HTML ici..."
          />
          
          <div className="text-xs text-gray-500">
            <p className="font-medium mb-1">Conseils de formatage :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Utilisez <code>&lt;p&gt;</code> pour les paragraphes</li>
              <li>Utilisez <code>&lt;h1&gt;</code> à <code>&lt;h6&gt;</code> pour les titres</li>
              <li>Utilisez <code>&lt;strong&gt;</code> ou <code>&lt;b&gt;</code> pour le gras</li>
              <li>Utilisez <code>&lt;em&gt;</code> ou <code>&lt;i&gt;</code> pour l'italique</li>
              <li>Utilisez <code>&lt;ul&gt;</code> et <code>&lt;li&gt;</code> pour les listes</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className={`prose prose-teal max-w-none ${getAlignClass()}`}>
          <div dangerouslySetInnerHTML={{ __html: content }} />
          
          {!readOnly && onUpdate && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Double-cliquez pour éditer le contenu
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Text;
export type { TextProps };