// Media Usage Tracker Component
// Tracks and displays where media files are used across the CMS

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Globe, 
  BookOpen,
  Layout,
  Link,
  Calendar,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Types
export interface MediaUsage {
  id: string;
  media_id: string;
  entity_type: string;
  entity_id: string;
  entity_name?: string;
  entity_url?: string;
  usage_context?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  user_name?: string;
}

export interface MediaUsageStats {
  totalUses: number;
  byEntityType: Record<string, number>;
  byUser: Record<string, number>;
  recentUses: MediaUsage[];
  unusedMedia: string[];
}

interface MediaUsageTrackerProps {
  mediaId: string;
  mediaName: string;
  onClose?: () => void;
}

const MediaUsageTracker: React.FC<MediaUsageTrackerProps> = ({
  mediaId,
  mediaName,
  onClose
}) => {
  const [usageData, setUsageData] = useState<MediaUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<MediaUsageStats | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch usage data
  const fetchUsageData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch usage records
      const { data, error: fetchError } = await supabase
        .from('media_usage')
        .select('*')
        .eq('media_id', mediaId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Enrich data with entity details
      const enrichedData = await Promise.all(
        (data || []).map(async (usage) => {
          let entityName = usage.entity_id;
          let entityUrl = '#';
          
          // Fetch entity details based on type
          try {
            switch (usage.entity_type) {
              case 'cms_page':
                const { data: pageData } = await supabase
                  .from('cms_pages')
                  .select('title, slug')
                  .eq('id', usage.entity_id)
                  .single();
                
                if (pageData) {
                  entityName = pageData.title;
                  entityUrl = `/admin/cms/pages/${pageData.slug}`;
                }
                break;
                
              case 'blog_post':
                const { data: postData } = await supabase
                  .from('posts')
                  .select('title, slug')
                  .eq('id', usage.entity_id)
                  .single();
                
                if (postData) {
                  entityName = postData.title;
                  entityUrl = `/admin/blog/posts/${postData.slug}`;
                }
                break;
                
              case 'user_profile':
                const { data: userData } = await supabase
                  .from('profiles')
                  .select('full_name, username')
                  .eq('id', usage.entity_id)
                  .single();
                
                if (userData) {
                  entityName = userData.full_name || userData.username;
                  entityUrl = `/admin/users/${userData.username}`;
                }
                break;
            }
          } catch (err) {
            console.warn(`Failed to fetch details for ${usage.entity_type}:`, err);
          }
          
          return {
            ...usage,
            entity_name: entityName,
            entity_url: entityUrl
          };
        })
      );

      setUsageData(enrichedData);
      calculateStats(enrichedData);
    } catch (err) {
      console.error('Error fetching usage data:', err);
      setError('Failed to load usage data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate usage statistics
  const calculateStats = (data: MediaUsage[]) => {
    const stats: MediaUsageStats = {
      totalUses: data.length,
      byEntityType: {},
      byUser: {},
      recentUses: data.slice(0, 5),
      unusedMedia: []
    };

    // Count by entity type
    data.forEach(usage => {
      stats.byEntityType[usage.entity_type] = (stats.byEntityType[usage.entity_type] || 0) + 1;
      
      if (usage.user_id) {
        stats.byUser[usage.user_id] = (stats.byUser[usage.user_id] || 0) + 1;
      }
    });

    setStats(stats);
  };

  // Get icon for entity type
  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'cms_page':
        return <Layout className="w-4 h-4 text-blue-600" />;
      case 'blog_post':
        return <BookOpen className="w-4 h-4 text-green-600" />;
      case 'user_profile':
        return <User className="w-4 h-4 text-purple-600" />;
      case 'website':
        return <Globe className="w-4 h-4 text-orange-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get display name for entity type
  const getEntityTypeName = (entityType: string) => {
    switch (entityType) {
      case 'cms_page':
        return 'CMS Page';
      case 'blog_post':
        return 'Blog Post';
      case 'user_profile':
        return 'User Profile';
      case 'website':
        return 'Website';
      default:
        return entityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Initial fetch
  useEffect(() => {
    fetchUsageData();
  }, [mediaId]);

  // Refresh data
  const handleRefresh = () => {
    fetchUsageData();
  };

  // Track new usage
  const trackNewUsage = async (entityType: string, entityId: string, context?: string) => {
    try {
      const { error } = await supabase
        .from('media_usage')
        .insert({
          media_id: mediaId,
          entity_type: entityType,
          entity_id: entityId,
          usage_context: context,
          user_id: 'current-user-id' // TODO: Get actual user ID
        });

      if (error) throw error;
      
      // Refresh data
      fetchUsageData();
      
      return { success: true };
    } catch (err) {
      console.error('Error tracking usage:', err);
      return { success: false, error: err };
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading usage data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ImageIcon className="w-5 h-5 text-gray-600 mr-2" />
            <div>
              <h3 className="font-medium text-gray-900">Media Usage Tracker</h3>
              <p className="text-sm text-gray-600">{mediaName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="p-1 text-gray-600 hover:text-gray-800"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 text-gray-600 hover:text-gray-800"
              title={showDetails ? 'Hide Details' : 'Show Details'}
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-gray-600 hover:text-gray-800"
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-600">{error}</span>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalUses}</div>
              <div className="text-sm text-gray-600">Total Uses</div>
            </div>
            
            {Object.entries(stats.byEntityType).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="text-xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{getEntityTypeName(type)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage List */}
      {showDetails && usageData.length > 0 && (
        <div className="p-4 border-b">
          <h4 className="font-medium text-gray-800 mb-3">Usage History</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {usageData.map((usage) => (
              <div key={usage.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="mr-3 mt-1">
                  {getEntityIcon(usage.entity_type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {usage.entity_name || usage.entity_id}
                      </p>
                      <p className="text-sm text-gray-600">
                        {getEntityTypeName(usage.entity_type)}
                        {usage.usage_context && ` • ${usage.usage_context}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{formatDate(usage.created_at)}</p>
                      {usage.user_name && (
                        <p className="text-xs text-gray-500">by {usage.user_name}</p>
                      )}
                    </div>
                  </div>
                  {usage.entity_url && usage.entity_url !== '#' && (
                    <a
                      href={usage.entity_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Link className="w-3 h-3 mr-1" />
                      View {getEntityTypeName(usage.entity_type)}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {usageData.length === 0 && !loading && !error && (
        <div className="p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <EyeOff className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Usage Found</h4>
          <p className="text-gray-600 mb-4">
            This media file hasn't been used anywhere yet.
          </p>
          <div className="text-sm text-gray-500">
            <p>Usage will be automatically tracked when this file is:</p>
            <ul className="mt-2 space-y-1">
              <li>• Added to a CMS page</li>
              <li>• Used in a blog post</li>
              <li>• Set as a user profile picture</li>
              <li>• Referenced in any content</li>
            </ul>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 bg-gray-50 rounded-b-lg">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Last updated: {usageData.length > 0 ? formatDate(usageData[0].updated_at) : 'Never'}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaUsageTracker;

// Hook for tracking media usage
export const useMediaTracking = () => {
  const trackUsage = async (
    mediaId: string,
    entityType: string,
    entityId: string,
    context?: string
  ) => {
    try {
      const { error } = await supabase
        .from('media_usage')
        .upsert({
          media_id: mediaId,
          entity_type: entityType,
          entity_id: entityId,
          usage_context: context,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'media_id,entity_type,entity_id'
        });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error tracking media usage:', err);
      return { success: false, error: err };
    }
  };

  const getMediaUsage = async (mediaId: string) => {
    try {
      const { data, error } = await supabase
        .from('media_usage')
        .select('*')
        .eq('media_id', mediaId);

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error getting media usage:', err);
      return { success: false, error: err };
    }
  };

  const getUnusedMedia = async (daysUnused = 30) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysUnused);

      // Get all media items
      const { data: allMedia, error: mediaError } = await supabase
        .from('media_items')
        .select('id, created_at');

      if (mediaError) throw mediaError;

      // Get media with recent usage
      const { data: recentUsage, error: usageError } = await supabase
        .from('media_usage')
        .select('media_id')
        .gte('updated_at', cutoffDate.toISOString());

      if (usageError) throw usageError;

      // Find unused media
      const usedMediaIds = new Set(recentUsage?.map(usage => usage.media_id) || []);
      const unusedMedia = allMedia?.filter(media => !usedMediaIds.has(media.id)) || [];

      return { success: true, data: unusedMedia };
    } catch (err) {
      console.error('Error getting unused media:', err);
      return { success: false, error: err };
    }
  };

  return {
    trackUsage,
    getMediaUsage,
    getUnusedMedia
  };
};