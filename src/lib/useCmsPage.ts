// useCmsPage.ts - Hook to fetch page content from CMS
import { useState, useEffect } from 'react';
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

export function useCmsPage(slug: string) {
  const [page, setPage] = useState<CMSPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      try {
        setLoading(true);
        
        const { data, error: fetchError } = await supabase
          .from('cms_pages')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // Page doesn't exist in CMS
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

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  return { page, loading, error };
}

// Check if CMS has content for a specific page
export async function checkCmsPageExists(slug: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('cms_pages')
      .select('id')
      .eq('slug', slug)
      .eq('published', true)
      .single();
    
    return !!data && !error;
  } catch {
    return false;
  }
}
