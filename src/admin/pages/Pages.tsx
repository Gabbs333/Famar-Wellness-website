// Pages.tsx - Page de gestion des pages CMS
// Interface pour créer, éditer et gérer les pages du site

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageEditor from '../components/editor/PageEditor';
import { supabase, CmsPage } from '../../lib/supabase';

const Pages: React.FC = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [selectedPage, setSelectedPage] = useState<CmsPage | null>(null);
  const [selectedPageHtml, setSelectedPageHtml] = useState<string>('');
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Charger les pages depuis Supabase
  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('cms_pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      setPages(data || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des pages:', err);
      setError(err.message || 'Erreur lors du chargement des pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Convertir le contenu JSON en HTML pour l'éditeur
  const jsonToHtml = (content: any): string => {
    if (!content || typeof content !== 'object') return '';
    
    // Si c'est déjà une chaîne HTML, la retourner
    if (typeof content === 'string') return content;
    
    // Si c'est un objet avec sections (format du seed data)
    if (content.sections && Array.isArray(content.sections)) {
      return content.sections.map((section: any) => {
        switch (section.type) {
          case 'hero':
            return `<section class="hero" data-type="hero" data-id="${section.id}">
              <h1>${section.content?.title || ''}</h1>
              <p>${section.content?.subtitle || ''}</p>
              <a href="${section.content?.ctaLink || '#'}" class="cta-button">${section.content?.ctaText || 'En savoir plus'}</a>
            </section>`;
          case 'intro':
            return `<section class="intro" data-type="intro" data-id="${section.id}">
              <h2>${section.content?.title || ''}</h2>
              <p>${section.content?.description || ''}</p>
            </section>`;
          case 'services':
            return `<section class="services" data-type="services" data-id="${section.id}">
              <h2>${section.content?.title || ''}</h2>
              <p>${section.content?.description || ''}</p>
            </section>`;
          case 'cta':
            return `<section class="cta" data-type="cta" data-id="${section.id}">
              <h2>${section.content?.title || ''}</h2>
              <p>${section.content?.description || ''}</p>
              <a href="${section.content?.primaryButtonLink || '#'}">${section.content?.primaryButtonText || ''}</a>
            </section>`;
          default:
            return `<section data-type="${section.type}" data-id="${section.id}">
              <p>Section: ${section.type}</p>
            </section>`;
        }
      }).join('\n');
    }
    
    return '';
  };

  // Filtrer les pages
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'published' && page.published) ||
                          (statusFilter === 'draft' && !page.published);
    return matchesSearch && matchesStatus;
  });

  // Compter les pages par statut
  const publishedCount = pages.filter(p => p.published).length;
  const draftCount = pages.filter(p => !p.published).length;

  // Gérer la sauvegarde d'une page
  const handleSavePage = async (content: string, metadata: any) => {
    try {
      // Utiliser les valeurs existantes si non fournies
      const title = metadata.title || selectedPage?.title || 'Nouvelle page';
      const slug = metadata.slug || selectedPage?.slug || generateSlug(title);
      
      const pageData = {
        title,
        slug,
        description: metadata.excerpt || selectedPage?.description || null,
        content: content, // Stocker le HTML directement
        meta_title: metadata.seoTitle || selectedPage?.meta_title || null,
        meta_description: metadata.seoDescription || selectedPage?.meta_description || null,
        meta_keywords: metadata.seoKeywords || selectedPage?.meta_keywords || null,
        featured_image: metadata.featuredImage || selectedPage?.featured_image || null,
        published: selectedPage?.published || false, // Préserver le statut existant
        updated_at: new Date().toISOString()
      };

      if (selectedPage) {
        // Mettre à jour la page existante
        const { error: updateError } = await supabase
          .from('cms_pages')
          .update(pageData)
          .eq('id', selectedPage.id);

        if (updateError) throw updateError;
      } else {
        // Créer une nouvelle page
        const { error: insertError } = await supabase
          .from('cms_pages')
          .insert([{
            ...pageData,
            created_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }

      await fetchPages();
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      throw err;
    }
  };

  // Gérer la publication d'une page
  const handlePublishPage = async (content: string, metadata: any) => {
    try {
      // Utiliser les valeurs existantes si non fournies
      const title = metadata.title || selectedPage?.title || 'Nouvelle page';
      const slug = metadata.slug || selectedPage?.slug || generateSlug(title);
      
      const pageData = {
        title,
        slug,
        description: metadata.excerpt || selectedPage?.description || null,
        content: content, // Stocker le HTML directement
        meta_title: metadata.seoTitle || selectedPage?.meta_title || null,
        meta_description: metadata.seoDescription || selectedPage?.meta_description || null,
        meta_keywords: metadata.seoKeywords || selectedPage?.meta_keywords || null,
        featured_image: metadata.featuredImage || selectedPage?.featured_image || null,
        published: true, // Publier la page
        updated_at: new Date().toISOString()
      };

      if (selectedPage) {
        // Mettre à jour la page existante
        const { error: updateError } = await supabase
          .from('cms_pages')
          .update(pageData)
          .eq('id', selectedPage.id);

        if (updateError) throw updateError;
      } else {
        // Créer une nouvelle page
        const { error: insertError } = await supabase
          .from('cms_pages')
          .insert([{
            ...pageData,
            created_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }

      await fetchPages();
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la publication:', err);
      throw err;
    }
  };

  // Gérer la suppression d'une page
  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('cms_pages')
        .delete()
        .eq('id', pageId);

      if (deleteError) throw deleteError;

      await fetchPages();
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression de la page');
    }
  };

  // Générer un slug à partir d'un titre
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Ouvrir l'éditeur pour une nouvelle page
  const handleNewPage = () => {
    setSelectedPage(null);
    setShowEditor(true);
  };

  // Ouvrir l'éditeur pour une page existante
  const handleEditPage = (page: CmsPage) => {
    // Convertir le contenu JSON en HTML pour l'éditeur
    const htmlContent = jsonToHtml(page.content);
    setSelectedPageHtml(htmlContent);
    setSelectedPage(page);
    setShowEditor(true);
  };

  // Fermer l'éditeur
  const handleCloseEditor = () => {
    setShowEditor(false);
    setSelectedPage(null);
    setSelectedPageHtml('');
    fetchPages(); // Rafraîchir la liste
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Obtenir le temps écoulé
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  };

  return (
    <div className="p-6">
      {showEditor ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {selectedPage ? `Éditer: ${selectedPage.title}` : 'Nouvelle page'}
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
              pageId={selectedPage?.id}
              pageTitle={selectedPage?.title || 'Nouvelle page'}
              initialContent={selectedPageHtml}
              initialSlug={selectedPage?.slug || ''}
              initialDescription={selectedPage?.description || ''}
              initialSeoTitle={selectedPage?.meta_title || ''}
              initialSeoDescription={selectedPage?.meta_description || ''}
              initialSeoKeywords={selectedPage?.meta_keywords || []}
              initialFeaturedImage={selectedPage?.featured_image || ''}
              initialStatus={selectedPage?.published ? 'published' : 'draft'}
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

          {/* Message d'erreur */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={fetchPages}
                className="mt-2 text-sm text-red-700 underline"
              >
                Réessayer
              </button>
            </div>
          )}

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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="published">Publié</option>
                    <option value="draft">Brouillon</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <p className="mt-2">Chargement des pages...</p>
              </div>
            ) : filteredPages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Aucune page trouvée</p>
                <button
                  onClick={handleNewPage}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Créer votre première page
                </button>
              </div>
            ) : (
              <>
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
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPages.map((page) => (
                        <tr key={page.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{page.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">/{page.slug}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              page.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {page.published ? 'Publié' : 'Brouillon'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {getTimeAgo(page.updated_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditPage(page)}
                                className="text-teal-600 hover:text-teal-900"
                              >
                                Éditer
                              </button>
                              <button 
                                onClick={() => handleDeletePage(page.id)}
                                className="text-red-600 hover:text-red-900"
                              >
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
                      Affichage de {filteredPages.length} page{filteredPages.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </>
            )}
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
                  <p className="text-2xl font-bold text-gray-800">{publishedCount}</p>
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
                  <p className="text-2xl font-bold text-gray-800">{draftCount}</p>
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
                  <p className="text-sm text-gray-600">Total des pages</p>
                  <p className="text-2xl font-bold text-gray-800">{pages.length}</p>
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
