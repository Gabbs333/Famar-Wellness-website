// PreviewPanel - Panneau de prévisualisation de page
// Affiche une prévisualisation de la page telle qu'elle apparaîtra sur le site

import React from 'react';
import { ComponentData } from './PageEditor';

interface PreviewPanelProps {
  title: string;
  content: string;
  components: ComponentData[];
  featuredImage?: string;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  title,
  content,
  components,
  featuredImage
}) => {
  // Rendu des composants dans la prévisualisation
  const renderComponent = (component: ComponentData) => {
    switch (component.type) {
      case 'hero':
        return (
          <div key={component.id} className="relative bg-gradient-to-r from-teal-600 to-teal-800 text-white py-16 px-4 rounded-lg mb-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">{component.props.title || 'Titre Hero'}</h1>
              <p className="text-xl mb-6 opacity-90">{component.props.subtitle || 'Sous-titre du hero'}</p>
              {component.props.ctaText && (
                <button className="bg-white text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                  {component.props.ctaText}
                </button>
              )}
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div key={component.id} className="prose max-w-none mb-6">
            <div dangerouslySetInnerHTML={{ __html: component.content || '<p>Contenu texte...</p>' }} />
          </div>
        );
      
      case 'image':
        return (
          <div key={component.id} className="mb-6">
            <img 
              src={component.props.src || 'https://via.placeholder.com/800x400'} 
              alt={component.props.alt || 'Image'} 
              className="w-full h-auto rounded-lg"
            />
            {component.props.caption && (
              <p className="text-center text-gray-600 text-sm mt-2">{component.props.caption}</p>
            )}
          </div>
        );
      
      case 'gallery':
        return (
          <div key={component.id} className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Image {i}
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'card':
        return (
          <div key={component.id} className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-3">{component.props.title || 'Carte'}</h3>
            <p className="text-gray-600 mb-4">{component.props.content || 'Contenu de la carte...'}</p>
            {component.props.buttonText && (
              <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
                {component.props.buttonText}
              </button>
            )}
          </div>
        );
      
      default:
        return (
          <div key={component.id} className="bg-gray-100 border border-gray-300 rounded p-4 mb-4">
            <div className="text-gray-700 font-medium mb-1">Composant: {component.type}</div>
            <div className="text-sm text-gray-600">
              {JSON.stringify(component.props, null, 2)}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="preview-container bg-white rounded-lg shadow-lg overflow-hidden">
      {/* En-tête de prévisualisation */}
      <div className="bg-gray-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Prévisualisation</h2>
            <p className="text-gray-300 text-sm">Aperçu de la page telle qu'elle apparaîtra sur le site</p>
          </div>
          <div className="text-sm">
            <span className="bg-green-600 text-white px-2 py-1 rounded">En ligne</span>
          </div>
        </div>
      </div>

      {/* Contenu de prévisualisation */}
      <div className="p-6">
        {/* Barre de navigation simulée */}
        <div className="bg-white border-b border-gray-200 mb-8">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-teal-600">Famar Wellness</div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-700 hover:text-teal-600">Accueil</a>
                <a href="#" className="text-gray-700 hover:text-teal-600">Services</a>
                <a href="#" className="text-gray-700 hover:text-teal-600">Blog</a>
                <a href="#" className="text-gray-700 hover:text-teal-600">Contact</a>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-4xl mx-auto">
          {/* Image en vedette */}
          {featuredImage && (
            <div className="mb-8">
              <img 
                src={featuredImage} 
                alt={title} 
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Titre de la page */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{title}</h1>

          {/* Composants */}
          {components.length > 0 ? (
            <div className="space-y-8">
              {components.map(renderComponent)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">Aucun composant ajouté à cette page</p>
              <p className="text-sm mt-2">Ajoutez des composants depuis la bibliothèque pour les voir ici</p>
            </div>
          )}

          {/* Contenu éditeur */}
          {content && content !== '<p></p>' && (
            <div className="mt-8">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          )}

          {/* Pied de page simulé */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="text-center text-gray-600">
              <p>© {new Date().getFullYear()} Famar Wellness. Tous droits réservés.</p>
              <div className="mt-2 text-sm">
                <a href="#" className="text-teal-600 hover:text-teal-800 mx-2">Mentions légales</a>
                <a href="#" className="text-teal-600 hover:text-teal-800 mx-2">Politique de confidentialité</a>
                <a href="#" className="text-teal-600 hover:text-teal-800 mx-2">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'information en bas */}
      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <span className="font-medium">URL:</span> 
            <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">
              /{title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span>Version publiée</span>
            </div>
            <div>
              <span className="font-medium">Dernière mise à jour:</span> 
              <span className="ml-2">{new Date().toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;