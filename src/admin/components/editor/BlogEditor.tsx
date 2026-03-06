// BlogEditor - Éditeur de blog professionnel avec fonctionnalités avancées
// Composant pour l'édition d'articles de blog avec SEO, catégories, tags, etc.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import YouTube from '@tiptap/extension-youtube';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight';

// Import des composants de l'éditeur
import EditorToolbar from './toolbar/EditorToolbar';
import SaveStatus from './SaveStatus';

// Types pour le blog
interface BlogPost {
  id?: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  featured_image_id?: string;
  author_id?: number;
  reading_time?: number;
  published: boolean;
  created_at?: string;
  updated_at?: string;
  categories?: BlogCategory[];
  tags?: Tag[];
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  created_at?: string;
  post_count?: number;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
}

interface BlogEditorProps {
  post?: BlogPost;
  categories: BlogCategory[];
  availableTags: Tag[];
  onSave: (post: BlogPost) => Promise<void>;
  onPublish: (post: BlogPost) => Promise<void>;
  onMediaSelect?: (callback: (imageUrl: string) => void) => void;
  autoSaveInterval?: number;
  readOnly?: boolean;
}

interface BlogMetadata {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  featuredImage: string;
  readingTime: number;
  status: 'draft' | 'published' | 'archived';
  updatedAt: string;
}

// Configuration de lowlight pour le highlighting de code
const lowlight = createLowlight(all);

