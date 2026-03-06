import React, { useState } from 'react';
import MediaManager from '../components/MediaManager';
import { Image as ImageIcon, Upload, Settings, Info } from 'lucide-react';

const MediaPage = () => {
  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'library' | 'upload'>('library');

  const handleMediaSelect = (items: any[]) => {
    setSelectedMedia(items);
    console.log('Selected media:', items);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Media Library</h2>
          <p className="text-gray-600 mt-1">
            Manage all images, documents, and media files for your website
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('library')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'library' 
                  ? 'bg-white text-teal-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Library
              </div>
            </button>
            <button
              onClick={() => setViewMode('upload')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'upload' 
                  ? 'bg-white text-teal-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-800">--</p>
            </div>
            <div className="p-2 bg-teal-50 rounded-lg">
              <ImageIcon className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Images</p>
              <p className="text-2xl font-bold text-gray-800">--</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <ImageIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-800">--</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Upload className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-gray-800">--</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Settings className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800">Media Management Tips</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Use descriptive filenames for better searchability</li>
              <li>• Add alt text to images for accessibility and SEO</li>
              <li>• Optimize images before upload for faster page loads</li>
              <li>• Organize files into logical folders for easy management</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Media Manager Component */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <MediaManager
          onSelect={handleMediaSelect}
          multiple={true}
          allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']}
          maxFiles={10}
          maxSize={20 * 1024 * 1024} // 20MB
        />
      </div>

      {/* Selected Media Preview */}
      {selectedMedia.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Selected Media ({selectedMedia.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {selectedMedia.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden group hover:border-teal-300 transition-colors"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  {item.mime_type.startsWith('image/') ? (
                    <img
                      src={item.url}
                      alt={item.alt_text || item.original_filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-4">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.original_filename}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(item.file_size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default MediaPage;