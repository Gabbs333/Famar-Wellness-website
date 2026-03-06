// Posts - Page d'administration des articles de blog
// Version améliorée avec BlogEditor professionnel

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Plus, Edit, Trash, X, Tag, Folder } from 'lucide-react';

// Import des composants de la Phase 4
import BlogEditor from '../components/editor/BlogEditor';
import type { BlogPost, BlogCategory, Tag as TagType } from '../components/editor/BlogEditor';
import BlogCategoriesManager from '../components/blog/BlogCategoriesManager';
import BlogTagsManager from '../components/blog/BlogTagsManager';

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  published: boolean;
  created_at: string;
  meta_title?: string;
  meta_description?: string;
  reading_time?: number;
  categories?: BlogCategory[];
  tags?: TagType[];
}

// Données de démonstration pour les catégories et tags
const demoCategories: BlogCategory[] = [
  { id: 1, name: 'Santé & Bien-être', slug: 'sante-bien-etre', description: 'Articles sur la santé', post_count: 12 },
  { id: 2, name: 'Fitness', slug: 'fitness', description: 'Articles sur le fitness', post_count: 8 },
  { id: 3, name: 'Actualités', slug: 'actualites', description: 'Nouvelles et annonces', post_count: 15 },
];

const demoTags: TagType[] = [
  { id: 1, name: 'Santé', slug: 'sante' },
  { id: 2, name: 'Bien-être', slug: 'bien-etre' },
  { id: 3, name: 'Massage', slug: 'massage' },
  { id: 4, name: 'Andullation', slug: 'andullation' },
  { id: 5, name: 'EMS', slug: 'ems' },
  { id: 6, name: 'Relaxation', slug: 'relaxation' },
];

type ViewMode = 'list' | 'editor' | 'categories' | 'tags';

const Posts = () => {
  const { token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentPost, setCurrentPost] = useState<Partial<Post>>({});
  const [categories] = useState<BlogCategory[]>(demoCategories);
  const [tags] = useState<TagType[]>(demoTags);

  // Charger les articles
  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/posts', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        // Fallback: utiliser des données de démonstration
        setPosts(getDemoPosts());
      }
    } catch (error) {
      console.error('Failed to fetch posts', error);
      // Fallback: utiliser des données de démonstration
      setPosts(getDemoPosts());
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Articles de démonstration
  const getDemoPosts = (): Post[] => [
    {
      id: 1,
      title: 'Les bienfaits de l\'Andullation',
      slug: 'bienfaits-andullation',
      excerpt: 'Découvrez comment la thérapie par andullation peut soulager vos douleurs chroniques.',
      content: '<p>Contenu de l\'article sur l\'andullation...</p>',
      image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
      published: true,
      created_at: '2026-02-15',
      reading_time: 5,
      categories: [demoCategories[0]],
      tags: [demoTags[3], demoTags[1]]
    },
    {
      id: 2,
      title: 'Préparation sportive avec l\'EMS',
      slug: 'preparation-sportive-ems',
      excerpt: 'Optimisez vos performances grâce à l\'électrostimulation musculaire.',
      content: '<p>Contenu de l\'article sur l\'EMS...</p>',
      image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
      published: true,
      created_at: '2026-02-10',
      reading_time: 4,
      categories: [demoCategories[1]],
      tags: [demoTags[4]]
    },
    {
      id: 3,
      title: 'Massage et grossesse',
      slug: 'massage-grossesse',
      excerpt: 'Pourquoi le massage est essentiel pendant la grossesse.',
      content: '<p>Contenu de l\'article sur le massage et la grossesse...</p>',
      image_url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800',
      published: false,
      created_at: '2026-02-05',
      reading_time: 6,
      categories: [demoCategories[0]],
      tags: [demoTags[2]]
    }
  ];

  // Sauvegarder un article
  const handleSave = async (post: BlogPost) => {
    const postData = {
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      image_url: post.image_url,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      meta_keywords: post.meta_keywords,
      reading_time: post.reading_time,
      published: post.published,
    };

    try {
      const method = post.id ? 'PUT' : 'POST';
      const url = post.id ? `/api/admin/posts/${post.id}` : '/api/admin/posts';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        setViewMode('list');
        fetchPosts();
        setCurrentPost({});
      }
    } catch (error) {
      console.error('Failed to save post', error);
      // Simulation locale pour démo
      if (post.id) {
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, ...postData } : p));
      } else {
        const newPost: Post = {
          ...postData,
          id: Date.now(),
          created_at: new Date().toISOString()
        } as Post;
        setPosts(prev => [...prev, newPost]);
      }
      setViewMode('list');
    }
  };

  // Publier un article
  const handlePublish = async (post: BlogPost) => {
    await handleSave({ ...post, published: true });
  };

  // Supprimer un article
  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setPosts(posts.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete post', error);
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  // Ouvrir l'éditeur
  const handleEdit = (post?: Post) => {
    setCurrentPost(post || {});
    setViewMode('editor');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-2 text-gray-600">Chargement des articles...</span>
      </div>
    );
  }

  // Vue Éditeur
  if (viewMode === 'editor') {
    const postToEdit: BlogPost | undefined = currentPost.id ? {
      id: currentPost.id,
      title: currentPost.title || '',
      slug: currentPost.slug || '',
      content: currentPost.content || '',
      excerpt: currentPost.excerpt || '',
      image_url: currentPost.image_url || '',
      published: currentPost.published || false,
      created_at: currentPost.created_at,
      meta_title: currentPost.meta_title,
      meta_description: currentPost.meta_description,
      reading_time: currentPost.reading_time,
      categories: currentPost.categories || [],
      tags: currentPost.tags || []
    } : undefined;

    return (
      <div className="h-full">
        <div className="mb-4">
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5 mr-2" />
            Retour à la liste
          </button>
        </div>
        <div className="h-[calc(100vh-120px)]">
          <BlogEditor
            post={postToEdit}
            categories={categories}
            availableTags={tags}
            onSave={handleSave}
            onPublish={handlePublish}
          />
        </div>
      </div>
    );
  }

  // Vue Catégories
  if (viewMode === 'categories') {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5 mr-2" />
            Retour à la liste des articles
          </button>
        </div>
        <BlogCategoriesManager token={token} />
      </div>
    );
  }

  // Vue Tags
  if (viewMode === 'tags') {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5 mr-2" />
            Retour à la liste des articles
          </button>
        </div>
        <BlogTagsManager token={token} />
      </div>
    );
  }

  // Vue Liste des articles
  return (
    <div>
      {/* En-tête avec onglets */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Articles</h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Articles
            </button>
            <button
              onClick={() => setViewMode('categories')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${
                (viewMode as ViewMode) === 'categories' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Folder className="w-4 h-4 mr-1" />
              Catégories
            </button>
            <button
              onClick={() => setViewMode('tags')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${
                (viewMode as ViewMode) === 'tags' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Tag className="w-4 h-4 mr-1" />
              Tags
            </button>
          </div>
        </div>
        <button
          onClick={() => handleEdit()}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvel article
        </button>
      </div>

      {/* Liste des articles */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégories</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lecture</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{post.title}</div>
                  <div className="text-sm text-gray-500">{post.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {post.categories?.map(cat => (
                      <span key={cat.id} className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs rounded-full">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    post.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {post.published ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {post.reading_time ? `${post.reading_time} min` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(post.created_at), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(post)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun article trouvé</p>
            <button
              onClick={() => handleEdit()}
              className="mt-4 text-teal-600 hover:text-teal-700"
            >
              Créer votre premier article
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;