const BlogEditor: React.FC<BlogEditorProps> = ({
  post,
  categories,
  availableTags,
  onSave,
  onPublish,
  onMediaSelect,
  autoSaveInterval = 30000,
  readOnly = false
}) => {
  // États pour le post
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [imageUrl, setImageUrl] = useState(post?.image_url || '');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(
    post?.published ? 'published' : 'draft'
  );
  
  // États pour les métadonnées SEO
  const [metaTitle, setMetaTitle] = useState(post?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(post?.meta_description || '');
  const [metaKeywords, setMetaKeywords] = useState<string[]>(post?.meta_keywords || []);
  const [newKeyword, setNewKeyword] = useState('');
  
  // États pour les catégories et tags
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    post?.categories?.map(c => c.id) || []
  );
  const [selectedTags, setSelectedTags] = useState<number[]>(
    post?.tags?.map(t => t.id) || []
  );
  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  
  // États UI
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [readingTime, setReadingTime] = useState(post?.reading_time || 0);
  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  
  // Références
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const contentChangedRef = useRef(false);

  // Initialiser l'éditeur Tiptap avec toutes les extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto'
          }
        }
      }),
      Placeholder.configure({
        placeholder: 'Commencez à écrire votre article de blog ici...',
        emptyEditorClass: 'is-editor-empty'
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-teal-600 hover:text-teal-800 underline'
        }
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4'
        }
      }),
      YouTube.configure({
        inline: false,
        modestBranding: true,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-lg my-4'
        }
      }),
      CodeBlockLowlight.configure({
        lowlight
      })
    ],
    content: post?.content || '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      contentChangedRef.current = true;
      setSaveStatus('idle');
      calculateReadingTime(editor.getText());
    }
  });

  // Générer le slug à partir du titre
  useEffect(() => {
    if (!post?.slug && title) {
      const generatedSlug = generateSlug(title);
      setSlug(generatedSlug);
    }
  }, [title, post?.slug]);

  // Fonction pour générer un slug SEO-friendly
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Calculer le temps de lecture
  const calculateReadingTime = (text: string): void => {
    const wordsPerMinute = 200;
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    setReadingTime(minutes);
  };

  // Gérer l'auto-sauvegarde
  useEffect(() => {
    if (autoSaveInterval > 0 && contentChangedRef.current) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        handleSave();
      }, autoSaveInterval);

      return () => {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
      };
    }
  }, [autoSaveInterval, editor?.getHTML()]);

  // Sauvegarder le post
  const handleSave = useCallback(async () => {
    if (!editor || !contentChangedRef.current) return;

    setSaveStatus('saving');
    contentChangedRef.current = false;

    const postData: BlogPost = {
      id: post?.id,
      title,
      slug,
      content: editor.getHTML(),
      excerpt,
      image_url: imageUrl,
      meta_title: metaTitle || title,
      meta_description: metaDescription || excerpt,
      meta_keywords: metaKeywords,
      reading_time: readingTime,
      published: status === 'published',
      categories: categories.filter(c => selectedCategories.includes(c.id)),
      tags: availableTags.filter(t => selectedTags.includes(t.id))
    };

    try {
      await onSave(postData);
      setSaveStatus('saved');
      setLastSaved(new Date());
      
      setTimeout(() => {
        if (saveStatus === 'saved') {
          setSaveStatus('idle');
        }
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveStatus('error');
      contentChangedRef.current = true;
    }
  }, [editor, title, slug, excerpt, imageUrl, metaTitle, metaDescription, metaKeywords, readingTime, status, post, categories, availableTags, selectedCategories, selectedTags, onSave, saveStatus]);

  // Publier le post
  const handlePublish = useCallback(async () => {
    if (!editor) return;

    setSaveStatus('saving');
    
    const postData: BlogPost = {
      id: post?.id,
      title,
      slug,
      content: editor.getHTML(),
      excerpt,
      image_url: imageUrl,
      meta_title: metaTitle || title,
      meta_description: metaDescription || excerpt,
      meta_keywords: metaKeywords,
      reading_time: readingTime,
      published: true,
      categories: categories.filter(c => selectedCategories.includes(c.id)),
      tags: availableTags.filter(t => selectedTags.includes(t.id))
    };

    try {
      await onPublish(postData);
      setStatus('published');
      setSaveStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      setSaveStatus('error');
    }
  }, [editor, title, slug, excerpt, imageUrl, metaTitle, metaDescription, metaKeywords, readingTime, post, categories, availableTags, selectedCategories, selectedTags, onPublish]);

  // Ajouter un mot-clé
  const addKeyword = () => {
    if (newKeyword.trim() && !metaKeywords.includes(newKeyword.trim())) {
      setMetaKeywords([...metaKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  // Supprimer un mot-clé
  const removeKeyword = (keyword: string) => {
    setMetaKeywords(metaKeywords.filter(k => k !== keyword));
  };

  // Gérer la sélection de catégorie
  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Gérer la sélection de tag
  const toggleTag = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Rechercher des tags
  const searchTags = (query: string) => {
    if (query.length > 0) {
      const filtered = availableTags.filter(
        tag => tag.name.toLowerCase().includes(query.toLowerCase()) && 
               !selectedTags.includes(tag.id)
      );
      setTagSuggestions(filtered.slice(0, 5));
      setShowTagSuggestions(true);
    } else {
      setShowTagSuggestions(false);
    }
  };

  // Ajouter un nouveau tag
  const addNewTag = (tagName: string) => {
    // Dans une vraie implémentation, cela.enverrait une requête API pour créer le tag
    console.log('New tag would be created:', tagName);
    setShowTagSuggestions(false);
  };

  // Ouvrir le sélecteur d'images
  const openMediaSelector = () => {
    if (onMediaSelect) {
      onMediaSelect((url: string) => {
        setImageUrl(url);
        setShowMediaSelector(false);
      });
    } else {
      setShowMediaSelector(true);
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-2 text-gray-600">Chargement de l'éditeur...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* En-tête de l'éditeur */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de l'article"
              className="w-full text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900"
              disabled={readOnly}
            />
            <div className="flex items-center mt-2 space-x-4 flex-wrap gap-y-2">
              <div className="text-sm text-gray-600 flex items-center">
                <span className="font-medium mr-1">Slug:</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
                  className="font-mono bg-gray-100 px-2 py-1 rounded text-xs max-w-xs"
                  disabled={readOnly}
                />
              </div>
              <div className="text-sm text-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{readingTime} min</span>
                <span className="ml-1">de lecture</span>
              </div>
              <SaveStatus 
                status={saveStatus} 
                lastSaved={lastSaved} 
                onSave={handleSave}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3 ml-4">
            <button
              onClick={() => setShowSeoPanel(!showSeoPanel)}
              className={`px-4 py-2 rounded-lg ${showSeoPanel ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              SEO
            </button>
            
            {!readOnly && (
              <>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveStatus === 'saving' ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                
                <button
                  onClick={handlePublish}
                  disabled={saveStatus === 'saving'}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'published' ? 'Publié' : 'Publier'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Zone d'édition principale */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Barre d'outils de l'éditeur */}
          {!readOnly && (
            <div className="border-b border-gray-200 bg-white">
              <EditorToolbar editor={editor} />
            </div>
          )}

          {/* Zone d'édition */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Image mise en avant */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image mise en avant
                </label>
                {imageUrl ? (
                  <div className="relative">
                    <img 
                      src={imageUrl} 
                      alt={title} 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={openMediaSelector}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-teal-500 hover:text-teal-600 transition-colors"
                  >
                    <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Ajouter une image
                  </button>
                )}
              </div>

              {/* Extrait */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extrait (résumé)
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Un court résumé de l'article..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={readOnly}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {excerpt.length}/160 caractères recommandés pour le SEO
                </p>
              </div>

              {/* Éditeur de contenu */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Contenu de l'article</span>
                </div>
                <EditorContent 
                  editor={editor} 
                  className="prose prose-teal max-w-none p-4 min-h-[400px] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panneau latéral droit - Métadonnées */}
        <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Catégories */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Catégories</h3>
              <div className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucune catégorie disponible</p>
                ) : (
                  categories.map(category => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        disabled={readOnly}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ajouter un tag..."
                  value={newKeyword}
                  onChange={(e) => {
                    setNewKeyword(e.target.value);
                    searchTags(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {showTagSuggestions && tagSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {tagSuggestions.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => {
                          toggleTag(tag.id);
                          setNewKeyword('');
                          setShowTagSuggestions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Tags sélectionnés */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedTags.map(tagId => {
                    const tag = availableTags.find(t => t.id === tagId);
                    return tag ? (
                      <span 
                        key={tag.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800"
                      >
                        {tag.name}
                        <button
                          onClick={() => toggleTag(tag.id)}
                          disabled={readOnly}
                          className="ml-1 hover:text-teal-600"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Statut */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Statut</h3>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'archived')}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </div>

            {/* Informations supplémentaires */}
            <div className="text-xs text-gray-500 space-y-2 pt-4 border-t border-gray-200">
              <p>
                <span className="font-medium">Créé:</span>{' '}
                {post?.created_at ? new Date(post.created_at).toLocaleDateString('fr-FR') : '-'}
              </p>
              <p>
                <span className="font-medium">Modifié:</span>{' '}
                {post?.updated_at ? new Date(post.updated_at).toLocaleDateString('fr-FR') : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Panneau SEO (modal/sidebar) */}
      {showSeoPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Métadonnées SEO</h2>
                <button
                  onClick={() => setShowSeoPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Titre SEO */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre SEO
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title || 'Titre pour les moteurs de recherche'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={readOnly}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(metaTitle || title).length}/60 caractères recommandés
                  </p>
                </div>

                {/* Description SEO */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description SEO
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder={excerpt || 'Description pour les moteurs de recherche'}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={readOnly}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(metaDescription || excerpt).length}/160 caractères recommandés
                  </p>
                </div>

                {/* Mots-clés */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mots-clés
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addKeyword();
                        }
                      }}
                      placeholder="Ajouter un mot-clé..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      disabled={readOnly}
                    />
                    <button
                      onClick={addKeyword}
                      disabled={readOnly}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      Ajouter
                    </button>
                  </div>
                  {metaKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {metaKeywords.map(keyword => (
                        <span 
                          key={keyword}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                        >
                          {keyword}
                          <button
                            onClick={() => removeKeyword(keyword)}
                            disabled={readOnly}
                            className="ml-1 hover:text-red-600"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Aperçu Google */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu dans les résultats Google</h4>
                  <div className="border border-gray-200 rounded bg-white p-3">
                    <p className="text-blue-800 text-lg truncate">
                      {(metaTitle || title) || 'Titre de la page'}
                    </p>
                    <p className="text-green-700 text-sm truncate">
                      https://famar-wellness.com/blog/{slug || 'slug-de-la-page'}
                    </p>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {(metaDescription || excerpt) || 'Description de la page qui apparaîtra dans les résultats de recherche...'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowSeoPanel(false)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogEditor;
export type { BlogPost, BlogCategory, Tag, BlogEditorProps, BlogMetadata };
