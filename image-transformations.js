// Image Transformations Configuration for Supabase Storage
// This file contains configuration for image transformations and optimizations

const imageTransformations = {
  // Thumbnail - for lists and previews
  thumbnail: {
    width: 150,
    height: 150,
    quality: 80,
    format: 'webp',
    fit: 'cover',
    resize: 'contain'
  },
  
  // Small - for mobile devices
  small: {
    width: 300,
    height: 300,
    quality: 85,
    format: 'webp',
    fit: 'cover',
    resize: 'contain'
  },
  
  // Medium - for tablets and medium screens
  medium: {
    width: 600,
    height: 600,
    quality: 90,
    format: 'webp',
    fit: 'cover',
    resize: 'contain'
  },
  
  // Large - for desktop screens
  large: {
    width: 1200,
    height: 1200,
    quality: 90,
    format: 'webp',
    fit: 'cover',
    resize: 'contain'
  },
  
  // Extra Large - for high-res displays
  xlarge: {
    width: 1920,
    height: 1080,
    quality: 95,
    format: 'webp',
    fit: 'cover',
    resize: 'contain'
  },
  
  // Avatar - for user profile images
  avatar: {
    width: 200,
    height: 200,
    quality: 90,
    format: 'webp',
    fit: 'face',
    resize: 'fill'
  },
  
  // Hero - for hero section images
  hero: {
    width: 1920,
    height: 800,
    quality: 95,
    format: 'webp',
    fit: 'cover',
    resize: 'fill'
  }
};

// Function to generate transformation URL for Supabase Storage
function getTransformedImageUrl(filePath, transformation = 'medium') {
  const config = imageTransformations[transformation];
  if (!config) {
    throw new Error(`Transformation "${transformation}" not found`);
  }
  
  const params = new URLSearchParams({
    width: config.width.toString(),
    height: config.height.toString(),
    quality: config.quality.toString(),
    format: config.format,
    fit: config.fit,
    resize: config.resize
  });
  
  return `/storage/v1/render/image/public/cms-images/${filePath}?${params.toString()}`;
}

// Function to get all transformations for an image
function getAllImageSizes(filePath) {
  const transformations = {};
  
  for (const [name, config] of Object.entries(imageTransformations)) {
    const params = new URLSearchParams({
      width: config.width.toString(),
      height: config.height.toString(),
      quality: config.quality.toString(),
      format: config.format,
      fit: config.fit,
      resize: config.resize
    });
    
    transformations[name] = {
      url: `/storage/v1/render/image/public/cms-images/${filePath}?${params.toString()}`,
      width: config.width,
      height: config.height,
      quality: config.quality,
      format: config.format
    };
  }
  
  return transformations;
}

// Function to generate srcset for responsive images
function generateSrcSet(filePath) {
  const sizes = [
    { name: 'thumbnail', width: 150 },
    { name: 'small', width: 300 },
    { name: 'medium', width: 600 },
    { name: 'large', width: 1200 },
    { name: 'xlarge', width: 1920 }
  ];
  
  return sizes.map(size => {
    const url = getTransformedImageUrl(filePath, size.name);
    return `${url} ${size.width}w`;
  }).join(', ');
}

// Function to validate image file
async function validateImageFile(file, options = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    minWidth = 50,
    minHeight = 50,
    maxWidth = 5000,
    maxHeight = 5000
  } = options;
  
  const errors = [];
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds limit of ${formatFileSize(maxSize)}`);
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  // Check image dimensions
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        if (img.width < minWidth || img.height < minHeight) {
          errors.push(`Image dimensions (${img.width}x${img.height}) are too small. Minimum: ${minWidth}x${minHeight}`);
        }
        
        if (img.width > maxWidth || img.height > maxHeight) {
          errors.push(`Image dimensions (${img.width}x${img.height}) are too large. Maximum: ${maxWidth}x${maxHeight}`);
        }
        
        resolve({
          valid: errors.length === 0,
          errors,
          dimensions: { width: img.width, height: img.height },
          aspectRatio: img.width / img.height
        });
      };
      
      img.onerror = () => {
        errors.push('Failed to load image for validation');
        resolve({
          valid: false,
          errors: ['Failed to load image for validation'],
          dimensions: null,
          aspectRatio: null
        });
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      errors.push('Failed to read file for validation');
      resolve({
        valid: false,
        errors,
        dimensions: null,
        aspectRatio: null
      });
    };
    
    reader.readAsDataURL(file);
  });
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Export for CommonJS/ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    imageTransformations,
    getTransformedImageUrl,
    getAllImageSizes,
    generateSrcSet,
    validateImageFile,
    formatFileSize
  };
}