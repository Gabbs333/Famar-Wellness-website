// Content Import/Export Utility
// Handles importing and exporting CMS content

export interface ExportOptions {
  type: 'pages' | 'posts' | 'all';
  format: 'json' | 'csv';
  includeMedia?: boolean;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
}

// Export content to JSON
export const exportToJSON = async (data: any, filename: string): Promise<void> => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, filename);
};

// Export content to CSV
export const exportToCSV = async (data: any[], filename: string): Promise<void> => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const val = row[header];
        const str = val === null || val === undefined ? '' : String(val);
        // Escape quotes and wrap in quotes if contains comma
        return str.includes(',') || str.includes('"') 
          ? `"${str.replace(/"/g, '""')}"` 
          : str;
      }).join(',')
    )
  ];
  
  const csvStr = csvRows.join('\n');
  const blob = new Blob([csvStr], { type: 'text/csv' });
  downloadBlob(blob, filename);
};

// Download blob as file
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Parse JSON file
export const parseJSONFile = async (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Parse CSV file
export const parseCSVFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          resolve([]);
          return;
        }
        
        const headers = parseCSVLine(lines[0]);
        const data = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
        
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid CSV file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Parse a single CSV line handling quotes
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

// Validate imported content
export const validateImportData = (
  data: any[],
  requiredFields: string[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  data.forEach((item, index) => {
    requiredFields.forEach(field => {
      if (!item[field]) {
        errors.push(`Row ${index + 1}: Missing required field "${field}"`);
      }
    });
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Generate sample export template
export const generateTemplate = (type: 'pages' | 'posts'): string => {
  if (type === 'pages') {
    return JSON.stringify([{
      title: 'Page Title',
      slug: 'page-slug',
      content: 'Page content here...',
      status: 'published',
      meta_title: 'SEO Title',
      meta_description: 'SEO Description'
    }], null, 2);
  }
  
  return JSON.stringify([{
    title: 'Post Title',
    slug: 'post-slug',
    content: 'Post content here...',
    excerpt: 'Post excerpt...',
    status: 'draft',
    category: 'General',
    tags: 'tag1,tag2',
    featured_image: 'image-url.jpg'
  }], null, 2);
};

export default {
  exportToJSON,
  exportToCSV,
  parseJSONFile,
  parseCSVFile,
  validateImportData,
  generateTemplate
};
