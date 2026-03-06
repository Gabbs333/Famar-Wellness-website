// BlogTagsManager - Gestionnaire de tags de blog
// Interface pour créer, modifier et supprimer des tags avec suggestions

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Save, Tag, Search } from 'lucide-react';

interface Tag {
  id?: number;
  name: string;
  slug: string;
  created_at?: string;
  post_count?: number;
}

interface BlogTagsManagerProps {
  token?: string;
  onTagSelect?: (tag: Tag) => void;
  selectedTags?: number[];
}

const BlogTagsManager: React.FC<BlogTagsManagerProps> = ({
  token,
  onTagSelect,
  selectedTags = []
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<Partial<Tag>>({
    name: '',
    slug: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les tags
  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/blog/tags', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTags(data);
      } else {
        throw new Error('Failed to fetch tags');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTags(getDemoTags());
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Données de démonstration
  const getDemoTags = (): Tag[] => [
    { id: 1, name: 'Santé', slug: 'sante', post_count: 8 },
    { id: 2, name: 'Bien-être', slug: 'bien-etre', post_count: 12 },
    { id: 3, name: 'Fitness', slug: 'fitness', post_count: 6 },
    { id: 4, name: 'Massage', slug: 'massage', post_count: 15 },
    { id: 5, name: 'Andullation', slug: 'andullation', post_count: 4 },
    { id: 6, name: 'EMS', slug: 'ems', post_count: 3 },
    { id: 7, name: 'Relaxation', slug: 'relaxation', post_count: 9 },
    { id: 8, name: 'Douleurs', slug: 'douleurs', post_count: 7 }
  ];

  // Générer le slug
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Filtrer les tags
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ouvrir le modal pour nouveau tag
  const handleAddNew = () => {
    setEditingTag(null);
    setFormData({ name: '', slug: '' });
    setShowModal(true);
  };

  // Ouvrir le modal pour modification
  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, slug: tag.slug });
    setShowModal(true);
  };

  // Supprimer un tag
  const handleDelete = async (tagId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce tag ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blog/tags/${tagId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchTags();
      } else {
        throw new Error('Failed to delete tag');
      }
    } catch (err) {
      console.error('Error deleting tag:', err);
      setTags(prev => prev.filter(t => t.id !== tagId));
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const tagData = {
      ...formData,
      slug: formData.slug || generateSlug(formData.name || '')
    };

    try {
      const url = editingTag 
        ? `/api/admin/blog/tags/${editingTag.id}`
        : '/api/admin/blog/tags';
      
      const method = editingTag ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tagData)
      });

      if (response.ok) {
        setShowModal(false);
        fetchTags();
      } else {
        throw new Error('Failed to save tag');
      }
    } catch (err) {
      console.error('Error saving tag:', err);
      if (editingTag) {
        setTags(prev => prev.map(t => t.id === editingTag.id ? { ...t, ...tagData } : t));
      } else {
        const newTag: Tag = { ...tagData, id: Date.now(), post_count: 0 } as Tag;
        setTags(prev => [...prev, newTag]);
      }
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-2 text-gray-600">Chargement des tags...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
        <button onClick={handleAddNew} className="flex items-center px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau tag
        </button>
      </div>
      
      {/* Barre de recherche */}
      <div className="px-6 py-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="p-4">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
        
        {/* Stats */}
        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
          <span>{tags.length} tags au total</span>
          <span>{tags.reduce((acc, t) => acc + (t.post_count || 0), 0)} articles</span>
        </div>

        {filteredTags.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Tag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-lg">{searchQuery ? 'Aucun tag trouvé' : 'Aucun tag'}</p>
            <p className="text-sm mt-2">{searchQuery ? 'Essayez une autre recherche' : 'Créez votre premier tag'}</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredTags.map(tag => {
              const isSelected = selectedTags.includes(tag.id!);
              return (
                <div
                  key={tag.id}
                  className={`flex items-center px-3 py-2 rounded-lg border ${
                    isSelected 
                      ? 'bg-teal-50 border-teal-200' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {onTagSelect ? (
                    <button
                      onClick={() => onTagSelect(tag)}
                      className="flex items-center"
                    >
                      <Tag className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{tag.name}</span>
                      <span className="ml-2 text-xs text-gray-500">({tag.post_count || 0})</span>
                    </button>
                  ) : (
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{tag.name}</span>
                      <span className="ml-2 text-xs text-gray-500">({tag.post_count || 0})</span>
                    </div>
                  )}
                  <div className="flex items-center ml-2 border-l border-gray-200 pl-2 space-x-1">
                    <button
                      onClick={() => handleEdit(tag)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Modifier"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id!)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal pour ajouter/modifier un tag */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{editingTag ? 'Modifier le tag' : 'Nouveau tag'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Nom du tag"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="slug-url"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogTagsManager;
export type { Tag, BlogTagsManagerProps };
