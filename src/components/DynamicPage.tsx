// DynamicPage.tsx - Dynamic page component that fetches content from CMS
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: any;
  meta_title: string | null;
  meta_description: string | null;
  published: boolean;
}

interface Section {
  id: string;
  type: string;
  content: any;
}

interface DynamicPageProps {
  fallbackComponent?: React.ReactNode;
}

export default function DynamicPage({ fallbackComponent }: DynamicPageProps) {
  const { slug } = useParams<{ slug?: string }>();
  const [page, setPage] = useState<CMSPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      try {
        setLoading(true);
        
        // Fetch page by slug (use 'accueil' or empty for home)
        const pageSlug = slug || 'accueil';
        
        const { data, error: fetchError } = await supabase
          .from('cms_pages')
          .select('*')
          .eq('slug', pageSlug)
          .eq('published', true)
          .single();

        if (fetchError) {
          // If page doesn't exist in CMS, use fallback
          if (fetchError.code === 'PGRST116') {
            setPage(null);
          } else {
            console.error('Error fetching page:', fetchError);
            setError(fetchError.message);
          }
        } else {
          setPage(data);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load page');
      } finally {
        setLoading(false);
      }
    }

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Erreur</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // If no page found in CMS, show fallback component
  if (!page) {
    return fallbackComponent ? <>{fallbackComponent}</> : (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Page non trouvée</h1>
          <p className="text-gray-600">Cette page n'existe pas encore dans le CMS.</p>
        </div>
      </div>
    );
  }

  // Render the page content
  return (
    <div className="dynamic-page">
      {/* Page Title */}
      <div className="pt-24 pb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{page.title}</h1>
      </div>

      {/* Render sections */}
      {page.content?.sections?.map((section: Section, index: number) => (
        <DynamicSection key={section.id || index} section={section} />
      ))}

      {/* Render legacy content (simple HTML) */}
      {page.content?.html && (
        <div 
          className="content"
          dangerouslySetInnerHTML={{ __html: page.content.html }}
        />
      )}
    </div>
  );
}

// DynamicSection - Renders different section types
function DynamicSection({ section }: { section: Section }) {
  switch (section.type) {
    case 'hero':
      return <DynamicHero content={section.content} />;
    case 'text':
      return <DynamicText content={section.content} />;
    case 'image':
      return <DynamicImage content={section.content} />;
    case 'gallery':
      return <DynamicGallery content={section.content} />;
    case 'cta':
      return <DynamicCTA content={section.content} />;
    case 'contact':
      return <DynamicContact content={section.content} />;
    default:
      return (
        <div className="py-8 px-4">
          <p className="text-gray-500">Section type: {section.type}</p>
        </div>
      );
  }
}

// Hero Section
function DynamicHero({ content }: { content: any }) {
  return (
    <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
      {content.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${content.backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
      )}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{content.title}</h1>
        {content.subtitle && (
          <p className="text-xl md:text-2xl mb-8">{content.subtitle}</p>
        )}
        {content.ctaText && content.ctaLink && (
          <a 
            href={content.ctaLink}
            className="inline-block px-8 py-3 bg-teal-600 text-white font-bold rounded-full hover:bg-teal-700 transition-colors"
          >
            {content.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

// Text Section
function DynamicText({ content }: { content: any }) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content.html || content.text || '' }}
        />
      </div>
    </section>
  );
}

// Image Section
function DynamicImage({ content }: { content: any }) {
  return (
    <section className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <img 
          src={content.src} 
          alt={content.alt || ''}
          className="w-full h-auto rounded-lg"
        />
        {content.caption && (
          <p className="text-center text-gray-600 mt-2">{content.caption}</p>
        )}
      </div>
    </section>
  );
}

// Gallery Section
function DynamicGallery({ content }: { content: any }) {
  const images = content.images || [];
  const columns = content.columns || 3;
  
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
          {images.map((img: any, index: number) => (
            <div key={index} className="relative">
              <img 
                src={img.src} 
                alt={img.alt || ''}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function DynamicCTA({ content }: { content: any }) {
  return (
    <section className="py-16 px-4 bg-teal-900 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">{content.title}</h2>
        {content.description && (
          <p className="text-lg mb-8">{content.description}</p>
        )}
        {content.buttonText && content.buttonLink && (
          <a 
            href={content.buttonLink}
            className="inline-block px-8 py-3 bg-lime-500 text-teal-900 font-bold rounded-full hover:bg-lime-400 transition-colors"
          >
            {content.buttonText}
          </a>
        )}
      </div>
    </section>
  );
}

// Contact Section
function DynamicContact({ content }: { content: any }) {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">{content.title || 'Contactez-nous'}</h2>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
            </div>
            <button type="submit" className="w-full px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700">
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
