// API Route for Image Optimization - Platform Agnostic
// Compatible with Vercel, Netlify, and any Node.js server

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Thumbnail sizes configuration
const thumbnailSizes = {
  xs: { width: 50, height: 50, quality: 70 },
  sm: { width: 150, height: 150, quality: 75 },
  md: { width: 300, height: 300, quality: 80 },
  lg: { width: 500, height: 500, quality: 85 },
  xl: { width: 800, height: 800, quality: 90 }
};

// Intelligent compression settings
function getOptimalCompressionSettings(metadata, originalSize) {
  const { width, height, format, hasAlpha } = metadata;
  const aspectRatio = width / height;
  const isLandscape = aspectRatio > 1;
  const isPortrait = aspectRatio < 1;
  
  // Determine target dimensions
  let targetWidth = width;
  let targetHeight = height;
  let fit = 'fill';
  
  if (width > 1920 || height > 1080) {
    if (isLandscape) {
      targetWidth = 1920;
      targetHeight = Math.round(1920 / aspectRatio);
    } else if (isPortrait) {
      targetHeight = 1080;
      targetWidth = Math.round(1080 * aspectRatio);
    } else {
      targetWidth = targetHeight = 1200;
    }
    fit = 'inside';
  }
  
  // Determine output format
  let outputFormat = 'webp';
  let quality = 85;
  let effort = 6;
  let stripMetadata = true;
  
  // Format-specific optimizations
  if (format === 'jpeg' || format === 'jpg') {
    outputFormat = 'jpeg';
    quality = Math.max(75, Math.min(90, 100 - (originalSize / 1024 / 100)));
  } else if (format === 'png') {
    if (hasAlpha) {
      outputFormat = 'png';
      quality = 90;
      stripMetadata = false;
    } else {
      outputFormat = 'webp';
      quality = 85;
    }
  } else if (format === 'gif') {
    outputFormat = originalSize > 1024 * 1024 ? 'webp' : 'gif';
    quality = 90;
  }
  
  // Adjust for file size
  if (originalSize > 5 * 1024 * 1024) {
    quality = Math.max(70, quality - 10);
    effort = 4;
  } else if (originalSize < 100 * 1024) {
    quality = Math.min(95, quality + 5);
  }
  
  return {
    targetWidth,
    targetHeight,
    fit,
    outputFormat,
    quality,
    effort,
    stripMetadata
  };
}

// Main handler function
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ message: 'CORS preflight successful' });
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { mediaId, filePath, action = 'optimize' } = req.body;
    
    if (!mediaId || !filePath) {
      return res.status(400).json({ 
        error: 'Missing required parameters: mediaId and filePath' 
      });
    }
    
    // Download the original image from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('cms-images')
      .download(filePath);
    
    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      return res.status(500).json({ error: 'Failed to download image' });
    }
    
    // Convert file to buffer
    const buffer = Buffer.from(await fileData.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    const originalSize = buffer.length;
    
    // Optimization results
    const results = {
      original: {
        width: metadata.width,
        height: metadata.height,
        size: originalSize,
        format: metadata.format
      },
      optimized: null,
      thumbnails: {},
      errors: []
    };
    
    // Main image optimization
    if (action === 'optimize' || action === 'all') {
      try {
        const settings = getOptimalCompressionSettings(metadata, originalSize);
        
        let processingPipeline = sharp(buffer);
        
        // Apply resizing if needed
        if (settings.targetWidth !== metadata.width || settings.targetHeight !== metadata.height) {
          processingPipeline = processingPipeline.resize(
            settings.targetWidth,
            settings.targetHeight,
            {
              fit: settings.fit,
              position: 'center',
              withoutEnlargement: true
            }
          );
        }
        
        // Apply format conversion
        if (settings.outputFormat === 'webp') {
          processingPipeline = processingPipeline.webp({ 
            quality: settings.quality,
            effort: settings.effort,
            nearLossless: settings.quality > 80
          });
        } else if (settings.outputFormat === 'jpeg') {
          processingPipeline = processingPipeline.jpeg({ 
            quality: settings.quality,
            mozjpeg: true
          });
        } else if (settings.outputFormat === 'png') {
          processingPipeline = processingPipeline.png({ 
            quality: settings.quality,
            compressionLevel: 9
          });
        }
        
        // Strip metadata if requested
        if (settings.stripMetadata) {
          processingPipeline = processingPipeline.withMetadata({
            orientation: undefined
          });
        }
        
        const optimizedBuffer = await processingPipeline.toBuffer();
        const optimizedSize = optimizedBuffer.length;
        const savings = Math.round((1 - optimizedSize / originalSize) * 100);
        
        // Upload optimized image
        const fileExt = settings.outputFormat === 'webp' ? 'webp' : 
                       settings.outputFormat === 'jpeg' ? 'jpg' : 'png';
        const optimizedPath = filePath.replace(/\.[^/.]+$/, '') + `_optimized.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('cms-images')
          .upload(optimizedPath, optimizedBuffer, {
            contentType: `image/${fileExt}`,
            upsert: true,
            cacheControl: 'public, max-age=31536000'
          });
        
        if (!uploadError) {
          results.optimized = {
            path: optimizedPath,
            width: settings.targetWidth,
            height: settings.targetHeight,
            size: optimizedSize,
            format: fileExt,
            savings: savings,
            originalSize: originalSize
          };
        } else {
          results.errors.push(`Failed to upload optimized image: ${uploadError.message}`);
        }
      } catch (error) {
        results.errors.push(`Optimization failed: ${error.message}`);
      }
    }
    
    // Thumbnail generation
    if (action === 'thumbnails' || action === 'all') {
      const thumbnailPromises = Object.entries(thumbnailSizes).map(async ([size, config]) => {
        try {
          const thumbnailBuffer = await sharp(buffer)
            .resize(config.width, config.height, { 
              fit: 'cover',
              position: 'center',
              withoutEnlargement: true 
            })
            .webp({ quality: config.quality })
            .toBuffer();
          
          const thumbnailPath = filePath.replace(/\.[^/.]+$/, '') + `_thumb_${size}.webp`;
          
          const { error: thumbUploadError } = await supabase.storage
            .from('cms-images')
            .upload(thumbnailPath, thumbnailBuffer, {
              contentType: 'image/webp',
              upsert: true
            });
          
          if (!thumbUploadError) {
            return {
              size,
              path: thumbnailPath,
              width: config.width,
              height: config.height,
              quality: config.quality,
              format: 'webp',
              sizeBytes: thumbnailBuffer.length
            };
          }
        } catch (error) {
          console.error(`Error generating thumbnail ${size}:`, error);
          return null;
        }
      });
      
      const thumbnails = await Promise.all(thumbnailPromises);
      results.thumbnails = thumbnails.filter(thumb => thumb !== null);
    }
    
    // Update media item in database
    if (results.optimized || results.thumbnails.length > 0) {
      const updateData = {
        optimized: true,
        optimization_status: 'completed',
        updated_at: new Date().toISOString()
      };
      
      if (results.thumbnails.length > 0) {
        updateData.thumbnails_metadata = results.thumbnails;
      }
      
      if (results.optimized) {
        updateData.optimized_version = results.optimized.path;
        updateData.optimized_size = results.optimized.size;
        updateData.size_savings = results.optimized.savings;
      }
      
      await supabase
        .from('media_items')
        .update(updateData)
        .eq('id', mediaId);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Image optimization completed',
      results,
      errors: results.errors.length > 0 ? results.errors : undefined
    });
    
  } catch (error) {
    console.error('Error in optimize-image API:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// For Vercel serverless functions
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb' // Set size limit for image uploads
    }
  }
};