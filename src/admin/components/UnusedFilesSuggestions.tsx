// Unused Files Suggestions Component
// Suggests files for deletion based on usage patterns

import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  HardDrive,
  CheckCircle,
  XCircle,
  Download,
  Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatFileSize } from '../../lib/image-optimization';

// Types
export interface UnusedFile {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  last_used?: string;
  days_unused: number;
  usage_count: number;
}

export interface DeletionSuggestions {
  files: UnusedFile[];
  totalSize: number;
  potentialSavings: number;
  byAge: {
    recent: number;      // < 7 days
    moderate: number;    // 7-30 days
    old: number;         // > 30 days
  };
  byType: Record<string, number>;
  recommendations: string[];
}

interface UnusedFilesSuggestionsProps {
  onSelectFiles?: (files: UnusedFile[]) => void;
  onDeleteFiles?: (files: UnusedFile[]) => Promise<void>;
  maxAgeDays?: number;
  minSizeKB?: number;
}

const UnusedFilesSuggestions: React.FC<UnusedFilesSuggestionsProps> = ({
  onSelectFiles,
  onDeleteFiles,
  maxAgeDays = 90,
  minSizeKB = 100
}) => {
  const [suggestions, setSuggestions] = useState<DeletionSuggestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch unused files
  const fetchUnusedFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

      // Get all media items
      const { data: allMedia, error: mediaError } = await supabase
        .from('media_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (mediaError) throw mediaError;

      // Get media usage
      const { data: usageData, error: usageError } = await supabase
        .from('media_usage')
        .select('media_id, MAX(updated_at) as last_used, COUNT(*) as usage_count')
        .groupBy('media_id');

      if (usageError) throw usageError;

      // Create usage map
      const usageMap = new Map();
      usageData?.forEach(usage => {
        usageMap.set(usage.media_id, {
          last_used: usage.last_used,
          usage_count: usage.usage_count
        });
      });

      // Filter unused files
      const unusedFiles: UnusedFile[] = [];
      const now = new Date();

      allMedia?.forEach(media => {
        const usage = usageMap.get(media.id);
        const lastUsed = usage?.last_used ? new Date(usage.last_used) : new Date(media.created_at);
        const daysUnused = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if file meets criteria for suggestion
        const isUnused = !usage || usage.usage_count === 0;
        const isOldEnough = daysUnused >= 30; // At least 30 days unused
        const isLargeEnough = media.file_size >= minSizeKB * 1024;
        
        if (isUnused && isOldEnough && isLargeEnough) {
          unusedFiles.push({
            ...media,
            last_used: usage?.last_used,
            days_unused: daysUnused,
            usage_count: usage?.usage_count || 0
          });
        }
      });

      // Sort by potential impact (size * age)
      unusedFiles.sort((a, b) => {
        const impactA = a.file_size * a.days_unused;
        const impactB = b.file_size * b.days_unused;
        return impactB - impactA; // Descending
      });

      // Calculate statistics
      const totalSize = unusedFiles.reduce((sum, file) => sum + file.file_size, 0);
      
      const byAge = {
        recent: unusedFiles.filter(f => f.days_unused < 7).length,
        moderate: unusedFiles.filter(f => f.days_unused >= 7 && f.days_unused <= 30).length,
        old: unusedFiles.filter(f => f.days_unused > 30).length
      };
      
      const byType: Record<string, number> = {};
      unusedFiles.forEach(file => {
        const type = file.mime_type.split('/')[0] || 'other';
        byType[type] = (byType[type] || 0) + 1;
      });

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (byAge.old > 0) {
        recommendations.push(`Delete ${byAge.old} files unused for over 30 days`);
      }
      
      if (totalSize > 100 * 1024 * 1024) { // > 100MB
        recommendations.push(`Free up ${formatFileSize(totalSize)} of storage`);
      }
      
      const largeFiles = unusedFiles.filter(f => f.file_size > 5 * 1024 * 1024); // > 5MB
      if (largeFiles.length > 0) {
        recommendations.push(`Remove ${largeFiles.length} large unused files`);
      }

      const result: DeletionSuggestions = {
        files: unusedFiles,
        totalSize,
        potentialSavings: totalSize,
        byAge,
        byType,
        recommendations
      };

      setSuggestions(result);
      
      // Notify parent component
      if (onSelectFiles) {
        onSelectFiles(unusedFiles);
      }
    } catch (err) {
      console.error('Error fetching unused files:', err);
      setError('Failed to load unused files suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleSelectFile = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (!suggestions) return;
    
    if (selectedFiles.size === suggestions.files.length) {
      // Deselect all
      setSelectedFiles(new Set());
    } else {
      // Select all
      setSelectedFiles(new Set(suggestions.files.map(f => f.id)));
    }
  };

  // Handle delete selected
  const handleDeleteSelected = async () => {
    if (!suggestions || selectedFiles.size === 0) return;
    
    const selected = suggestions.files.filter(f => selectedFiles.has(f.id));
    
    if (!confirm(`Are you sure you want to delete ${selected.length} files? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setDeleting(true);
      
      if (onDeleteFiles) {
        await onDeleteFiles(selected);
      } else {
        // Default deletion logic
        for (const file of selected) {
          // Delete from storage
          await supabase.storage
            .from('cms-images')
            .remove([file.file_path]);
          
          // Delete from database
          await supabase
            .from('media_items')
            .delete()
            .eq('id', file.id);
        }
      }
      
      // Refresh suggestions
      await fetchUnusedFiles();
      setSelectedFiles(new Set());
      
    } catch (err) {
      console.error('Error deleting files:', err);
      setError('Failed to delete files. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Get file icon based on type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType.startsWith('video/')) {
      return '🎬';
    } else if (mimeType.startsWith('audio/')) {
      return '🎵';
    } else if (mimeType.includes('pdf')) {
      return '📄';
    } else if (mimeType.includes('zip') || mimeType.includes('compressed')) {
      return '📦';
    }
    return '📎';
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never used';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Initial fetch
  useEffect(() => {
    fetchUnusedFiles();
  }, [maxAgeDays, minSizeKB]);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Analyzing unused files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-600">{error}</span>
        </div>
        <button
          onClick={fetchUnusedFiles}
          className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!suggestions || suggestions.files.length === 0) {
    return (
      <div className="p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">No Unused Files Found</h4>
        <p className="text-gray-600">
          Great! All your media files are being used or are too recent to suggest deletion.
        </p>
        <button
          onClick={fetchUnusedFiles}
          className="mt-4 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Refresh Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
            <div>
              <h3 className="font-medium text-gray-900">Unused Files Suggestions</h3>
              <p className="text-sm text-gray-600">
                {suggestions.files.length} files · {formatFileSize(suggestions.totalSize)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 text-gray-600 hover:text-gray-800"
              title={showDetails ? 'Hide Details' : 'Show Details'}
            >
              {showDetails ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={fetchUnusedFiles}
              className="p-1 text-gray-600 hover:text-gray-800"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {showDetails && (
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{suggestions.files.length}</div>
              <div className="text-sm text-gray-600">Total Files</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{formatFileSize(suggestions.totalSize)}</div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{suggestions.byAge.old}</div>
              <div className="text-sm text-gray-600">Old (&gt;30 days)</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{Object.keys(suggestions.byType).length}</div>
              <div className="text-sm text-gray-600">File Types</div>
            </div>
          </div>

          {/* Recommendations */}
          {suggestions.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {suggestions.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Files List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="selectAll"
              checked={selectedFiles.size === suggestions.files.length && suggestions.files.length > 0}
              onChange={handleSelectAll}
              className="rounded"
            />
            <label htmlFor="selectAll" className="text-sm text-gray-700">
              Select all ({selectedFiles.size} selected)
            </label>
          </div>
          <div className="text-sm text-gray-600">
            Sort by: <span className="font-medium">Impact (Size × Age)</span>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {suggestions.files.map((file) => (
            <div
              key={file.id}
              className={`flex items-center p-3 rounded-lg border ${
                selectedFiles.has(file.id) ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedFiles.has(file.id)}
                onChange={() => handleSelectFile(file.id)}
                className="mr-3 rounded"
              />
              
              <div className="mr-3 text-xl">
                {getFileIcon(file.mime_type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-900 truncate">
                      {file.original_filename}
                    </p>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {file.days_unused} days unused
                      </span>
                      <span>•</span>
                      <span>{file.usage_count} uses</span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>Created: {formatDate(file.created_at)}</div>
                    <div>Last used: {formatDate(file.last_used)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedFiles.size > 0 ? (
              <>
                <span className="font-medium">{selectedFiles.size} files</span> selected ·{' '}
                <span className="font-medium">
                  {formatFileSize(
                    suggestions.files
                      .filter(f => selectedFiles.has(f.id))
                      .reduce((sum, f) => sum + f.file_size, 0)
                  )}
                </span>{' '}
                total
              </>
            ) : (
              'Select files to delete'
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={fetchUnusedFiles}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
              disabled={deleting}
            >
              Refresh
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedFiles.size === 0 || deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedFiles.size})
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Warning */}
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Warning: Deletion is permanent</p>
              <p>Deleted files cannot be recovered. Make sure these files are not being used anywhere before deleting.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnusedFilesSuggestions;

// Hook for unused files management
export const useUnusedFiles = () => {
  const getUnusedFiles = async (options?: {
    maxAgeDays?: number;
    minSizeKB?: number;
  }) => {
    const { maxAgeDays = 90, minSizeKB = 100 } = options || {};
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

      // Get all media
      const { data: allMedia, error: mediaError } = await supabase
        .from('media_items')
        .select('*');

      if (mediaError) throw mediaError;

      // Get usage data
      const { data: usageData, error: usageError } = await supabase
        .from('media_usage')
        .select('media_id, MAX(updated_at) as last_used, COUNT(*) as usage_count')
        .groupBy('media_id');

      if (usageError) throw usageError;

      // Filter unused files
      const usageMap = new Map();
      usageData?.forEach(usage => {
        usageMap.set(usage.media_id, {
          last_used: usage.last_used,
          usage_count: usage.usage_count
        });
      });

      const now = new Date();
      const unusedFiles: UnusedFile[] = [];

      allMedia?.forEach(media => {
        const usage = usageMap.get(media.id);
        const lastUsed = usage?.last_used ? new Date(usage.last_used) : new Date(media.created_at);
        const daysUnused = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
        
        const isUnused = !usage || usage.usage_count === 0;
        const isOldEnough = daysUnused >= 30;
        const isLargeEnough = media.file_size >= minSizeKB * 1024;
        
        if (isUnused && isOldEnough && isLargeEnough) {
          unusedFiles.push({
            ...media,
            last_used: usage?.last_used,
            days_unused: daysUnused,
            usage_count: usage?.usage_count || 0
          });
        }
      });

      return { success: true, data: unusedFiles };
    } catch (err) {
      console.error('Error getting unused files:', err);
      return { success: false, error: err };
    }
  };

  const deleteFiles = async (fileIds: string[]) => {
    try {
      // Get file paths first
      const { data: files, error: fetchError } = await supabase
        .from('media_items')
        .select('file_path')
        .in('id', fileIds);

      if (fetchError) throw fetchError;

      // Delete from storage
      const filePaths = files?.map(f => f.file_path) || [];
      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('cms-images')
          .remove(filePaths);

        if (storageError) throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('media_items')
        .delete()
        .in('id', fileIds);

      if (dbError) throw dbError;

      return { success: true, deletedCount: fileIds.length };
    } catch (err) {
      console.error('Error deleting files:', err);
      return { success: false, error: err };
    }
  };

  return {
    getUnusedFiles,
    deleteFiles
  };
};