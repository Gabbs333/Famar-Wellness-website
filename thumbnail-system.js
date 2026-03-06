// Automatic Thumbnail Generation System for Supabase CMS
// This system handles automatic thumbnail generation for uploaded images

// ============================================
// THUMBNAIL CONFIGURATION
// ============================================

const thumbnailConfig = {
  // Thumbnail sizes for different use cases
  sizes: {
    xs: { width: 50, height: 50, quality: 70, format: 'webp' },   // Extra small - for icons
    sm: { width: 150, height: 150, quality: 75, format: 'webp' },  // Small - for lists
    md: { width: 300, height: 300, quality: 80, format: 'webp' },  // Medium - for cards
    lg: { width: 500, height: 500, quality: 85, format: 'webp' },  // Large - for previews
    xl: { width: 800, height: 800, quality: 90, format: 'webp' }   // Extra large - for lightboxes
  },
  
  // Default settings
  defaults: {
    fit: 'cover',      // 'cover', 'contain', 'fill', 'inside', 'outside'
    position: 'center', // 'center', 'top', 'right', 'bottom', 'left'
    background: { r: 255, g: 255, b: 255, alpha: 1 }, // Background color for transparent images
    withoutEnlargement: true // Don't enlarge images smaller than target size
  },
  
  // Performance settings
  performance: {
    maxConcurrentGenerations: 3,
    timeout: 30000, // 30 seconds timeout
    retryAttempts: 2
  }
};

// ============================================
// THUMBNAIL GENERATION FUNCTIONS
// ============================================

/**
 * Generate thumbnail URL for Supabase Storage
 * @param {string} filePath - Original image path in storage
 * @param {string} size - Thumbnail size (xs, sm, md, lg, xl)
 * @returns {string} Thumbnail URL
 */
function generateThumbnailUrl(filePath, size = 'md') {
  const sizeConfig = thumbnailConfig.sizes[size];
  if (!sizeConfig) {
    throw new Error(`Thumbnail size "${size}" not found. Available sizes: ${Object.keys(thumbnailConfig.sizes).join(', ')}`);
  }
  
  const params = new URLSearchParams({
    width: sizeConfig.width.toString(),
    height: sizeConfig.height.toString(),
    quality: sizeConfig.quality.toString(),
    format: sizeConfig.format,
    fit: thumbnailConfig.defaults.fit,
    position: thumbnailConfig.defaults.position,
    withoutEnlargement: thumbnailConfig.defaults.withoutEnlargement.toString()
  });
  
  // Add background color if specified
  if (thumbnailConfig.defaults.background) {
    const bg = thumbnailConfig.defaults.background;
    params.set('background', `rgb(${bg.r},${bg.g},${bg.b})`);
  }
  
  return `/storage/v1/render/image/public/cms-images/${filePath}?${params.toString()}`;
}

/**
 * Generate all thumbnail sizes for an image
 * @param {string} filePath - Original image path
 * @returns {Object} Object with all thumbnail URLs
 */
function generateAllThumbnails(filePath) {
  const thumbnails = {};
  
  for (const [sizeName, sizeConfig] of Object.entries(thumbnailConfig.sizes)) {
    const params = new URLSearchParams({
      width: sizeConfig.width.toString(),
      height: sizeConfig.height.toString(),
      quality: sizeConfig.quality.toString(),
      format: sizeConfig.format,
      fit: thumbnailConfig.defaults.fit,
      position: thumbnailConfig.defaults.position,
      withoutEnlargement: thumbnailConfig.defaults.withoutEnlargement.toString()
    });
    
    // Add background color if specified
    if (thumbnailConfig.defaults.background) {
      const bg = thumbnailConfig.defaults.background;
      params.set('background', `rgb(${bg.r},${bg.g},${bg.b})`);
    }
    
    thumbnails[sizeName] = {
      url: `/storage/v1/render/image/public/cms-images/${filePath}?${params.toString()}`,
      width: sizeConfig.width,
      height: sizeConfig.height,
      quality: sizeConfig.quality,
      format: sizeConfig.format
    };
  }
  
  return thumbnails;
}

/**
 * Generate thumbnail metadata for database storage
 * @param {string} filePath - Original image path
 * @returns {Array} Array of thumbnail metadata objects
 */
function generateThumbnailMetadata(filePath) {
  return Object.entries(thumbnailConfig.sizes).map(([sizeName, sizeConfig]) => ({
    size: sizeName,
    width: sizeConfig.width,
    height: sizeConfig.height,
    quality: sizeConfig.quality,
    format: sizeConfig.format,
    url: generateThumbnailUrl(filePath, sizeName),
    generated_at: new Date().toISOString()
  }));
}

// ============================================
// AUTOMATIC THUMBNAIL GENERATION
// ============================================

/**
 * Process image upload and generate thumbnails automatically
 * @param {File} imageFile - Original image file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Upload and thumbnail generation results
 */
async function processImageWithThumbnails(imageFile, options = {}) {
  const {
    bucket = 'cms-images',
    folder = 'uploads',
    userId = 'anonymous',
    generateAllSizes = true
  } = options;
  
  const results = {
    original: null,
    thumbnails: {},
    metadata: {},
    errors: []
  };
  
  try {
    // 1. Upload original image
    const timestamp = Date.now();
    const originalFileName = `${folder}/${userId}/${timestamp}_${imageFile.name}`;
    
    // In a real implementation, this would upload to Supabase Storage
    // const { data: uploadData, error: uploadError } = await supabase.storage
    //   .from(bucket)
    //   .upload(originalFileName, imageFile);
    
    // For now, simulate upload
    results.original = {
      fileName: originalFileName,
      fileSize: imageFile.size,
      mimeType: imageFile.type,
      uploadedAt: new Date().toISOString(),
      url: `/storage/v1/object/public/${bucket}/${originalFileName}`
    };
    
    // 2. Generate thumbnails
    if (generateAllSizes) {
      results.thumbnails = generateAllThumbnails(originalFileName);
      results.metadata.thumbnails = generateThumbnailMetadata(originalFileName);
    }
    
    // 3. Extract image metadata
    const metadata = await extractImageMetadata(imageFile);
    results.metadata = { ...results.metadata, ...metadata };
    
  } catch (error) {
    results.errors.push(`Processing failed: ${error.message}`);
  }
  
  return results;
}

/**
 * Extract metadata from image file
 * @param {File} imageFile - Image file
 * @returns {Promise<Object>} Image metadata
 */
async function extractImageMetadata(imageFile) {
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
          fileSize: imageFile.size,
          mimeType: imageFile.type,
          lastModified: imageFile.lastModified
        });
      };
      
      img.onerror = () => reject(new Error('Failed to load image for metadata extraction'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file for metadata extraction'));
    reader.readAsDataURL(imageFile);
  });
}

// ============================================
// BATCH PROCESSING
// ============================================

/**
 * Process multiple images in batch with thumbnail generation
 * @param {Array<File>} imageFiles - Array of image files
 * @param {Object} options - Processing options
 * @returns {Promise<Array>} Results for all images
 */
async function batchProcessImages(imageFiles, options = {}) {
  const {
    concurrency = thumbnailConfig.performance.maxConcurrentGenerations,
    onProgress = null
  } = options;
  
  const results = [];
  const queue = [...imageFiles];
  let processed = 0;
  const total = imageFiles.length;
  
  async function processNext() {
    if (queue.length === 0) return;
    
    const file = queue.shift();
    const index = processed;
    
    try {
      const result = await processImageWithThumbnails(file, options);
      results[index] = { file: file.name, success: true, result };
    } catch (error) {
      results[index] = { file: file.name, success: false, error: error.message };
    }
    
    processed++;
    
    // Report progress
    if (onProgress && typeof onProgress === 'function') {
      onProgress(processed, total, file.name);
    }
    
    // Process next file
    await processNext();
  }
  
  // Start concurrent processing
  const workers = Array(Math.min(concurrency, total)).fill().map(() => processNext());
  await Promise.all(workers);
  
  return results;
}

// ============================================
// THUMBNAIL MANAGEMENT
// ============================================

/**
 * Get appropriate thumbnail size based on container dimensions
 * @param {number} containerWidth - Container width in pixels
 * @param {number} containerHeight - Container height in pixels
 * @returns {string} Recommended thumbnail size
 */
function getRecommendedThumbnailSize(containerWidth, containerHeight) {
  const containerArea = containerWidth * containerHeight;
  
  if (containerArea <= 2500) return 'xs';      // 50x50 = 2500
  if (containerArea <= 22500) return 'sm';     // 150x150 = 22500
  if (containerArea <= 90000) return 'md';     // 300x300 = 90000
  if (containerArea <= 250000) return 'lg';    // 500x500 = 250000
  return 'xl';                                 // 800x800 = 640000
}

/**
 * Generate responsive thumbnail srcset
 * @param {string} filePath - Original image path
 * @returns {string} srcset attribute value
 */
function generateThumbnailSrcSet(filePath) {
  const sizes = [
    { name: 'xs', width: 50 },
    { name: 'sm', width: 150 },
    { name: 'md', width: 300 },
    { name: 'lg', width: 500 },
    { name: 'xl', width: 800 }
  ];
  
  return sizes.map(size => {
    const url = generateThumbnailUrl(filePath, size.name);
    return `${url} ${size.width}w`;
  }).join(', ');
}

/**
 * Get thumbnail sizes attribute for responsive images
 * @param {Array<string>} breakpoints - CSS breakpoints
 * @returns {string} sizes attribute value
 */
function getThumbnailSizes(breakpoints = ['640px', '768px', '1024px', '1280px']) {
  const sizes = [
    `(max-width: ${breakpoints[0]}) 100vw`,
    `(max-width: ${breakpoints[1]}) 50vw`,
    `(max-width: ${breakpoints[2]}) 33vw`,
    `(max-width: ${breakpoints[3]}) 25vw`,
    '20vw'
  ];
  
  return sizes.join(', ');
}

// ============================================
// ERROR HANDLING AND RETRY LOGIC
// ============================================

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxAttempts - Maximum retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise<any>} Function result
 */
async function retryWithBackoff(fn, maxAttempts = thumbnailConfig.performance.retryAttempts, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        throw error;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// ============================================
// EXPORTS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    thumbnailConfig,
    generateThumbnailUrl,
    generateAllThumbnails,
    generateThumbnailMetadata,
    processImageWithThumbnails,
    extractImageMetadata,
    batchProcessImages,
    getRecommendedThumbnailSize,
    generateThumbnailSrcSet,
    getThumbnailSizes,
    retryWithBackoff
  };
}

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: Generate thumbnail URL
/*
const thumbnailUrl = generateThumbnailUrl('uploads/123/profile.jpg', 'md');
console.log('Medium thumbnail:', thumbnailUrl);
*/

// Example 2: Process image upload with automatic thumbnails
/*
const fileInput = document.getElementById('image-upload');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  
  const result = await processImageWithThumbnails(file, {
    userId: 'user_123',
    folder: 'profile-images'
  });
  
  console.log('Upload result:', result);
  
  // Store thumbnail metadata in database
  // await saveToDatabase({
  //   original: result.original,
  //   thumbnails: result.metadata.thumbnails,
  //   metadata: result.metadata
  // });
});
*/

// Example 3: Responsive thumbnail in HTML
/*
<img 
  src={generateThumbnailUrl('gallery/image.jpg', 'md')}
  srcset={generateThumbnailSrcSet('gallery/image.jpg')}
  sizes={getThumbnailSizes()}
  alt="Gallery image"
  loading="lazy"
/>
*/

// Example 4: Batch processing
/*
const files = [...document.querySelector('input[type="file"]').files];
const results = await batchProcessImages(files, {
  concurrency: 3,
  onProgress: (processed, total, fileName) => {
    console.log(`Processed ${processed}/${total}: ${fileName}`);
  }
});

console.log('Batch results:', results);
*/