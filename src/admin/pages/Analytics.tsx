// Analytics Page
// CMS analytics and content usage statistics

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  FileText, 
  Image as ImageIcon,
  Users,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: string;
  bounceRate: string;
  topPages: { path: string; views: number }[];
  contentStats: { type: string; count: number }[];
  recentActivity: { action: string; item: string; date: string }[];
}

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [data] = useState<AnalyticsData>({
    pageViews: 12450,
    uniqueVisitors: 3280,
    avgTimeOnPage: '2:34',
    bounceRate: '42%',
    topPages: [
      { path: '/', views: 4520 },
      { path: '/services', views: 2150 },
      { path: '/actualites', views: 1890 },
      { path: '/contact', views: 1450 },
      { path: '/reservation', views: 1240 },
    ],
    contentStats: [
      { type: 'Pages', count: 12 },
      { type: 'Blog Posts', count: 28 },
      { type: 'Media Files', count: 156 },
      { type: 'Categories', count: 8 },
    ],
    recentActivity: [
      { action: 'Published', item: 'New Service Offerings', date: '2024-01-15' },
      { action: 'Updated', item: 'About Page', date: '2024-01-14' },
      { action: 'Uploaded', item: '5 new images', date: '2024-01-13' },
      { action: 'Created', item: 'Health Tips Article', date: '2024-01-12' },
    ],
  });

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExport = () => {
    // Generate and download report
    const csvContent = [
      ['Metric', 'Value'],
      ['Page Views', data.pageViews.toString()],
      ['Unique Visitors', data.uniqueVisitors.toString()],
      ['Avg Time on Page', data.avgTimeOnPage],
      ['Bounce Rate', data.bounceRate],
      ...data.topPages.map(p => [p.path, p.views.toString()]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cms-analytics.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your CMS content performance and user engagement
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Page Views</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {data.pageViews.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12.5% vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Unique Visitors</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {data.uniqueVisitors.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+8.3% vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Time on Page</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {data.avgTimeOnPage}
              </p>
            </div>
            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+5.2% vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bounce Rate</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {data.bounceRate}
              </p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm text-red-600">
            <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
            <span>+2.1% vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Top Pages
          </h3>
          <div className="space-y-4">
            {data.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-6">
                    #{index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {page.path}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${(page.views / data.topPages[0].views) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-16 text-right">
                    {page.views.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Content Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {data.contentStats.map((stat, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg mr-3">
                  {stat.type === 'Pages' && <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                  {stat.type === 'Blog Posts' && <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                  {stat.type === 'Media Files' && <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                  {stat.type === 'Categories' && <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {stat.count}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {data.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.action === 'Published' ? 'bg-green-500' :
                  activity.action === 'Updated' ? 'bg-blue-500' :
                  activity.action === 'Uploaded' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`} />
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{activity.action}</span>
                  {' '}{activity.item}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {activity.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
