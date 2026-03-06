// Pages.tsx - Page de gestion des pages CMS
// Interface pour créer, éditer et gérer les pages du site

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageEditor from '../components/editor/PageEditor';

const Pages: React.FC = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  // Données simulées pour les pages
  const mockPages = [
    { id: '1', title: 'Accueil', slug: 'accueil', status: 'published', updatedAt: '2024-01-15', author: 'Admin' },
    { id: '2', title: 'Services', slug: 'services', status: 'published', updatedAt: '2024-01-10', author: 'Admin' },
    { id: '3', title: 'À propos', slug: 'a-propos', status: 'draft', updatedAt: '2024-01-12', author: 'Editor' },
    { id: '4', title: 'Contact', slug: 'contact', status: 'published', updatedAt: '2024-01-05', author: 'Admin' },
    { id: '5', title: 'Blog', slug: 'blog', status: 'published', updatedAt: '2024-01-08', author: 'Editor' },
  ];

  // Gérer la sauvegarde d'une page
  const handleSavePage = async (content: string, metadata: any) => {
    console.log('Sauvegarde de la page:', { content, metadata });
    // Ici, on enverrait les données à l'API
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Gérer la publication d'une page
  const handlePublishPage = async (content: string, metadata: any) => {
    console.log('Publication de la page:', { content, metadata });
    // Ici, on enverrait les données à l'API
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Ouvrir l'éditeur pour une nouvelle page
  const handleNewPage = () => {
    setSelectedPage(null);
    setShowEditor(true);
  };

  // Ouvrir l'éditeur pour une page existante
  const handleEditPage = (pageId: string) => {
    setSelectedPage(pageId);
    setShowEditor(true);
  };

  // Fermer l'éditeur
  const handleCloseEditor = () => {
    setShowEditor(false);
    setSelectedPage(null);
  };

  return (
    <div className="p-6">
      {showEditor ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {selectedPage ? 'Éditer la page' : 'Nouvelle page'}
              </h1>
              <p className="text-gray-600">
                Utilisez l'éditeur pour créer ou modifier le contenu de votre page
              </p>
            </div>
            <button
              onClick={handleCloseEditor}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Retour à la liste
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <PageEditor
              pageTitle={selectedPage ? 'Page existante' : 'Nouvelle page'}
              onSave={handleSavePage}
              onPublish={handlePublishPage}
              autoSaveInterval={30000}
            />
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestion des pages</h1>
              <p className="text-gray-600">
                Créez, éditez et gérez les pages de votre site web
              </p>
            </div>
            <button
              onClick={handleNewPage}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nouvelle page
            </button>
          </div>

          {/* Liste des pages */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Pages du site</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher une page..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="all">Tous les statuts</option>
                    <option value="published">Publié</option>
                    <option value="draft">Brouillon</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Titre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière modification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auteur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockPages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{page.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">/{page.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          page.status === 'published' ? 'bg-green-100 text-green-800' :
                          page.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {page.status === 'published' ? 'Publié' : 
                           page.status === 'draft' ? 'Brouillon' : 'Archivé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(page.updatedAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {page.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPage(page.id)}
                            className="text-teal-600 hover:text-teal-900"
                          >
                            Éditer
                          </button>
                          <button className="text-blue-600 hover:text-blue-900">
                            Aperçu
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Affichage de {mockPages.length} pages
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100">
                    Précédent
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100">
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pages publiées</p>
                  <p className="text-2xl font-bold text-gray-800">4</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Brouillons</p>
                  <p className="text-2xl font-bold text-gray-800">1</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dernière mise à jour</p>
                  <p className="text-2xl font-bold text-gray-800">Il y a 3 jours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-teal-50 border border-teal-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-teal-800 mb-3">Comment utiliser l'éditeur de pages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
                    1
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-teal-700">Créez une nouvelle page</h4>
                  <p className="text-sm text-teal-600 mt-1">
                    Cliquez sur "Nouvelle page" pour commencer. Donnez un titre à votre page.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
                    2
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-teal-700">Utilisez l'éditeur riche</h4>
                  <p className="text-sm text-teal-600 mt-1">
                    Écrivez votre contenu avec la barre d'outils de formatage.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
                    3
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-teal-700">Ajoutez des composants</h4>
                  <p className="text-sm text-teal-600 mt-1">
                    Glissez-déposez des composants depuis la bibliothèque.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
                    4
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-teal-700">Optimisez pour le SEO</h4>
                  <p className="text-sm text-teal-600 mt-1">
                    Remplissez les métadonnées SEO pour améliorer le référencement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pages;