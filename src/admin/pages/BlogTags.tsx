// Blog Tags Management Page
// Tag management for the blog

import React from 'react';
import BlogTagsManager from '../components/blog/BlogTagsManager';

const BlogTags: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Blog Tags
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage tags for better content organization and discoverability
        </p>
      </div>

      {/* Tags Manager */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <BlogTagsManager />
      </div>
    </div>
  );
};

export default BlogTags;
