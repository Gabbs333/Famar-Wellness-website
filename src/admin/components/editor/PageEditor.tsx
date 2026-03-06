// PageEditor - Éditeur de pages WYSIWYG avec Tiptap
// Composant principal pour l'édition de contenu de pages CMS

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import YouTube from '@tiptap/extension-youtube';

// Import des composants de l'éditeur
import EditorToolbar from './toolbar/EditorToolbar';
import ComponentLibrary from './ComponentLibrary';
import PreviewPanel from './PreviewPanel';
import SaveStatus from './SaveStatus';
import TemplateSelector from './templates/TemplateSelector';
import { getTemplateManager, TemplateChangeNotification } from './templates/TemplateManager';

// Types
interface PageEditorProps {
  initialContent?: string;
  pageId?: string;
  pageTitle?: string;
  onSave?: (content: string, metadata: PageMetadata) => void;
  onPublish?: (content: string, metadata: PageMetadata) => void;
  autoSaveInterval?: number; // en millisecondes
  readOnly?: boolean;
}

interface PageMetadata {
  title: string;
  slug: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  updatedAt: string;
}

interface ComponentData {
  id: string;
  type: string;
  props: Record<string, any>;
  content?: string;
  children?: ComponentData[];
}

const PageEditor: React.FC<PageEditorProps> = ({
  initialContent = '',
  pageId,
  pageTitle = 'Nouvelle page',
  onSave,
  onPublish,
  autoSaveInterval = 30000, // 30 secondes par défaut
  readOnly = false
}) => {
  // États
  const [title, setTitle] = useState(pageTitle);
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [showPreview, setShowPreview] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showTemplateChanges, setShowTemplateChanges] = useState(false);
  const [unappliedChanges, setUnappliedChanges] = useState<any[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<string | null>(null);

  // Références
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const contentChangedRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialiser l'éditeur Tiptap
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
        }
      }),
      Placeholder.configure({
        placeholder: 'Commencez à écrire votre contenu ici...',
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
          class: 'max-w-full h-auto rounded-lg'
        }
      }),
      YouTube.configure({
        inline: false,
        modestBranding: true,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-lg'
        }
      })
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      contentChangedRef.current = true;
      setSaveStatus('idle');
    }
  });

  // Générer le slug à partir du titre
  useEffect(() => {
    if (!slug && title) {
      const generatedSlug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [title, slug]);

  // Auto-sauvegarde
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

  // S'abonner aux changements de template
  useEffect(() => {
    if (!pageId) return;

    const templateManager = getTemplateManager();
    
    // Vérifier les changements non appliqués
    const checkUnappliedChanges = () => {
      const changes = templateManager.getUnappliedChangesForPage(pageId);
      setUnappliedChanges(changes);
      setShowTemplateChanges(changes.length > 0);
      
      // Obtenir le template actuel
      const pageInfo = templateManager.getPagesUsingTemplate('').find(p => p.pageId === pageId);
      if (pageInfo) {
        setCurrentTemplate(pageInfo.templateId);
      }
    };

    // S'abonner aux notifications de changement
    unsubscribeRef.current = templateManager.subscribeToChanges((notification: TemplateChangeNotification) => {
      if (notification.affectedPages.some(page => page.pageId === pageId)) {
        checkUnappliedChanges();
      }
    });

    // Vérifier initialement
    checkUnappliedChanges();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [pageId]);

  // Valider et corriger le HTML
  const validateAndCleanHTML = useCallback((html: string): string => {
    // Supprimer les balises dangereuses
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'applet', 'frame'];
    let cleanedHTML = html;
    
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gis');
      cleanedHTML = cleanedHTML.replace(regex, '');
    });
    
    // Supprimer les attributs dangereux
    cleanedHTML = cleanedHTML.replace(/on\w+="[^"]*"/gi, '');
    cleanedHTML = cleanedHTML.replace(/javascript:/gi, '');
    
    // Valider la structure HTML de base
    // Vérifier les balises non fermées (simplifié)
    const tagStack: string[] = [];
    const tagRegex = /<\/?([a-z][a-z0-9]*)[^>]*>/gi;
    let match;
    
    while ((match = tagRegex.exec(cleanedHTML)) !== null) {
      const tagName = match[1].toLowerCase();
      const isClosing = match[0].startsWith('</');
      
      if (!isClosing) {
        tagStack.push(tagName);
      } else {
        const lastTag = tagStack.pop();
        if (lastTag !== tagName) {
          // Balise mal fermée, on la ferme proprement
          console.warn(`Balise mal fermée: ${lastTag} vs ${tagName}`);
        }
      }
    }
    
    // Fermer les balises restantes
    while (tagStack.length > 0) {
      const tag = tagStack.pop();
      cleanedHTML += `</${tag}>`;
    }
    
    return cleanedHTML;
  }, []);

  // Vérifier la qualité du contenu
  const checkContentQuality = useCallback((html: string) => {
    const issues: string[] = [];
    
    // Vérifier la longueur du contenu
    const textContent = html.replace(/<[^>]*>/g, '');
    if (textContent.length < 50) {
      issues.push('Le contenu est trop court (minimum 50 caractères recommandé)');
    }
    
    // Vérifier les images sans alt
    const allImages = html.match(/<img[^>]*>/g) || [];
    const imagesWithoutAlt = allImages.filter((img: string) => !img.includes('alt=') || img.includes('alt=""'));
    
    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length} image(s) sans attribut alt`);
    }
    
    // Vérifier les liens sans texte
    const emptyLinks = (html.match(/<a[^>]*>(\s*)<\/a>/g) || []).length;
    if (emptyLinks > 0) {
      issues.push(`${emptyLinks} lien(s) sans texte`);
    }
    
    return issues;
  }, []);

  // Sauvegarder le contenu
  const handleSave = useCallback(async () => {
    if (!editor || !contentChangedRef.current) return;

    setSaveStatus('saving');
    contentChangedRef.current = false;

    let content = editor.getHTML();
    
    // Valider et nettoyer le HTML
    content = validateAndCleanHTML(content);
    
    // Vérifier la qualité du contenu
    const qualityIssues = checkContentQuality(content);
    
    const metadata: PageMetadata = {
      title,
      slug,
      excerpt,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt || '',
      seoKeywords,
      featuredImage,
      status,
      updatedAt: new Date().toISOString()
    };

    try {
      if (onSave) {
        await onSave(content, metadata);
      }
      
      setSaveStatus('saved');
      setLastSaved(new Date());
      
      // Afficher les avertissements de qualité si nécessaire
      if (qualityIssues.length > 0) {
        console.warn('Problèmes de qualité détectés:', qualityIssues);
        // Dans une vraie implémentation, on pourrait afficher une notification
      }
      
      // Réinitialiser le statut après 3 secondes
      setTimeout(() => {
        if (saveStatus === 'saved') {
          setSaveStatus('idle');
        }
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveStatus('error');
      contentChangedRef.current = true; // Réactiver le changement
    }
  }, [editor, title, slug, excerpt, seoTitle, seoDescription, seoKeywords, featuredImage, status, onSave, saveStatus, validateAndCleanHTML, checkContentQuality]);

  // Publier la page
  const handlePublish = useCallback(async () => {
    if (!editor) return;

    setSaveStatus('saving');
    const content = editor.getHTML();
    const metadata: PageMetadata = {
      title,
      slug,
      excerpt,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt || '',
      seoKeywords,
      featuredImage,
      status: 'published',
      updatedAt: new Date().toISOString()
    };

    try {
      if (onPublish) {
        await onPublish(content, metadata);
      }
      
      setStatus('published');
      setSaveStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      setSaveStatus('error');
    }
  }, [editor, title, slug, excerpt, seoTitle, seoDescription, seoKeywords, featuredImage, onPublish]);

  // Gérer le drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDraggingOver) setIsDraggingOver(true);
  }, [isDraggingOver]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOver(false);
      setDragOverTarget(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    setDragOverTarget(null);
    
    const componentType = e.dataTransfer.getData('component/type');
    const componentProps = e.dataTransfer.getData('component/props');
    
    if (componentType) {
      const props = componentProps ? JSON.parse(componentProps) : {};
      const newComponent: ComponentData = {
        id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: componentType,
        props,
        children: []
      };

      setComponents(prev => [...prev, newComponent]);
      setSelectedComponent(newComponent.id);
      setShowComponentLibrary(false);
    }
  }, []);

  const handleDragOverComponent = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(targetId);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, componentId: string) => {
    e.dataTransfer.setData('component/id', componentId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDropReorder = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);
    
    const draggedId = e.dataTransfer.getData('component/id');
    
    if (draggedId && draggedId !== targetId) {
      setComponents(prev => {
        const newComponents = [...prev];
        const draggedIndex = newComponents.findIndex(c => c.id === draggedId);
        const targetIndex = newComponents.findIndex(c => c.id === targetId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
          const [draggedComponent] = newComponents.splice(draggedIndex, 1);
          newComponents.splice(targetIndex, 0, draggedComponent);
        }
        
        return newComponents;
      });
    }
  }, []);

  // Ajouter un composant
  const handleAddComponent = useCallback((componentType: string, props: Record<string, any> = {}) => {
    const newComponent: ComponentData = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: componentType,
      props,
      children: []
    };

    setComponents(prev => [...prev, newComponent]);
    setSelectedComponent(newComponent.id);
    setShowComponentLibrary(false);
  }, []);

  // Mettre à jour un composant
  const handleUpdateComponent = useCallback((componentId: string, updates: Partial<ComponentData>) => {
    setComponents(prev => 
      prev.map(comp => 
        comp.id === componentId ? { ...comp, ...updates } : comp
      )
    );
  }, []);

  // Supprimer un composant
  const handleDeleteComponent = useCallback((componentId: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== componentId));
    if (selectedComponent === componentId) {
      setSelectedComponent(null);
    }
  }, [selectedComponent]);

  // Dupliquer un composant
  const handleDuplicateComponent = useCallback((componentId: string) => {
    const componentToDuplicate = components.find(comp => comp.id === componentId);
    if (componentToDuplicate) {
      const duplicatedComponent: ComponentData = {
        ...componentToDuplicate,
        id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      setComponents(prev => [...prev, duplicatedComponent]);
    }
  }, [components]);

  // Gérer la sélection de template
  const handleTemplateSelect = useCallback((template: any) => {
    // Appliquer les composants du template
    if (template.components && template.components.length > 0) {
      const newComponents = template.components.map((comp: any, index: number) => ({
        ...comp,
        id: `comp_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
      }));
      setComponents(newComponents);
    }
    
    setShowTemplateSelector(false);
  }, []);

  // Appliquer les changements de template
  const handleApplyTemplateChanges = useCallback(() => {
    if (!pageId) return;

    const templateManager = getTemplateManager();
    const changeIds = unappliedChanges.map(change => change.changeId);
    
    const success = templateManager.applyTemplateChangesToPage(pageId, changeIds);
    
    if (success) {
      setUnappliedChanges([]);
      setShowTemplateChanges(false);
      
      // Recharger les composants depuis le template mis à jour
      if (currentTemplate) {
        const template = templateManager.getTemplate(currentTemplate);
        if (template && template.components) {
          const newComponents = template.components.map((comp: any, index: number) => ({
            ...comp,
            id: `comp_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
          }));
          setComponents(newComponents);
        }
      }
    }
  }, [pageId, unappliedChanges, currentTemplate]);

  // Ignorer les changements de template
  const handleIgnoreTemplateChanges = useCallback(() => {
    if (!pageId) return;

    const templateManager = getTemplateManager();
    const pageInfo = templateManager.getPagesUsingTemplate('').find(p => p.pageId === pageId);
    
    if (pageInfo && currentTemplate) {
      // Mettre à jour la version du template pour la page
      const template = templateManager.getTemplate(currentTemplate);
      if (template) {
        const templateManagerInternal = getTemplateManager() as any;
        if (templateManagerInternal.associatePageWithTemplate) {
          templateManagerInternal.associatePageWithTemplate(pageId, pageTitle || title, currentTemplate);
        }
      }
    }
    
    setUnappliedChanges([]);
    setShowTemplateChanges(false);
  }, [pageId, currentTemplate, pageTitle, title]);

  // Rendu
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
              placeholder="Titre de la page"
              className="w-full text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900"
              disabled={readOnly}
            />
            <div className="flex items-center mt-1 space-x-4">
              <div className="text-sm text-gray-600">
                Slug: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{slug}</span>
              </div>
              <SaveStatus 
                status={saveStatus} 
                lastSaved={lastSaved} 
                onSave={handleSave}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 rounded-lg ${showPreview ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {showPreview ? 'Éditer' : 'Prévisualiser'}
            </button>
            
            {!readOnly && (
              <>
                <button
                  onClick={() => setShowTemplateSelector(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Changer de template
                </button>
                
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
                  Publier
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Barre latérale gauche - Bibliothèque de composants */}
        {showComponentLibrary && (
          <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
            <ComponentLibrary onSelectComponent={handleAddComponent} />
          </div>
        )}

        {/* Zone d'édition principale */}
        <div className={`flex-1 flex flex-col ${showComponentLibrary ? '' : 'w-full'}`}>
          {/* Barre d'outils de l'éditeur */}
          {!readOnly && !showPreview && (
            <div className="border-b border-gray-200 bg-white">
              <EditorToolbar editor={editor} />
              
              {/* Boutons pour la bibliothèque de composants */}
              <div className="px-4 py-2 border-t border-gray-100">
                <button
                  onClick={() => setShowComponentLibrary(!showComponentLibrary)}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {showComponentLibrary ? 'Masquer les composants' : 'Ajouter un composant'}
                </button>
              </div>
            </div>
          )}

          {/* Zone d'édition ou prévisualisation */}
          <div className="flex-1 overflow-auto p-6">
            {showPreview ? (
              <PreviewPanel 
                title={title}
                content={editor.getHTML()}
                components={components}
                featuredImage={featuredImage}
              />
            ) : (
              <>
                {/* Métadonnées SEO (collapsible) */}
                <div className="mb-6 bg-gray-50 rounded-lg p-4">
                  <details>
                    <summary className="cursor-pointer text-lg font-medium text-gray-700">
                      Métadonnées SEO
                    </summary>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Titre SEO
                        </label>
                        <input
                          type="text"
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          placeholder="Titre pour les moteurs de recherche"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          disabled={readOnly}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description SEO
                        </label>
                        <textarea
                          value={seoDescription}
                          onChange={(e) => setSeoDescription(e.target.value)}
                          placeholder="Description pour les moteurs de recherche"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          disabled={readOnly}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mots-clés (séparés par des virgules)
                        </label>
                        <input
                          type="text"
                          value={seoKeywords.join(', ')}
                          onChange={(e) => setSeoKeywords(e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                          placeholder="mot-clé1, mot-clé2, mot-clé3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          disabled={readOnly}
                        />
                      </div>
                    </div>
                  </details>
                </div>

                {/* Éditeur de contenu */}
                <div 
                  className={`prose max-w-none ${readOnly ? 'opacity-75' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className={`relative ${isDraggingOver && !dragOverTarget ? 'border-2 border-dashed border-teal-500 bg-teal-50 rounded-lg' : ''}`}>
                    <EditorContent 
                      editor={editor} 
                      className="min-h-[400px] border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    {isDraggingOver && !dragOverTarget && (
                      <div className="absolute inset-0 flex items-center justify-center bg-teal-50 bg-opacity-80 rounded-lg pointer-events-none">
                        <div className="text-center">
                          <svg className="w-12 h-12 text-teal-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <p className="text-teal-700 font-medium">Déposez le composant ici</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Composants ajoutés */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    Composants de la page
                  </h3>
                  
                  {components.length > 0 ? (
                    <div 
                      className="space-y-4"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {components.map(component => (
                        <div 
                          key={component.id}
                          className={`border rounded-lg p-4 transition-all duration-200 ${
                            selectedComponent === component.id ? 'border-teal-500 bg-teal-50' : 
                            dragOverTarget === component.id ? 'border-teal-400 bg-teal-100 border-2' : 
                            'border-gray-200'
                          }`}
                          onClick={() => setSelectedComponent(component.id)}
                          draggable
                          onDragStart={(e) => handleDragStart(e, component.id)}
                          onDragOver={(e) => handleDragOverComponent(e, component.id)}
                          onDragLeave={() => setDragOverTarget(null)}
                          onDrop={(e) => handleDropReorder(e, component.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <span className="font-medium text-gray-700 mr-2">
                                {component.type}
                              </span>
                              <span className="text-xs text-gray-500 cursor-move" title="Glisser pour réorganiser">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                              </span>
                            </div>
                            {!readOnly && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateComponent(component.id);
                                  }}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  Dupliquer
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteComponent(component.id);
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Supprimer
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {JSON.stringify(component.props, null, 2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div 
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                        isDraggingOver ? 'border-teal-500 bg-teal-50' : 'border-gray-300'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {isDraggingOver ? (
                        <div className="text-teal-700">
                          <svg className="w-12 h-12 mx-auto mb-3 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <p className="font-medium">Déposez le composant ici</p>
                          <p className="text-sm mt-1">Ajoutez-le à la zone des composants</p>
                        </div>
                      ) : (
                        <div className="text-gray-600">
                          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <p className="font-medium">Aucun composant ajouté</p>
                          <p className="text-sm mt-1">
                            Glissez un composant depuis la bibliothèque ou cliquez sur "Ajouter un composant"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Barre latérale droite - Propriétés du composant sélectionné */}
        {selectedComponent && !showPreview && (
          <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Propriétés du composant
            </h3>
            {/* Ici, on afficherait les propriétés éditable du composant sélectionné */}
            <div className="text-gray-600">
              Sélectionnez un composant pour éditer ses propriétés.
            </div>
          </div>
        )}
      </div>

      {/* Pied de page avec statut */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            {readOnly ? (
              <span className="text-gray-500">Mode lecture seule</span>
            ) : (
              <span>
                {contentChangedRef.current ? 'Modifications non sauvegardées' : 'Tout est sauvegardé'}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span>Statut: {status === 'draft' ? 'Brouillon' : status === 'published' ? 'Publié' : 'Archivé'}</span>
            <span>Caractères: {editor.storage.characterCount?.characters() || 0}</span>
            <span>Mots: {editor.storage.characterCount?.words() || 0}</span>
          </div>
        </div>
      </div>

      {/* Notification des changements de template */}
      {showTemplateChanges && unappliedChanges.length > 0 && (
        <div className="fixed bottom-4 right-4 w-96 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-yellow-800 mb-1">
                  Mises à jour du template disponible
                </h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Le template utilisé par cette page a été mis à jour. 
                  {unappliedChanges.length} changement(s) disponible(s).
                </p>
                
                <div className="space-y-2 mb-4">
                  {unappliedChanges.slice(0, 3).map((change, index) => (
                    <div key={index} className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded">
                      <div className="font-medium">Version {change.versionFrom} → {change.versionTo}</div>
                      {change.changes.addedComponents && change.changes.addedComponents.length > 0 && (
                        <div>+ {change.changes.addedComponents.length} composant(s) ajouté(s)</div>
                      )}
                      {change.changes.modifiedComponents && change.changes.modifiedComponents.length > 0 && (
                        <div>~ {change.changes.modifiedComponents.length} composant(s) modifié(s)</div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleApplyTemplateChanges}
                    className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                  >
                    Appliquer les changements
                  </button>
                  <button
                    onClick={handleIgnoreTemplateChanges}
                    className="px-3 py-1.5 border border-yellow-300 text-yellow-700 text-sm rounded hover:bg-yellow-100"
                  >
                    Ignorer pour maintenant
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowTemplateChanges(false)}
                className="text-yellow-500 hover:text-yellow-700 ml-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sélecteur de template */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplateSelector(false)}
          currentPageId={pageId}
          currentPageTitle={title}
        />
      )}
    </div>
  );
};

export default PageEditor;