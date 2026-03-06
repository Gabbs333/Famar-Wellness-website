// BlogCategoriesManager - Gestionnaire de catégories de blog
// Interface pour créer, éditer et gérer les catégories de blog

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Folder, ChevronRight, ChevronDown } from 'lucide-react';

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  created_at?: string;
  post_count?: number;
  children?: BlogCategory[];
}

interface BlogCategoriesManagerProps {
  token?: string;
}

const BlogCategoriesManager: React.FC<BlogCategoriesManagerProps> = ({ token }) => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: ''
  });

  // Données de démonstration
  const demoCategories: BlogCategory[] = [
    {
      id: 1,
      name: 'Santé & Bien-être',
      slug: 'sante-bien-etre',
      description: 'Articles sur la santé et le bien-être',
      post_count: 12,
      children: [
        {
          id: 4,
          name: 'Massage',
          slug: 'massage',
          description: 'Techniques de massage',
          parent_id: 1,
          post_count: 5
        },
        {
          id: 5,
          name: 'Relaxation',
          slug: 'relaxation',
          description: 'Méthodes de relaxation',
          parent_id: 1,
          post_count: 3
        }
      ]
    },
    {
      id: 2,
      name: 'Fitness',
      slug: 'fitness',
      description: 'Articles sur le fitness et l\'exercice',
      post_count: 8,
      children: [
        {
          id: 6,
          name: 'EMS',
          slug: 'ems',
          description: 'Électrostimulation musculaire',
          parent_id: 2,
          post_count: 4
        }
      ]
    },
    {
      id: 3,
      name: 'Actualités',
      slug: 'actualites',
      description: 'Nouvelles et annonces',
      post_count: 15
    }
  ];

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setCategories(demoCategories);
      setLoading(false);
    }, 500);
  }, []);

  // Toggle l'expansion d'une catégorie
  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Gérer les changements du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Générer le slug à partir du nom
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Sauvegarder une catégorie
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData = {
      ...formData,
      slug: formData.slug || generateSlug(formData.name)
    };

    try {
      if (editingCategory) {
        // Mettre à jour la catégorie existante
        const response = await fetch(`/api/admin/blog/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(categoryData),
        });

        if (response.ok) {
          // Mettre à jour localement pour la démo
          setCategories(prev => updateCategoryInTree(prev, editingCategory.id, categoryData));
        }
      } else {
        // Créer une nouvelle catégorie
        const response = await fetch('/api/admin/blog/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(categoryData),
        });

        if (response.ok) {
          // Ajouter localement pour la démo
          const newCategory: BlogCategory = {
            id: Date.now(),
            name: categoryData.name,
            slug: categoryData.slug,
            description: categoryData.description,
            parent_id: categoryData.parent_id ? parseInt(categoryData.parent_id) : undefined,
            post_count: 0
          };
          setCategories(prev => addCategoryToTree(prev, newCategory));
        }
      }

      // Réinitialiser le formulaire
      setFormData({ name: '', slug: '', description: '', parent_id: '' });
      setEditingCategory(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // Pour la démo, on met à jour localement
      if (editingCategory) {
        setCategories(prev => updateCategoryInTree(prev, editingCategory.id, categoryData));
      } else {
        const newCategory: BlogCategory = {
          id: Date.now(),
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          parent_id: categoryData.parent_id ? parseInt(categoryData.parent_id) : undefined,
          post_count: 0
        };
        setCategories(prev => addCategoryToTree(prev, newCategory));
      }
      setFormData({ name: '', slug: '', description: '', parent_id: '' });
      setEditingCategory(null);
    }
  };

  // Supprimer une catégorie
  const handleDelete = async (categoryId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    
    try {
      const response = await fetch(`/api/admin/blog/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        // Supprimer localement pour la démo
        setCategories(prev => removeCategoryFromTree(prev, categoryId));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      // Pour la démo, on supprime localement
      setCategories(prev => removeCategoryFromTree(prev, categoryId));
    }
  };

  // Éditer une catégorie
  const handleEdit = (category: BlogCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent_id: category.parent_id?.toString() || ''
    });
  };

  // Fonctions utilitaires pour manipuler l'arbre de catégories
  const updateCategoryInTree = (categories: BlogCategory[], id: number, updates: any): BlogCategory[] => {
    return categories.map(category => {
      if (category.id === id) {
        return { ...category, ...updates };
      }
      if (category.children) {
        return {
          ...category,
          children: updateCategoryInTree(category.children, id, updates)
        };
      }
      return category;
    });
  };

  const addCategoryToTree = (categories: BlogCategory[], newCategory: BlogCategory): BlogCategory[] => {
    if (!newCategory.parent_id) {
      return [...categories, newCategory];
    }
    
    return categories.map(category => {
      if (category.id === newCategory.parent_id) {
        return {
          ...category,
          children: [...(category.children || []), newCategory]
        };
      }
      if (category.children) {
        return {
          ...category,
          children: addCategoryToTree(category.children, newCategory)
        };
      }
      return category;
    });
  };

  const removeCategoryFromTree = (categories: BlogCategory[], id: number): BlogCategory[] => {
    return categories
      .filter(category => category.id !== id)
      .map(category => ({
        ...category,
        children: category.children ? removeCategoryFromTree(category.children, id) : undefined
      }));
  };

  // Récupérer toutes les catégories plates pour le select
  const getAllCategories = (categories: BlogCategory[]): BlogCategory[] => {
    let allCategories: BlogCategory[] = [];
    
    categories.forEach(category => {
      allCategories.push(category);
      if (category.children) {
        allCategories = [...allCategories, ...getAllCategories(category.children)];
      }
    });
    
    return allCategories;
  };

  // Rendu récursif des catégories
  const renderCategoryTree = (categories: BlogCategory[], level = 0) => {
    return categories.map(category => (
      <div key={category.id} className="space-y-2">
        <div className={`flex items-center justify-between p-3 rounded-lg ${level > 0 ? 'ml-6 bg-gray-50' : 'bg-white border'}`}>
          <div className="flex items-center flex-1">
            {category.children && category.children.length > 0 ? (
              <button
                onClick={() => toggleCategory(category.id)}
                className="mr-2 text-gray-500 hover:text-gray-700"
              >
                {expandedCategories.has(category.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-6 mr-2"></div>
            )}
            <Folder className="w-5 h-5 text-teal-600 mr-3" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{category.name}</div>
              <div className="text-sm text-gray-500">
                {category.description} • {category.post_count} articles
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
              /{category.slug}
            </span>
            <button
              onClick={() => handleEdit(category)}
              className="p-1 text-teal-600 hover:text-teal-800"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {category.children && expandedCategories.has(category.id) && (
          <div className="ml-6">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-2 text-gray-600">Chargement des catégories...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Gestion des catégories</h2>
        <p className="text-gray-600">
          Organisez vos articles de blog en catégories hiérarchiques
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Ex: Santé & Bien-être"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="sante-bien-etre"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Laisser vide pour générer automatiquement
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Description de la catégorie..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie parente
                </label>
                <select
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Aucune (catégorie racine)</option>
                  {getAllCategories(categories).map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {editingCategory ? 'Mettre à jour' : 'Créer'}
                </button>
                
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setFormData({ name: '', slug: '', description: '', parent_id: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Statistiques */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistiques</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total des catégories</span>
                <span className="font-semibold text-gray-800">
                  {getAllCategories(categories).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Catégories racines</span>
                <span className="font-semibold text-gray-800">
                  {categories.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sous-catégories</span>
                <span className="font-semibold text-gray-800">
                  {getAllCategories(categories).length - categories.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des catégories */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Catégories existantes</h3>
                <div className="text-sm text-gray-600">
                  {getAllCategories(categories).length} catégories
                </div>
              </div>
            </div>

            <div className="p-6">
              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune catégorie créée</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Commencez par créer votre première catégorie
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {renderCategoryTree(categories)}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Conseils d'organisation :</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Créez une hiérarchie logique pour faciliter la navigation</li>
                  <li>Limitez la profondeur à 2-3 niveaux maximum</li>
                  <li>Assurez-vous que chaque catégorie a au moins 3 articles</li>
                  <li>Utilisez des descriptions claires pour le SEO</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCategoriesManager;