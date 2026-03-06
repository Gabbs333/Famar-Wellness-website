// Image Optimization Utilities for Supabase CMS
// TypeScript version with React integration

// Types
export interface ImageTransformation {
  width: number;
  height: number;
  quality: number;
  format: 'webp' | 'jpeg' | 'png';
  fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  resize: 'contain' | 'fill' | 'cover';
}

export interface ThumbnailSize {
  name: string;
  width: number;
  height: number;
  quality: number;
  format: 'webp' | 'jpeg' | 'png';
}

export interface ImageMetadata {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: 'landscape' | 'portrait' | 'square';
  fileSize: number;
  mimeType: string;
  lastModified: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  dimensions?: { width: number; height: number };
  aspectRatio?: number;
}

// Image Transformation Configurations
export const imageTransformations: Record<string, ImageTransformation> = {
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

// Thumbnail Sizes Configuration
export const thumbnailSizes: ThumbnailSize[] = [
  { name: 'xs', width: 50, height: 50, quality: 70, format: 'webp' },
  { name: 'sm', width: 150, height: 150, quality: 75, format: 'webp' },
  { name: 'md', width: 300, height: 300, quality: 80, format: 'webp' },
  { name: 'lg', width: 500, height: 500, quality: 85, format: 'webp' },
  { name: 'xl', width: 800, height: 800, quality: 90, format: 'webp' }
];

/**
 * Generate transformation URL for Supabase Storage
 */
export function getTransformedImageUrl(filePath: string, transformation: string = 'medium'): string {
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

/**
 * Generate thumbnail URL for Supabase Storage
 */
export function generateThumbnailUrl(filePath: string, size: string = 'md'): string {
  const sizeConfig = thumbnailSizes.find(s => s.name === size);
  if (!sizeConfig) {
    throw new Error(`Thumbnail size "${size}" not found. Available sizes: ${thumbnailSizes.map(s => s.name).join(', ')}`);
  }
  
  const params = new URLSearchParams({
    width: sizeConfig.width.toString(),
    height: sizeConfig.height.toString(),
    quality: sizeConfig.quality.toString(),
    format: sizeConfig.format,
    fit: 'cover',
    position: 'center',
    withoutEnlargement: 'true'
  });
  
  return `/storage/v1/render/image/public/cms-images/${filePath}?${params.toString()}`;
}

/**
 * Generate all thumbnail sizes for an image
 */
export function generateAllThumbnails(filePath: string): Record<string, { url: string; width: number; height: number; quality: number; format: string }> {
  const thumbnails: Record<string, { url: string; width: number; height: number; quality: number; format: string }> = {};
  
  thumbnailSizes.forEach(sizeConfig => {
    const params = new URLSearchParams({
      width: sizeConfig.width.toString(),
      height: sizeConfig.height.toString(),
      quality: sizeConfig.quality.toString(),
      format: sizeConfig.format,
      fit: 'cover',
      position: 'center',
      withoutEnlargement: 'true'
    });
    
    thumbnails[sizeConfig.name] = {
      url: `/storage/v1/render/image/public/cms-images/${filePath}?${params.toString()}`,
      width: sizeConfig.width,
      height: sizeConfig.height,
      quality: sizeConfig.quality,
      format: sizeConfig.format
    };
  });
  
  return thumbnails;
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(filePath: string): string {
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

/**
 * Generate thumbnail srcset
 */
export function generateThumbnailSrcSet(filePath: string): string {
  return thumbnailSizes.map(size => {
    const url = generateThumbnailUrl(filePath, size.name);
    return `${url} ${size.width}w`;
  }).join(', ');
}

/**
 * Validate image file with options
 */
export async function validateImageFile(
  file: File, 
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  } = {}
): Promise<ValidationResult> {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    minWidth = 50,
    minHeight = 50,
    maxWidth = 5000,
    maxHeight = 5000
  } = options;
  
  const errors: string[] = [];
  
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
          dimensions: undefined,
          aspectRatio: undefined
        });
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      errors.push('Failed to read file for validation');
      resolve({
        valid: false,
        errors,
        dimensions: undefined,
        aspectRatio: undefined
      });
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Extract metadata from image file
 */
export async function extractImageMetadata(file: File): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          orientation: img.width > img.height ? 'landscape' : img.height > img.width ? 'portrait' : 'square',
          fileSize: file.size,
          mimeType: file.type,
          lastModified: file.lastModified
        });
      };
      
      img.onerror = () => reject(new Error('Failed to load image for metadata extraction'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file for metadata extraction'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get appropriate thumbnail size based on container dimensions
 */
export function getRecommendedThumbnailSize(containerWidth: number, containerHeight: number): string {
  const containerArea = containerWidth * containerHeight;
  
  if (containerArea <= 2500) return 'xs';      // 50x50 = 2500
  if (containerArea <= 22500) return 'sm';     // 150x150 = 22500
  if (containerArea <= 90000) return 'md';     // 300x300 = 90000
  if (containerArea <= 250000) return 'lg';    // 500x500 = 250000
  return 'xl';                                 // 800x800 = 640000
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get thumbnail sizes attribute for responsive images
 */
export function getThumbnailSizes(breakpoints: string[] = ['640px', '768px', '1024px', '1280px']): string {
  const sizes = [
    `(max-width: ${breakpoints[0]}) 100vw`,
    `(max-width: ${breakpoints[1]}) 50vw`,
    `(max-width: ${breakpoints[2]}) 33vw`,
    `(max-width: ${breakpoints[3]}) 25vw`,
    '20vw'
  ];
  
  return sizes.join(', ');
}

/**
 * Process image upload with automatic thumbnail generation
 */
export async function processImageWithThumbnails(
  imageFile: File,
  options: {
    bucket?: string;
    folder?: string;
    userId?: string;
    generateAllSizes?: boolean;
  } = {}
): Promise<{
  original: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    url: string;
  };
  thumbnails: Record<string, { url: string; width: number; height: number; quality: number; format: string }>;
  metadata: ImageMetadata & { thumbnails?: Array<{ size: string; width: number; height: number; quality: number; format: string; url: string; generated_at: string }> };
  errors: string[];
}> {
  const {
    bucket = 'cms-images',
    folder = 'uploads',
    userId = 'anonymous',
    generateAllSizes = true
  } = options;
  
  const results = {
    original: {
      fileName: '',
      fileSize: 0,
      mimeType: '',
      uploadedAt: '',
      url: ''
    },
    thumbnails: {} as Record<string, { url: string; width: number; height: number; quality: number; format: string }>,
    metadata: {} as ImageMetadata & { thumbnails?: Array<{ size: string; width: number; height: number; quality: number; format: string; url: string; generated_at: string }> },
    errors: [] as string[]
  };
  
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = imageFile.name.split('.').pop();
    const originalFileName = `${folder}/${userId}/${timestamp}_${imageFile.name.replace(/\.[^/.]+$/, '')}.${fileExt}`;
    
    // Set original file info
    results.original = {
      fileName: originalFileName,
      fileSize: imageFile.size,
      mimeType: imageFile.type,
      uploadedAt: new Date().toISOString(),
      url: `/storage/v1/object/public/${bucket}/${originalFileName}`
    };
    
    // Generate thumbnails
    if (generateAllSizes) {
      results.thumbnails = generateAllThumbnails(originalFileName);
      
      // Generate thumbnail metadata
      results.metadata.thumbnails = thumbnailSizes.map(sizeConfig => ({
        size: sizeConfig.name,
        width: sizeConfig.width,
        height: sizeConfig.height,
        quality: sizeConfig.quality,
        format: sizeConfig.format,
        url: generateThumbnailUrl(originalFileName, sizeConfig.name),
        generated_at: new Date().toISOString()
      }));
    }
    
    // Extract image metadata
    const metadata = await extractImageMetadata(imageFile);
    results.metadata = { ...results.metadata, ...metadata };
    
  } catch (error) {
    results.errors.push(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return results;
}