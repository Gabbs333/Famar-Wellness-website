import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  File, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Trash2, 
  Eye, 
  Download,
  Replace,
  Check,
  X,
  Loader2,
  FolderOpen,
  MoreVertical
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Types
interface MediaItem {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  credits?: string;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
  url: string;
}

interface MediaUsage {
  media_id: string;
  entity_type: string;
  entity_id: string;
  usage_context?: string;
  created_at: string;
}

interface MediaManagerProps {
  onSelect?: (items: MediaItem[]) => void;
  multiple?: boolean;
  allowedTypes?: string[];
  currentSelection?: MediaItem[];
  maxFiles?: number;
  maxSize?: number; // in bytes
}

const MediaManager: React.FC<MediaManagerProps> = ({
  onSelect,
  multiple = false,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
  currentSelection = [],
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
}) => {
  // State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>(currentSelection);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [usageData, setUsageData] = useState<Record<string, MediaUsage[]>>({});
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Available file types for filtering
  const fileTypes = [
    { value: 'all', label: 'All Files', icon: FolderOpen },
    { value: 'image/jpeg', label: 'JPEG Images', icon: ImageIcon },
    { value: 'image/png', label: 'PNG Images', icon: ImageIcon },
    { value: 'image/webp', label: 'WebP Images', icon: ImageIcon },
    { value: 'image/gif', label: 'GIF Images', icon: ImageIcon },
    { value: 'application/pdf', label: 'PDF Documents', icon: File },
  ];

  // Fetch media items
  const fetchMediaItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Build query
      let query = supabase
        .from('media_items')
        .select('*', { count: 'exact' })
        .range(from, to);

      // Apply filters
      if (filterType !== 'all') {
        query = query.eq('mime_type', filterType);
      }

      // Apply search
      if (searchQuery) {
        query = query.or(`filename.ilike.%${searchQuery}%,original_filename.ilike.%${searchQuery}%,alt_text.ilike.%${searchQuery}%`);
      }

      // Apply sorting
      const orderColumn = sortBy === 'date' ? 'created_at' : sortBy === 'name' ? 'filename' : 'file_size';
      query = query.order(orderColumn, { ascending: sortOrder === 'asc' });

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      // Transform data to include URLs
      const itemsWithUrls = (data || []).map(item => ({
        ...item,
        url: `${supabase.storage.from('cms-images').getPublicUrl(item.file_path).data.publicUrl}`
      }));

      setMediaItems(itemsWithUrls);
      setFilteredItems(itemsWithUrls);
      
      // Calculate total pages
      if (count) {
        setTotalPages(Math.ceil(count / itemsPerPage));
      }
    } catch (err) {
      console.error('Error fetching media items:', err);
      setError('Failed to load media items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterType, searchQuery, sortBy, sortOrder, itemsPerPage]);

  // Fetch usage data for selected items
  const fetchUsageData = useCallback(async (itemIds: string[]) => {
    if (itemIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('media_usage')
        .select('*')
        .in('media_id', itemIds);

      if (error) throw error;

      // Group by media_id
      const groupedData: Record<string, MediaUsage[]> = {};
      data?.forEach(usage => {
        if (!groupedData[usage.media_id]) {
          groupedData[usage.media_id] = [];
        }
        groupedData[usage.media_id].push(usage);
      });

      setUsageData(prev => ({ ...prev, ...groupedData }));
    } catch (err) {
      console.error('Error fetching usage data:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMediaItems();
  }, [fetchMediaItems]);

  // Fetch usage data when selection changes
  useEffect(() => {
    if (selectedItems.length > 0) {
      const itemIds = selectedItems.map(item => item.id);
      fetchUsageData(itemIds);
    }
  }, [selectedItems, fetchUsageData]);

  // Handle file selection
  const handleFileSelect = (item: MediaItem) => {
    if (multiple) {
      const isSelected = selectedItems.some(selected => selected.id === item.id);
      if (isSelected) {
        setSelectedItems(prev => prev.filter(selected => selected.id !== item.id));
      } else {
        if (selectedItems.length < maxFiles) {
          setSelectedItems(prev => [...prev, item]);
        }
      }
    } else {
      setSelectedItems([item]);
    }
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    const filesArray = Array.from(files);
    
    // Validate files
    const validFiles = filesArray.filter(file => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        setError(`File type ${file.type} not allowed.`);
        return false;
      }
      
      // Check file size
      if (file.size > maxSize) {
        setError(`File ${file.name} exceeds maximum size of ${formatFileSize(maxSize)}.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        // Generate unique filename
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = `uploads/${timestamp}_${file.name.replace(/\.[^/.]+$/, '')}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('cms-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Create media item record
        const { data: mediaData, error: mediaError } = await supabase
          .from('media_items')
          .insert({
            filename: fileName.split('/').pop() || file.name,
            original_filename: file.name,
            file_path: fileName,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: null, // TODO: Get actual user ID from auth
          })
          .select()
          .single();

        if (mediaError) throw mediaError;

        // Update progress
        setUploadProgress(((index + 1) / validFiles.length) * 100);

        return mediaData;
      });

      const uploadedItems = await Promise.all(uploadPromises);
      
      // Refresh media list
      await fetchMediaItems();
      
      // Select uploaded items if in selection mode
      if (onSelect && uploadedItems.length > 0) {
        const itemsWithUrls = uploadedItems.map(item => ({
          ...item,
          url: `${supabase.storage.from('cms-images').getPublicUrl(item.file_path).data.publicUrl}`
        }));
        onSelect(itemsWithUrls);
      }

    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('border-teal-500', 'bg-teal-50');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-teal-500', 'bg-teal-50');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-teal-500', 'bg-teal-50');
    }
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    const filtered = mediaItems.filter(item =>
      item.filename.toLowerCase().includes(query) ||
      item.original_filename.toLowerCase().includes(query) ||
      (item.alt_text && item.alt_text.toLowerCase().includes(query))
    );
    
    setFilteredItems(filtered);
  };

  // Handle item deletion
  const handleDeleteItem = async (item: MediaItem) => {
    if (!confirm(`Are you sure you want to delete "${item.original_filename}"?`)) {
      return;
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('cms-images')
        .remove([item.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('media_items')
        .delete()
        .eq('id', item.id);

      if (dbError) throw dbError;

      // Remove from state
      setMediaItems(prev => prev.filter(i => i.id !== item.id));
      setFilteredItems(prev => prev.filter(i => i.id !== item.id));
      setSelectedItems(prev => prev.filter(i => i.id !== item.id));

    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
    }
  };

  // Handle item replacement
  const handleReplaceItem = async (item: MediaItem, newFile: File) => {
    try {
      // Upload new file
      const timestamp = Date.now();
      const fileExt = newFile.name.split('.').pop();
      const newFileName = `uploads/${timestamp}_${newFile.name.replace(/\.[^/.]+$/, '')}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('cms-images')
        .upload(newFileName, newFile, { upsert: true });

      if (uploadError) throw uploadError;

      // Update media item record
      const { error: updateError } = await supabase
        .from('media_items')
        .update({
          filename: newFileName.split('/').pop() || newFile.name,
          original_filename: newFile.name,
          file_path: newFileName,
          file_size: newFile.size,
          mime_type: newFile.type,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id);

      if (updateError) throw updateError;

      // Refresh media list
      await fetchMediaItems();

    } catch (err) {
      console.error('Error replacing item:', err);
      setError('Failed to replace item. Please try again.');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get file icon based on type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6 text-teal-600" />;
    } else if (mimeType === 'application/pdf') {
      return <File className="w-6 h-6 text-red-600" />;
    }
    return <File className="w-6 h-6 text-gray-600" />;
  };

  // Render loading state
  if (loading && mediaItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <span className="ml-2 text-gray-600">Loading media library...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Media Library</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {fileTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'size')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <X className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-600">{error}</span>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="mb-6 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-teal-500 transition-colors"
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          Drag and drop files here, or{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            click to browse
          </button>
        </p>
        <p className="text-sm text-gray-500">
          Supported: {allowedTypes.map(type => type.split('/')[1]).join(', ')} • Max size: {formatFileSize(maxSize)}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
      </div>

      {/* Media Grid/List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No media found</h3>
          <p className="text-gray-600">
            {searchQuery || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Upload your first file to get started'}
          </p>
        </div>
      ) : (
        <>
          {/* Selection Summary */}
          {selectedItems.length > 0 && (
            <div className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-teal-600 mr-2" />
                  <span className="text-teal-700">
                    {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {onSelect && (
                    <button
                      onClick={() => onSelect(selectedItems)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      Use Selected
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedItems([])}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Media Items */}
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' 
            : 'space-y-2'
          }>
            {filteredItems.map(item => {
              const isSelected = selectedItems.some(selected => selected.id === item.id);
              const itemUsage = usageData[item.id] || [];

              return (
                <div
                  key={item.id}
                  className={`relative group border rounded-lg overflow-hidden transition-all ${
                    isSelected 
                      ? 'border-teal-500 ring-2 ring-teal-200' 
                      : 'border-gray-200 hover:border-teal-300'
                  } ${viewMode === 'list' ? 'flex items-center p-4' : ''}`}
                  onClick={() => handleFileSelect(item)}
                >
                  {/* Selection Checkbox */}
                  <div className={`absolute top-2 left-2 z-10 ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-teal-500' : 'bg-white border border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className={`absolute top-2 right-2 z-10 ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement actions menu
                        }}
                        className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail/Preview */}
                  {viewMode === 'grid' ? (
                    <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                      {item.mime_type.startsWith('image/') ? (
                        <img
                          src={item.url}
                          alt={item.alt_text || item.original_filename}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="p-4">
                          {getFileIcon(item.mime_type)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                      {item.mime_type.startsWith('image/') ? (
                        <img
                          src={item.url}
                          alt={item.alt_text || item.original_filename}
                          className="w-full h-full object-cover rounded-lg"
                          loading="lazy"
                        />
                      ) : (
                        getFileIcon(item.mime_type)
                      )}
                    </div>
                  )}

                  {/* File Info */}
                  <div className={`p-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.original_filename}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(item.file_size)} • {formatDate(item.created_at)}
                      </p>
                    </div>

                    {/* Usage Info */}
                    {itemUsage.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">
                          Used in {itemUsage.length} place{itemUsage.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-2 flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewItem(item);
                        }}
                        className="p-1 text-gray-600 hover:text-teal-600"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement download
                        }}
                        className="p-1 text-gray-600 hover:text-teal-600"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item);
                        }}
                        className="p-1 text-gray-600 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredItems.length)} of{' '}
                {mediaItems.length} items
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-medium">{previewItem.original_filename}</h3>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[70vh]">
              {previewItem.mime_type.startsWith('image/') ? (
                <img
                  src={previewItem.url}
                  alt={previewItem.alt_text || previewItem.original_filename}
                  className="max-w-full h-auto mx-auto"
                />
              ) : (
                <div className="text-center py-12">
                  {getFileIcon(previewItem.mime_type)}
                  <p className="mt-4 text-gray-600">Preview not available for this file type</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">File Size</p>
                  <p className="font-medium">{formatFileSize(previewItem.file_size)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Uploaded</p>
                  <p className="font-medium">{formatDate(previewItem.created_at)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Dimensions</p>
                  <p className="font-medium">
                    {previewItem.width && previewItem.height 
                      ? `${previewItem.width} × ${previewItem.height}` 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Type</p>
                  <p className="font-medium">{previewItem.mime_type}</p>
                </div>
              </div>
              {previewItem.alt_text && (
                <div className="mt-4">
                  <p className="text-gray-600">Alt Text</p>
                  <p className="font-medium">{previewItem.alt_text}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManager;