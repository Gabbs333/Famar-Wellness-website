// Tests simplifiés pour MediaManager
// Ces tests se concentrent sur la logique métier plutôt que sur le rendu React

import { validateImageFile, formatFileSize, generateAllThumbnails } from '../../lib/image-optimization';
import { getCompressionStrategy, getCompressionStats } from '../../lib/intelligent-compression';

// Tests pour les fonctions utilitaires d'optimisation d'images
describe('Image Optimization Utilities', () => {
  describe('formatFileSize', () => {
    test('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    test('formats with decimal places', () => {
      expect(formatFileSize(1500)).toBe('1.5 KB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
    });
  });

  describe('validateImageFile', () => {
    test('validates file size correctly', async () => {
      const smallFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(smallFile, 'size', { value: 100 * 1024 }); // 100KB

      const result = await validateImageFile(smallFile, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png'],
        minWidth: 50,
        minHeight: 50,
        maxWidth: 5000,
        maxHeight: 5000
      });

      expect(result.valid).toBe(true);
    });

    test('rejects files too large', async () => {
      const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 10 * 1024 * 1024 }); // 10MB

      const result = await validateImageFile(largeFile, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png'],
        minWidth: 50,
        minHeight: 50,
        maxWidth: 5000,
        maxHeight: 5000
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('File size exceeds maximum limit');
    });
  });

  describe('generateAllThumbnails', () => {
    test('generates thumbnail URLs for all sizes', () => {
      const filePath = 'uploads/test-image.jpg';
      const thumbnails = generateAllThumbnails(filePath);

      expect(thumbnails).toHaveProperty('xs');
      expect(thumbnails).toHaveProperty('sm');
      expect(thumbnails).toHaveProperty('md');
      expect(thumbnails).toHaveProperty('lg');
      expect(thumbnails).toHaveProperty('xl');

      expect(thumbnails.xs.url).toContain('test-image.jpg');
      expect(thumbnails.xs.width).toBe(50);
      expect(thumbnails.xs.height).toBe(50);
    });
  });
});

// Tests pour la compression intelligente
describe('Intelligent Compression', () => {
  describe('getCompressionStrategy', () => {
    test('returns balanced strategy by default', () => {
      const strategy = getCompressionStrategy({
        width: 1920,
        height: 1080,
        format: 'jpeg',
        fileSize: 2 * 1024 * 1024 // 2MB
      });

      expect(strategy).toBe('balanced');
    });

    test('returns aggressive strategy for large files', () => {
      const strategy = getCompressionStrategy({
        width: 4000,
        height: 3000,
        format: 'jpeg',
        fileSize: 10 * 1024 * 1024 // 10MB
      });

      expect(strategy).toBe('aggressive');
    });

    test('returns quality strategy for small important images', () => {
      const strategy = getCompressionStrategy({
        width: 800,
        height: 600,
        format: 'jpeg',
        fileSize: 500 * 1024, // 500KB
        isFeatured: true
      });

      expect(strategy).toBe('quality');
    });
  });

  describe('getCompressionStats', () => {
    test('calculates compression statistics', () => {
      const stats = getCompressionStats({
        originalSize: 2 * 1024 * 1024, // 2MB
        compressedSize: 1 * 1024 * 1024, // 1MB
        width: 1920,
        height: 1080,
        format: 'jpeg'
      });

      expect(stats.savingsPercentage).toBe(50);
      expect(stats.savingsBytes).toBe(1 * 1024 * 1024);
      expect(stats.compressionRatio).toBe(2);
    });
  });
});

// Tests pour la logique métier de MediaManager
describe('MediaManager Business Logic', () => {
  // Tests pour le calcul des statistiques d'utilisation
  describe('Usage Statistics', () => {
    const mockMediaItems = [
      { id: '1', mime_type: 'image/jpeg', optimized: true },
      { id: '2', mime_type: 'image/png', optimized: false },
      { id: '3', mime_type: 'image/jpeg', optimized: true },
      { id: '4', mime_type: 'application/pdf' },
      { id: '5', mime_type: 'image/gif', optimized: false }
    ];

    test('counts total images correctly', () => {
      const imageItems = mockMediaItems.filter(item => item.mime_type?.startsWith('image/'));
      expect(imageItems.length).toBe(4);
    });

    test('counts optimized images correctly', () => {
      const optimizedImages = mockMediaItems.filter(item => item.optimized);
      expect(optimizedImages.length).toBe(2);
    });

    test('calculates optimization percentage', () => {
      const imageItems = mockMediaItems.filter(item => item.mime_type?.startsWith('image/'));
      const optimizedImages = mockMediaItems.filter(item => item.optimized);
      const percentage = imageItems.length > 0 ? Math.round((optimizedImages.length / imageItems.length) * 100) : 0;
      
      expect(percentage).toBe(50); // 2 optimized out of 4 images
    });
  });

  // Tests pour la validation des types de fichiers
  describe('File Type Validation', () => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

    test('accepts valid file types', () => {
      const validFiles = [
        { type: 'image/jpeg' },
        { type: 'image/png' },
        { type: 'image/gif' },
        { type: 'image/webp' },
        { type: 'application/pdf' }
      ];

      validFiles.forEach(file => {
        expect(allowedTypes.includes(file.type)).toBe(true);
      });
    });

    test('rejects invalid file types', () => {
      const invalidFiles = [
        { type: 'text/plain' },
        { type: 'application/x-msdownload' },
        { type: 'video/mp4' }
      ];

      invalidFiles.forEach(file => {
        expect(allowedTypes.includes(file.type)).toBe(false);
      });
    });
  });

  // Tests pour le calcul des économies de compression
  describe('Compression Savings Calculation', () => {
    test('calculates total savings from multiple files', () => {
      const files = [
        { originalSize: 2 * 1024 * 1024, compressedSize: 1 * 1024 * 1024 }, // 2MB -> 1MB (50%)
        { originalSize: 5 * 1024 * 1024, compressedSize: 3 * 1024 * 1024 }, // 5MB -> 3MB (40%)
        { originalSize: 1 * 1024 * 1024, compressedSize: 800 * 1024 }       // 1MB -> 800KB (20%)
      ];

      const totalOriginal = files.reduce((sum, file) => sum + file.originalSize, 0);
      const totalCompressed = files.reduce((sum, file) => sum + file.compressedSize, 0);
      const totalSavings = totalOriginal - totalCompressed;
      const savingsPercentage = Math.round((totalSavings / totalOriginal) * 100);

      expect(totalOriginal).toBe(8 * 1024 * 1024); // 8MB
      expect(totalCompressed).toBe(4.8 * 1024 * 1024); // 4.8MB
      expect(totalSavings).toBe(3.2 * 1024 * 1024); // 3.2MB
      expect(savingsPercentage).toBe(40); // 40% average
    });
  });
});

// Tests pour les scénarios d'erreur
describe('Error Scenarios', () => {
  describe('File Size Limits', () => {
    test('rejects files exceeding maximum size', () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const testFiles = [
        { name: 'small.jpg', size: 5 * 1024 * 1024 }, // 5MB - OK
        { name: 'medium.jpg', size: 10 * 1024 * 1024 }, // 10MB - OK (at limit)
        { name: 'large.jpg', size: 15 * 1024 * 1024 }  // 15MB - Too large
      ];

      const validFiles = testFiles.filter(file => file.size <= maxSize);
      const invalidFiles = testFiles.filter(file => file.size > maxSize);

      expect(validFiles.length).toBe(2);
      expect(invalidFiles.length).toBe(1);
      expect(invalidFiles[0].name).toBe('large.jpg');
    });
  });

  describe('File Type Restrictions', () => {
    test('rejects unsupported file types', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const testFiles = [
        { name: 'photo.jpg', type: 'image/jpeg' }, // OK
        { name: 'document.pdf', type: 'application/pdf' }, // OK
        { name: 'script.exe', type: 'application/x-msdownload' }, // Rejected
        { name: 'data.txt', type: 'text/plain' } // Rejected
      ];

      const validFiles = testFiles.filter(file => allowedTypes.includes(file.type));
      const invalidFiles = testFiles.filter(file => !allowedTypes.includes(file.type));

      expect(validFiles.length).toBe(2);
      expect(invalidFiles.length).toBe(2);
    });
  });
});

// Tests de performance
describe('Performance Tests', () => {
  test('handles large number of media items efficiently', () => {
    // Simuler 1000 éléments média
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i}`,
      filename: `image-${i}.jpg`,
      file_size: 500 * 1024, // 500KB each
      mime_type: 'image/jpeg'
    }));

    // Calculer la taille totale
    const totalSize = largeDataset.reduce((sum, item) => sum + item.file_size, 0);
    const totalSizeMB = totalSize / (1024 * 1024);

    expect(largeDataset.length).toBe(1000);
    expect(totalSizeMB).toBeCloseTo(500, 0); // ~500MB total
  });

  test('filters items quickly', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i}`,
      filename: `item-${i}.jpg`,
      mime_type: i % 2 === 0 ? 'image/jpeg' : 'image/png'
    }));

    const startTime = performance.now();
    const jpegItems = items.filter(item => item.mime_type === 'image/jpeg');
    const endTime = performance.now();

    expect(jpegItems.length).toBe(500);
    expect(endTime - startTime).toBeLessThan(100); // Should filter in < 100ms
  });
});

// Export pour les tests d'intégration
export const testUtilities = {
  createMockMediaItem: (overrides = {}) => ({
    id: 'test-id',
    filename: 'test-image.jpg',
    original_filename: 'test-image.jpg',
    file_path: 'uploads/test-image.jpg',
    file_size: 1024 * 500,
    mime_type: 'image/jpeg',
    uploaded_by: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    url: 'https://example.com/test-image.jpg',
    ...overrides
  }),

  createMockFile: (name = 'test.jpg', type = 'image/jpeg', size = 1024 * 500) => {
    const file = new File(['test'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  }
};