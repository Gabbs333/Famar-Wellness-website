// Intelligent Compression Configuration
// This module provides smart compression settings based on image analysis

export interface CompressionSettings {
  targetWidth: number;
  targetHeight: number;
  fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  outputFormat: 'webp' | 'jpeg' | 'png';
  quality: number;
  effort: number;
  stripMetadata: boolean;
  kernel: 'nearest' | 'cubic' | 'mitchell' | 'lanczos2' | 'lanczos3';
  formatOptions: Record<string, any>;
}

export interface ImageAnalysis {
  width: number;
  height: number;
  format: string;
  hasAlpha: boolean;
  size: number;
  aspectRatio: number;
  orientation: 'landscape' | 'portrait' | 'square';
  estimatedMegapixels: number;
}

/**
 * Analyze image characteristics for intelligent compression
 */
export function analyzeImage(metadata: any, fileSize: number): ImageAnalysis {
  const { width, height, format, hasAlpha } = metadata;
  const aspectRatio = width / height;
  
  return {
    width,
    height,
    format: format || 'unknown',
    hasAlpha: hasAlpha || false,
    size: fileSize,
    aspectRatio,
    orientation: aspectRatio > 1.1 ? 'landscape' : aspectRatio < 0.9 ? 'portrait' : 'square',
    estimatedMegapixels: (width * height) / 1000000
  };
}

/**
 * Get optimal compression settings based on image analysis
 */
export function getOptimalCompressionSettings(analysis: ImageAnalysis): CompressionSettings {
  const { width, height, format, hasAlpha, size, orientation, estimatedMegapixels } = analysis;
  
  // Determine target dimensions
  let targetWidth = width;
  let targetHeight = height;
  let fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside' = 'fill';
  
  // Intelligent resizing based on image size and usage
  if (estimatedMegapixels > 5) { // Large images (>5MP)
    if (orientation === 'landscape') {
      targetWidth = 1920;
      targetHeight = Math.round(1920 / analysis.aspectRatio);
    } else if (orientation === 'portrait') {
      targetHeight = 1080;
      targetWidth = Math.round(1080 * analysis.aspectRatio);
    } else {
      targetWidth = targetHeight = 1200;
    }
    fit = 'inside'; // Maintain aspect ratio
  } else if (estimatedMegapixels > 2) { // Medium images (2-5MP)
    // Moderate resizing
    const scale = 0.75; // Reduce to 75% of original size
    targetWidth = Math.round(width * scale);
    targetHeight = Math.round(height * scale);
    fit = 'inside';
  }
  
  // Determine output format
  let outputFormat: 'webp' | 'jpeg' | 'png' = 'webp';
  let quality = 85;
  let effort = 6;
  let stripMetadata = true;
  let kernel: 'nearest' | 'cubic' | 'mitchell' | 'lanczos2' | 'lanczos3' = 'lanczos3';
  
  // Format-specific optimizations
  switch (format.toLowerCase()) {
    case 'jpeg':
    case 'jpg':
      outputFormat = 'jpeg';
      quality = calculateJpegQuality(size, estimatedMegapixels);
      break;
      
    case 'png':
      if (hasAlpha) {
        outputFormat = 'png';
        quality = 90;
        stripMetadata = false; // Keep transparency
      } else {
        outputFormat = 'webp';
        quality = 85;
      }
      break;
      
    case 'gif':
      outputFormat = size > 1024 * 1024 ? 'webp' : 'gif';
      quality = 90;
      break;
      
    case 'webp':
      // Already WebP, optimize further
      quality = Math.max(70, 85 - Math.floor(estimatedMegapixels / 2));
      effort = 4; // Faster recompression
      break;
  }
  
  // Adjust for file size
  if (size > 5 * 1024 * 1024) { // >5MB
    quality = Math.max(70, quality - 10);
    effort = 4; // Faster processing
  } else if (size < 100 * 1024) { // <100KB
    quality = Math.min(95, quality + 5);
  }
  
  // Format-specific options
  const formatOptions: Record<string, any> = {};
  
  if (outputFormat === 'webp') {
    formatOptions.nearLossless = quality > 80;
    formatOptions.smartSubsample = true;
    formatOptions.reductionEffort = effort;
  } else if (outputFormat === 'jpeg') {
    formatOptions.mozjpeg = true;
    formatOptions.trellisQuantisation = true;
    formatOptions.overshootDeringing = true;
    formatOptions.optimiseScans = true;
  } else if (outputFormat === 'png') {
    formatOptions.compressionLevel = 9 - Math.floor(quality / 10);
    formatOptions.palette = hasAlpha;
  }
  
  return {
    targetWidth,
    targetHeight,
    fit,
    outputFormat,
    quality,
    effort,
    stripMetadata,
    kernel,
    formatOptions
  };
}

/**
 * Calculate optimal JPEG quality based on image characteristics
 */
function calculateJpegQuality(fileSize: number, megapixels: number): number {
  // Base quality
  let quality = 85;
  
  // Adjust based on file size
  if (fileSize > 3 * 1024 * 1024) { // >3MB
    quality -= 10;
  } else if (fileSize < 500 * 1024) { // <500KB
    quality += 5;
  }
  
  // Adjust based on resolution
  if (megapixels > 8) { // High resolution
    quality -= 5;
  } else if (megapixels < 2) { // Low resolution
    quality += 5;
  }
  
  // Ensure quality is within bounds
  return Math.max(60, Math.min(95, quality));
}

/**
 * Determine if image should be resized
 */
export function shouldResizeImage(analysis: ImageAnalysis, settings: CompressionSettings): boolean {
  const { width, height } = analysis;
  const { targetWidth, targetHeight } = settings;
  
  // Don't resize if dimensions are the same
  if (width === targetWidth && height === targetHeight) {
    return false;
  }
  
  // Calculate size difference
  const originalArea = width * height;
  const targetArea = targetWidth * targetHeight;
  const areaRatio = targetArea / originalArea;
  
  // Resize if target is significantly smaller (>20% reduction)
  return areaRatio < 0.8;
}

/**
 * Calculate estimated compression savings
 */
export function estimateCompressionSavings(analysis: ImageAnalysis, settings: CompressionSettings): {
  estimatedSavings: number;
  estimatedRatio: number;
  estimatedOutputSize: number;
} {
  const { size, format, estimatedMegapixels } = analysis;
  const { outputFormat, quality } = settings;
  
  // Base savings by format conversion
  let formatSavings = 0;
  
  if (format === 'jpeg' || format === 'jpg') {
    formatSavings = outputFormat === 'webp' ? 30 : 10;
  } else if (format === 'png') {
    formatSavings = outputFormat === 'webp' ? 50 : 20;
  } else if (format === 'gif') {
    formatSavings = outputFormat === 'webp' ? 60 : 0;
  }
  
  // Quality adjustment
  const qualityAdjustment = (100 - quality) * 0.3;
  
  // Size adjustment (larger files can be compressed more)
  const sizeAdjustment = Math.min(20, Math.log10(size / 1024) * 5);
  
  // Resolution adjustment
  const resolutionAdjustment = Math.min(15, estimatedMegapixels * 2);
  
  // Total estimated savings
  const estimatedSavings = Math.min(90, 
    formatSavings + 
    qualityAdjustment + 
    sizeAdjustment + 
    resolutionAdjustment
  );
  
  // Estimated output size
  const estimatedOutputSize = Math.round(size * (1 - estimatedSavings / 100));
  const estimatedRatio = size / estimatedOutputSize;
  
  return {
    estimatedSavings,
    estimatedRatio: parseFloat(estimatedRatio.toFixed(2)),
    estimatedOutputSize
  };
}

/**
 * Get compression statistics for reporting
 */
export function getCompressionStats(
  originalSize: number,
  optimizedSize: number,
  analysis: ImageAnalysis
): {
  savingsPercentage: number;
  savingsBytes: number;
  compressionRatio: number;
  bandwidthSavings: number;
  estimatedAnnualSavings: number;
} {
  const savingsBytes = originalSize - optimizedSize;
  const savingsPercentage = Math.round((savingsBytes / originalSize) * 100);
  const compressionRatio = originalSize / optimizedSize;
  
  // Estimate bandwidth savings (assuming 1000 views per month)
  const monthlyViews = 1000;
  const bandwidthSavings = savingsBytes * monthlyViews;
  const annualSavings = bandwidthSavings * 12;
  
  return {
    savingsPercentage,
    savingsBytes,
    compressionRatio: parseFloat(compressionRatio.toFixed(2)),
    bandwidthSavings,
    estimatedAnnualSavings: annualSavings
  };
}

/**
 * Get recommended compression strategy
 */
export function getCompressionStrategy(analysis: ImageAnalysis): {
  strategy: 'aggressive' | 'balanced' | 'quality';
  reasoning: string;
  recommendations: string[];
} {
  const { size, format, estimatedMegapixels } = analysis;
  
  let strategy: 'aggressive' | 'balanced' | 'quality' = 'balanced';
  let reasoning = '';
  const recommendations: string[] = [];
  
  if (size > 3 * 1024 * 1024 || estimatedMegapixels > 8) {
    strategy = 'aggressive';
    reasoning = 'Large file size or high resolution detected. Aggressive compression recommended for optimal performance.';
    recommendations.push('Convert to WebP format');
    recommendations.push('Apply strong compression (70-80% quality)');
    recommendations.push('Resize to appropriate dimensions');
  } else if (size < 500 * 1024 && estimatedMegapixels < 2) {
    strategy = 'quality';
    reasoning = 'Small file size and low resolution detected. Quality preservation prioritized.';
    recommendations.push('Minimal compression (90-95% quality)');
    recommendations.push('Preserve original dimensions');
    recommendations.push('Keep original format if already optimized');
  } else {
    strategy = 'balanced';
    reasoning = 'Moderate file size and resolution. Balanced approach for optimal quality/performance ratio.';
    recommendations.push('Convert to WebP for best compression');
    recommendations.push('Apply balanced compression (85% quality)');
    recommendations.push('Moderate resizing if needed');
  }
  
  // Additional format-specific recommendations
  if (format === 'png' && analysis.hasAlpha) {
    recommendations.push('Preserve transparency in PNG format');
  } else if (format === 'gif') {
    recommendations.push('Consider converting animated GIF to video format');
  }
  
  return { strategy, reasoning, recommendations };
}