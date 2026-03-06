// Breadcrumb Navigation Component
// Provides hierarchical navigation for the CMS admin

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  homeLabel?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items: customItems,
  homeLabel = 'Admin' 
}) => {
  const location = useLocation();
  
  // Generate breadcrumb items from current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Always start with home
    breadcrumbs.push({ label: homeLabel, path: '/admin' });
    
    // Build breadcrumbs from path
    let currentPath = '';
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      
      // Skip if it's 'admin' (we already added home)
      if (part === 'admin') return;
      
      const label = formatLabel(part);
      breadcrumbs.push({
        label,
        path: index === pathParts.length - 1 ? undefined : currentPath
      });
    });
    
    return breadcrumbs;
  };
  
  // Format path segment to readable label
  const formatLabel = (segment: string): string => {
    // Handle common patterns
    const labels: Record<string, string> = {
      'dashboard': 'Dashboard',
      'pages': 'Pages',
      'posts': 'Posts',
      'media': 'Media Library',
      'contacts': 'Contacts',
      'bookings': 'Bookings',
      'categories': 'Categories',
      'tags': 'Tags',
      'settings': 'Settings',
      'new': 'New',
      'edit': 'Edit',
      'analytics': 'Analytics',
    };
    
    if (labels[segment.toLowerCase()]) {
      return labels[segment.toLowerCase()];
    }
    
    // Capitalize first letter
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };
  
  const breadcrumbs = customItems || generateBreadcrumbs();
  
  return (
    <nav className="flex items-center text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              )}
              {item.path && !isLast ? (
                <Link
                  to={item.path}
                  className="text-gray-500 hover:text-teal-600 transition-colors"
                >
                  {index === 0 ? (
                    <Home className="w-4 h-4" />
                  ) : (
                    item.label
                  )}
                </Link>
              ) : (
                <span 
                  className={`${
                    isLast 
                      ? 'text-gray-900 font-medium' 
                      : 'text-gray-500'
                  }`}
                >
                  {index === 0 ? (
                    <Home className="w-4 h-4" />
                  ) : (
                    item.label
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
