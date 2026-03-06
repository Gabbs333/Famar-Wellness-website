// Blog Categories Management Page
// Hierarchical category management for the blog

import React from 'react';
import BlogCategoriesManager from '../components/blog/BlogCategoriesManager';

const BlogCategories: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Blog Categories
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Organize your blog posts with hierarchical categories
        </p>
      </div>

      {/* Categories Manager */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <BlogCategoriesManager />
      </div>
    </div>
  );
};

export default BlogCategories;
