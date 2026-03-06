// ComponentLibrary - Bibliothèque de composants drag & drop
// Permet de sélectionner et d'ajouter des composants à la page

import React, { useState, useEffect } from 'react';
import { getComponentRegistry, convertToComponentDefinition, RegisteredComponent } from './components/ComponentRegistry';

interface ComponentLibraryProps {
  onSelectComponent: (type: string, props?: Record<string, any>) => void;
  onRegisterComponent?: (component: RegisteredComponent) => void;
}

interface ComponentDefinition {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  defaultProps: Record<string, any>;
  preview: React.ReactNode;
  isRegistered?: boolean;
  registeredComponent?: RegisteredComponent;
}

// Définitions des composants intégrés
const builtinComponentDefinitions: ComponentDefinition[] = [
  {
    id: 'hero',
    type: 'hero',
    name: 'Hero Section',
    description: "Section d'accueil avec titre, sous-titre et bouton d'action",
    icon: (
      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    category: 'sections',
    defaultProps: {
      title: 'Titre principal',
      subtitle: 'Sous-titre descriptif',
      ctaText: 'En savoir plus',
      backgroundColor: 'gradient-teal',
      textColor: 'white'
    },
    preview: (
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white p-4 rounded h-20 flex items-center justify-center">
        <div className="text-center">
          <div className="font-bold">Hero</div>
          <div className="text-xs opacity-80">Titre + CTA</div>
        </div>
      </div>
    )
  },
  {
    id: 'text',
    type: 'text',
    name: 'Bloc de texte',
    description: 'Éditeur de texte riche avec formatage',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    category: 'content',
    defaultProps: {
      content: '<p>Votre texte ici...</p>',
      textAlign: 'left',
      maxWidth: 'full'
    },
    preview: (
      <div className="bg-white border border-gray-300 p-4 rounded h-20 flex items-center justify-center">
        <div className="text-center">
          <div className="font-bold text-gray-700">Texte</div>
          <div className="text-xs text-gray-500">Contenu éditable</div>
        </div>
      </div>
    )
  },
  {
    id: 'image',
    type: 'image',
    name: 'Image',
    description: 'Image avec légende et options de redimensionnement',
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    category: 'media',
    defaultProps: {
      src: 'https://via.placeholder.com/800x400',
      alt: "Description de l'image",
      caption: '',
      width: 'full',
      align: 'center'
    },
    preview: (
      <div className="bg-gray-100 border border-gray-300 p-4 rounded h-20 flex items-center justify-center">
        <div className="text-center">
          <div className="font-bold text-gray-700">Image</div>
          <div className="text-xs text-gray-500">Avec légende</div>
        </div>
      </div>
    )
  },
  {
    id: 'gallery',
    type: 'gallery',
    name: "Galerie d'images",
    description: "Grille d'images avec lightbox",
    icon: (
      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    category: 'media',
    defaultProps: {
      images: [],
      columns: 3,
      spacing: 'medium',
      showCaptions: false
    },
    preview: (
      <div className="bg-gray-100 border border-gray-300 p-4 rounded h-20 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="w-4 h-4 bg-gray-400 rounded"></div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'card',
    type: 'card',
    name: 'Carte',
    description: 'Carte avec titre, contenu et bouton',
    icon: (
      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    category: 'content',
    defaultProps: {
      title: 'Titre de la carte',
      content: 'Contenu de la carte...',
      buttonText: 'En savoir plus',
      buttonLink: '#',
      variant: 'default'
    },
    preview: (
      <div className="bg-white border border-gray-300 p-4 rounded h-20 flex items-center justify-center">
        <div className="text-center">
          <div className="font-bold text-gray-700">Carte</div>
          <div className="text-xs text-gray-500">Titre + Contenu</div>
        </div>
      </div>
    )
  },
  {
    id: 'testimonials',
    type: 'testimonials',
    name: 'Témoignages',
    description: 'Section de témoignages clients',
    icon: (
      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    category: 'sections',
    defaultProps: {
      title: 'Ce que disent nos clients',
      testimonials: [],
      layout: 'grid',
      showAvatars: true
    },
    preview: (
      <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 p-4 rounded h-20 flex items-center justify-center">
        <div className="text-center">
          <div className="font-bold text-gray-700">Témoignages</div>
          <div className="text-xs text-gray-500">Clients satisfaits</div>
        </div>
      </div>
    )
  },
  {
    id: 'cta',
    type: 'cta',
    name: 'Call to Action',
    description: "Section d'appel à l'action",
    icon: (
      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    category: 'sections',
    defaultProps: {
      title: 'Prêt à commencer?',
      subtitle: "Rejoignez-nous dès aujourd'hui",
      buttonText: 'Commencer maintenant',
      buttonLink: '#',
      backgroundColor: 'blue'
    },
    preview: (
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded h-20 flex items-center justify-center">
        <div className="text-center">
          <div className="font-bold">CTA</div>
          <div className="text-xs opacity-80">Appel à l'action</div>
        </div>
      </div>
    )
  },
  {
    id: 'contact',
    type: 'contact',
    name: 'Formulaire de contact',
    description: 'Formulaire de contact avec validation',
    icon: (
      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    category: 'forms',
    defaultProps: {
      title: 'Contactez-nous',
      subtitle: 'Nous répondrons rapidement',
      fields: ['name', 'email', 'message'],
      submitText: 'Envoyer'
    },
    preview: (
      <div className="bg-white border border-indigo-300 p-4 rounded h-20 flex items-center justify-center">
        <div className="text-center">
          <div className="font-bold text-gray-700">Contact</div>
          <div className="text-xs text-gray-500">Formulaire</div>
        </div>
      </div>
    )
  }
];

const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ onSelectComponent, onRegisterComponent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [registeredComponents, setRegisteredComponents] = useState<ComponentDefinition[]>([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedComponentForRegistration, setSelectedComponentForRegistration] = useState<ComponentDefinition | null>(null);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    description: '',
    category: 'custom',
    tags: [] as string[],
    isPublic: true
  });

  // Charger les composants enregistrés
  useEffect(() => {
    const registry = getComponentRegistry();
    const registered = registry.getAllComponents().map(comp => 
      convertToComponentDefinition(comp)
    );
    setRegisteredComponents(registered);
  }, []);

  // Catégories disponibles
  const categories = [
    { id: 'all', name: 'Tous les composants' },
    { id: 'sections', name: 'Sections' },
    { id: 'content', name: 'Contenu' },
    { id: 'media', name: 'Médias' },
    { id: 'forms', name: 'Formulaires' },
    { id: 'custom', name: 'Personnalisés' }
  ];

  // Tous les composants (intégrés + enregistrés)
  const allComponents = [...builtinComponentDefinitions, ...registeredComponents];

  // Filtrer les composants
  const filteredComponents = allComponents.filter(component => {
    const matchesSearch = searchTerm === '' || 
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Gérer le drag & drop
  const handleDragStart = (e: React.DragEvent, component: ComponentDefinition) => {
    e.dataTransfer.setData('component/type', component.type);
    e.dataTransfer.setData('component/props', JSON.stringify(component.defaultProps));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Gérer le clic pour ajouter un composant
  const handleComponentClick = (component: ComponentDefinition) => {
    onSelectComponent(component.type, component.defaultProps);
    
    // Incrémenter le compteur d'utilisation pour les composants enregistrés
    if (component.isRegistered && component.registeredComponent) {
      const registry = getComponentRegistry();
      registry.incrementUsage(component.registeredComponent.id);
    }
  };

  // Gérer l'enregistrement d'un composant
  const handleRegisterComponent = (component: ComponentDefinition) => {
    setSelectedComponentForRegistration(component);
    setRegistrationData({
      name: component.name,
      description: component.description,
      category: component.category,
      tags: [],
      isPublic: true
    });
    setShowRegistrationForm(true);
  };

  const handleSubmitRegistration = () => {
    if (!selectedComponentForRegistration) return;

    const registry = getComponentRegistry();
    const registeredComponent = registry.registerFromExisting(
      registrationData.name,
      registrationData.description,
      selectedComponentForRegistration.type,
      selectedComponentForRegistration.defaultProps,
      registrationData.category,
      {
        tags: registrationData.tags,
        isPublic: registrationData.isPublic
      }
    );

    if (onRegisterComponent) {
      onRegisterComponent(registeredComponent);
    }

    // Recharger les composants enregistrés
    const registry2 = getComponentRegistry();
    const registered = registry2.getAllComponents().map(comp => 
      convertToComponentDefinition(comp)
    );
    setRegisteredComponents(registered);
    
    // Fermer le formulaire
    setShowRegistrationForm(false);
    setSelectedComponentForRegistration(null);
    setRegistrationData({
      name: '',
      description: '',
      category: 'custom',
      tags: [],
      isPublic: true
    });
  };

  const handleDeleteRegisteredComponent = (componentId: string) => {
    const registry = getComponentRegistry();
    registry.deleteComponent(componentId);
    
    // Recharger les composants enregistrés
    const registered = registry.getAllComponents().map(comp => 
      convertToComponentDefinition(comp)
    );
    setRegisteredComponents(registered);
  };

  return (
    <div className="h-full flex flex-col">
      {/* En-tête de la bibliothèque */}
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Bibliothèque de composants</h2>
        
        {/* Barre de recherche */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un composant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 text-sm rounded-lg ${selectedCategory === category.id ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des composants */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredComponents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">Aucun composant trouvé</p>
            <p className="text-sm mt-2">Essayez une autre recherche ou catégorie</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredComponents.map(component => (
              <div
                key={component.id}
                draggable
                onDragStart={(e) => handleDragStart(e, component)}
                onClick={() => handleComponentClick(component)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-teal-300 hover:shadow-md cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-start">
                  {/* Icône du composant */}
                  <div className="mr-3 mt-1">
                    {component.icon}
                  </div>

                  {/* Informations du composant */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 group-hover:text-teal-700">
                        {component.name}
                        {component.isRegistered && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                            Enregistré
                          </span>
                        )}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {component.category}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {component.description}
                    </p>

                    {/* Aperçu du composant */}
                    <div className="mt-3">
                      {component.preview}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-gray-500">
                        Glisser-déposer ou cliquer pour ajouter
                      </div>
                      <div className="flex space-x-2">
                        {!component.isRegistered && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRegisterComponent(component);
                            }}
                            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                            title="Enregistrer comme réutilisable"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                          </button>
                        )}
                        {component.isRegistered && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRegisteredComponent(component.id);
                            }}
                            className="text-sm text-red-600 hover:text-red-800"
                            title="Supprimer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComponentClick(component);
                          }}
                          className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire d'enregistrement */}
      {showRegistrationForm && selectedComponentForRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Enregistrer le composant
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du composant
                  </label>
                  <input
                    type="text"
                    value={registrationData.name}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Donnez un nom à votre composant"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={registrationData.description}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows={3}
                    placeholder="Décrivez ce composant"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={registrationData.category}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {categories.filter(c => c.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={registrationData.tags.join(', ')}
                    onChange={(e) => setRegistrationData(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={registrationData.isPublic}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                    Rendre ce composant public
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRegistrationForm(false);
                    setSelectedComponentForRegistration(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitRegistration}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pied de page avec instructions */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="text-sm text-gray-600">
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Comment utiliser:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Cliquez sur un composant pour l'ajouter à la page</li>
            <li>Glissez-déposez pour positionner précisément</li>
            <li>Enregistrez vos composants favoris pour les réutiliser</li>
            <li>Filtrez par catégorie ou utilisez la recherche</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComponentLibrary;