// BlogProfessional - Composant de blog professionnel
// Affiche les articles avec mise en page moderne, articles similaires et partage social

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, ArrowRight, User, Tag } from 'lucide-react';

interface BlogPost {
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
  categories?: { id: number; name: string; slug: string }[];
  tags?: { id: number; name: string; slug: string }[];
  author?: { name: string; avatar?: string };
}

interface BlogProfessionalProps {
  posts?: BlogPost[];
  featuredPost?: BlogPost;
  categories?: { id: number; name: string; slug: string; post_count: number }[];
  tags?: { id: number; name: string; slug: string }[];
  onPostClick?: (post: BlogPost) => void;
  onCategoryClick?: (categorySlug: string) => void;
  onTagClick?: (tagSlug: string) => void;
  showFeatured?: boolean;
  showCategories?: boolean;
  showTags?: boolean;
  showRelated?: boolean;
  limit?: number;
}

// Articles de démonstration
const demoPosts: BlogPost[] = [
  {
    id: 1,
    title: "Les bienfaits de l'Andullation",
    slug: "bienfaits-andullation",
    excerpt: "Découvrez comment la thérapie par andullation peut soulager vos douleurs chroniques et améliorer votre sommeil.",
    content: "<p>Contenu de l'article...</p>",
    image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    published: true,
    created_at: "2026-02-15",
    reading_time: 5,
    categories: [{ id: 1, name: 'Santé', slug: 'sante' }],
    tags: [{ id: 1, name: 'Andullation', slug: 'andullation' }, { id: 2, name: 'Douleurs', slug: 'douleurs' }],
    author: { name: 'Équipe Famard Wellness' }
  },
  {
    id: 2,
    title: "Préparation sportive avec l'EMS",
    slug: "preparation-sportive-ems",
    excerpt: "Optimisez vos performances et récupérez plus vite grâce à l'électrostimulation musculaire I-Motion.",
    content: "<p>Contenu de l'article...</p>",
    image_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    published: true,
    created_at: "2026-02-10",
    reading_time: 4,
    categories: [{ id: 2, name: 'Fitness', slug: 'fitness' }],
    tags: [{ id: 3, name: 'EMS', slug: 'ems' }, { id: 4, name: 'Sport', slug: 'sport' }],
    author: { name: 'Équipe Famard Wellness' }
  },
  {
    id: 3,
    title: "Massage et grossesse",
    slug: "massage-grossesse",
    excerpt: "Pourquoi le massage est essentiel pour soulager les tensions et préparer le corps pendant la grossesse.",
    content: "<p>Contenu de l'article...</p>",
    image_url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    published: true,
    created_at: "2026-02-05",
    reading_time: 6,
    categories: [{ id: 1, name: 'Santé', slug: 'sante' }],
    tags: [{ id: 5, name: 'Massage', slug: 'massage' }, { id: 6, name: 'Grossesse', slug: 'grossesse' }],
    author: { name: 'Équipe Famard Wellness' }
  }
];

const BlogProfessional: React.FC<BlogProfessionalProps> = ({
  posts = demoPosts,
  featuredPost,
  categories = [],
  tags = [],
  onPostClick,
  onCategoryClick,
  onTagClick,
  showFeatured = true,
  showCategories = true,
  showTags = true,
  showRelated = true,
  limit
}) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const displayPosts = limit ? posts.slice(0, limit) : posts;
  const currentFeatured = featuredPost || displayPosts[0];
  const otherPosts = displayPosts.filter(p => p.id !== currentFeatured?.id);

  // Formater la date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Copier le lien
  const copyLink = () => {
    const url = window.location.origin + '/blog/' + selectedPost?.slug;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Partager sur les réseaux sociaux
  const shareOnSocial = (platform: string) => {
    const url = window.location.origin + '/blog/' + selectedPost?.slug;
    const title = selectedPost?.title || '';
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  // Afficher un article
  const handlePostClick = (post: BlogPost) => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      setSelectedPost(post);
    }
  };

  // Obtenir les articles similaires
  const getRelatedPosts = (post: BlogPost): BlogPost[] => {
    if (!showRelated) return [];
    
    const postCategoryIds = post.categories?.map(c => c.id) || [];
    const postTagIds = post.tags?.map(t => t.id) || [];
    
    return displayPosts
      .filter(p => p.id !== post.id)
      .map(p => {
        const categoryMatch = p.categories?.some(c => postCategoryIds.includes(c.id)) ? 1 : 0;
        const tagMatch = p.tags?.some(t => postTagIds.includes(t.id)) ? 1 : 0;
        return { post: p, score: categoryMatch + tagMatch };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.post);
  };

  // Vue détaillée d'un article
  if (selectedPost) {
    const relatedPosts = getRelatedPosts(selectedPost);
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* En-tête de l'article */}
        <div className="relative h-96 bg-gray-900">
          {selectedPost.image_url && (
            <img 
              src={selectedPost.image_url} 
              alt={selectedPost.title}
              className="w-full h-full object-cover opacity-50"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 max-w-4xl mx-auto">
            {/* Catégories */}
            {selectedPost.categories && selectedPost.categories.length > 0 && (
              <div className="flex gap-2 mb-4">
                {selectedPost.categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryClick?.(cat.slug)}
                    className="px-3 py-1 bg-teal-600 text-white text-sm rounded-full hover:bg-teal-700 transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
            
            <h1 className="text-4xl font-bold text-white mb-4">{selectedPost.title}</h1>
            
            <div className="flex items-center text-gray-300 space-x-6">
              {selectedPost.author && (
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span>{selectedPost.author.name}</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(selectedPost.created_at)}
              </div>
              {selectedPost.reading_time && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {selectedPost.reading_time} min de lecture
                </div>
              )}
            </div>
          </div>
          
          {/* Bouton retour */}
          <button
            onClick={() => setSelectedPost(null)}
            className="absolute top-8 left-8 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            ← Retour au blog
          </button>
        </div>

        {/* Contenu de l'article */}
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Partage */}
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Partager:</span>
                <button onClick={() => shareOnSocial('facebook')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                  <Facebook className="w-5 h-5" />
                </button>
                <button onClick={() => shareOnSocial('twitter')} className="p-2 text-blue-400 hover:bg-blue-50 rounded-full transition-colors">
                  <Twitter className="w-5 h-5" />
                </button>
                <button onClick={() => shareOnSocial('linkedin')} className="p-2 text-blue-700 hover:bg-blue-50 rounded-full transition-colors">
                  <Linkedin className="w-5 h-5" />
                </button>
                <button onClick={copyLink} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  {copiedLink ? <span className="text-green-600 text-sm">Copié!</span> : <LinkIcon className="w-5 h-5" />}
                </button>
              </div>
              
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </button>
            </div>

            {/* Contenu */}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedPost.content }}
            />

            {/* Tags */}
            {selectedPost.tags && selectedPost.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center flex-wrap gap-2">
                  <Tag className="w-5 h-5 text-gray-400 mr-2" />
                  {selectedPost.tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => onTagClick?.(tag.slug)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Articles similaires */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Articles similaires</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map(post => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handlePostClick(post)}
                  >
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={post.image_url} 
                        alt={post.title}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vue liste des articles
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-16">
          <span className="text-teal-600 font-semibold tracking-wider uppercase text-sm">Blog</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2">Actualités & Conseils</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Découvrez nos articles sur la santé, le bien-être et nos services
          </p>
        </div>

        {/* Filtres catégories */}
        {showCategories && categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => onCategoryClick?.('')}
              className="px-4 py-2 bg-teal-600 text-white rounded-full text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              Tous
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onCategoryClick?.(cat.slug)}
                className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
              >
                {cat.name} ({cat.post_count})
              </button>
            ))}
          </div>
        )}

        {/* Article featured */}
        {showFeatured && currentFeatured && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12 cursor-pointer"
            onClick={() => handlePostClick(currentFeatured)}
          >
            <div className="md:flex">
              <div className="md:w-1/2">
                <img 
                  src={currentFeatured.image_url} 
                  alt={currentFeatured.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-center">
                {currentFeatured.categories && currentFeatured.categories.length > 0 && (
                  <span className="text-teal-600 font-medium text-sm mb-2">
                    {currentFeatured.categories[0].name}
                  </span>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{currentFeatured.title}</h3>
                <p className="text-gray-600 mb-6 line-clamp-3">{currentFeatured.excerpt}</p>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(currentFeatured.created_at)}
                  </div>
                  {currentFeatured.reading_time && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {currentFeatured.reading_time} min
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grille d'articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handlePostClick(post)}
            >
              <div className="aspect-video overflow-hidden">
                <img 
                  src={post.image_url} 
                  alt={post.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                {post.categories && post.categories.length > 0 && (
                  <span className="text-teal-600 font-medium text-xs uppercase tracking-wider">
                    {post.categories[0].name}
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900 mt-2 mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500 space-x-3">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(post.created_at)}
                    </div>
                    {post.reading_time && (
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.reading_time} min
                      </div>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-teal-600 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Tags populaires */}
        {showTags && tags.length > 0 && (
          <div className="mt-16 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags populaires</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {tags.slice(0, 10).map(tag => (
                <button
                  key={tag.id}
                  onClick={() => onTagClick?.(tag.slug)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogProfessional;
export type { BlogPost, BlogProfessionalProps };
