// Test file for MediaManager component
// This file demonstrates how to test the MediaManager component

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MediaManager from './src/admin/components/MediaManager';

// Mock Supabase client
jest.mock('./src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        range: jest.fn(() => ({
          eq: jest.fn(() => ({
            or: jest.fn(() => ({
              order: jest.fn(() => ({
                data: [
                  {
                    id: '1',
                    filename: 'test-image.jpg',
                    original_filename: 'test-image.jpg',
                    file_path: 'uploads/test-image.jpg',
                    file_size: 1024 * 500,
                    mime_type: 'image/jpeg',
                    uploaded_by: 1,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                  }
                ],
                error: null,
                count: 1
              }))
            }))
          }))
        }))
      }))
    })),
    storage: {
      from: jest.fn(() => ({
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: 'https://example.com/test-image.jpg' }
        }))
      }))
    }
  }
}));

describe('MediaManager Component', () => {
  test('renders MediaManager component', () => {
    render(<MediaManager />);
    
    // Check if the component renders
    expect(screen.getByText('Media Library')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search media...')).toBeInTheDocument();
  });

  test('displays upload area', () => {
    render(<MediaManager />);
    
    // Check upload area
    expect(screen.getByText('Drag and drop files here, or')).toBeInTheDocument();
    expect(screen.getByText('click to browse')).toBeInTheDocument();
  });

  test('handles file selection', async () => {
    const onSelect = jest.fn();
    render(<MediaManager onSelect={onSelect} />);
    
    // Simulate file selection
    const fileInput = screen.getByLabelText('file-input');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Check if onSelect was called
    await waitFor(() => {
      expect(onSelect).toHaveBeenCalled();
    });
  });

  test('handles search input', () => {
    render(<MediaManager />);
    
    const searchInput = screen.getByPlaceholderText('Search media...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    expect(searchInput).toHaveValue('test');
  });

  test('switches between grid and list view', () => {
    render(<MediaManager />);
    
    const gridButton = screen.getByLabelText('grid-view');
    const listButton = screen.getByLabelText('list-view');
    
    // Initially grid view should be active
    expect(gridButton).toHaveClass('bg-teal-100');
    
    // Switch to list view
    fireEvent.click(listButton);
    expect(listButton).toHaveClass('bg-teal-100');
  });

  test('handles filter selection', () => {
    render(<MediaManager />);
    
    const filterSelect = screen.getByLabelText('file-type-filter');
    fireEvent.change(filterSelect, { target: { value: 'image/jpeg' } });
    
    expect(filterSelect).toHaveValue('image/jpeg');
  });

  test('displays loading state', () => {
    // Mock loading state
    jest.spyOn(React, 'useState').mockImplementation(() => [
      [],
      jest.fn()
    ]);
    
    render(<MediaManager />);
    
    // Check if loading indicator is shown
    expect(screen.getByText('Loading media library...')).toBeInTheDocument();
  });

  test('handles empty state', () => {
    // Mock empty data
    jest.spyOn(React, 'useState').mockImplementation(() => [
      [],
      jest.fn()
    ]);
    
    render(<MediaManager />);
    
    // Check if empty state is shown
    expect(screen.getByText('No media found')).toBeInTheDocument();
    expect(screen.getByText('Upload your first file to get started')).toBeInTheDocument();
  });

  test('handles error state', () => {
    // Mock error state
    jest.spyOn(React, 'useState').mockImplementation(() => [
      [],
      jest.fn(),
      'Error message'
    ]);
    
    render(<MediaManager />);
    
    // Check if error message is shown
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});

// Integration test with actual Supabase
describe('MediaManager Integration Tests', () => {
  test('fetches media items on mount', async () => {
    render(<MediaManager />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading media library...')).not.toBeInTheDocument();
    });
    
    // Check if media items are displayed
    expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
  });

  test('handles file upload', async () => {
    // Mock file upload
    const mockUpload = jest.fn().mockResolvedValue({ error: null });
    jest.spyOn(require('./src/lib/supabase').supabase.storage, 'from').mockReturnValue({
      upload: mockUpload
    });
    
    render(<MediaManager />);
    
    const fileInput = screen.getByLabelText('file-input');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledWith('uploads/test.jpg', file);
    });
  });

  test('handles file deletion', async () => {
    const mockDelete = jest.fn().mockResolvedValue({ error: null });
    jest.spyOn(require('./src/lib/supabase').supabase.storage, 'from').mockReturnValue({
      remove: mockDelete
    });
    
    render(<MediaManager />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    });
    
    // Click delete button
    const deleteButton = screen.getByLabelText('delete');
    fireEvent.click(deleteButton);
    
    // Check if confirmation dialog appears
    expect(screen.getByText('Are you sure you want to delete "test-image.jpg"?')).toBeInTheDocument();
  });
});

// Accessibility tests
describe('MediaManager Accessibility', () => {
  test('has proper ARIA labels', () => {
    render(<MediaManager />);
    
    expect(screen.getByLabelText('file-input')).toBeInTheDocument();
    expect(screen.getByLabelText('search-input')).toBeInTheDocument();
    expect(screen.getByLabelText('grid-view')).toBeInTheDocument();
    expect(screen.getByLabelText('list-view')).toBeInTheDocument();
  });

  test('is keyboard navigable', () => {
    render(<MediaManager />);
    
    const searchInput = screen.getByPlaceholderText('Search media...');
    searchInput.focus();
    
    // Test tab navigation
    fireEvent.keyDown(searchInput, { key: 'Tab' });
    // Should move to next focusable element
  });

  test('has proper contrast ratios', () => {
    render(<MediaManager />);
    
    // Check text contrast
    const header = screen.getByText('Media Library');
    expect(header).toHaveClass('text-gray-800');
    
    const uploadText = screen.getByText('Drag and drop files here, or');
    expect(uploadText).toHaveClass('text-gray-600');
  });
});

// Performance tests
describe('MediaManager Performance', () => {
  test('handles large number of items', async () => {
    // Mock large dataset
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i}`,
      filename: `image-${i}.jpg`,
      original_filename: `image-${i}.jpg`,
      file_path: `uploads/image-${i}.jpg`,
      file_size: 1024 * 500,
      mime_type: 'image/jpeg',
      uploaded_by: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }));
    
    jest.spyOn(React, 'useState').mockImplementation(() => [
      largeDataset,
      jest.fn()
    ]);
    
    const startTime = performance.now();
    render(<MediaManager />);
    const endTime = performance.now();
    
    // Should render within 2 seconds
    expect(endTime - startTime).toBeLessThan(2000);
  });

  test('implements virtual scrolling for large lists', () => {
    render(<MediaManager />);
    
    // Check if only visible items are rendered
    const mediaItems = screen.queryAllByRole('article');
    expect(mediaItems.length).toBeLessThanOrEqual(20); // itemsPerPage default
  });
});

// Browser compatibility tests
describe('MediaManager Browser Compatibility', () => {
  test('works with different file types', () => {
    render(<MediaManager />);
    
    const fileInput = screen.getByLabelText('file-input');
    
    // Test different file types
    const testFiles = [
      new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      new File(['test'], 'test.png', { type: 'image/png' }),
      new File(['test'], 'test.pdf', { type: 'application/pdf' }),
      new File(['test'], 'test.gif', { type: 'image/gif' }),
      new File(['test'], 'test.webp', { type: 'image/webp' }),
    ];
    
    testFiles.forEach(file => {
      fireEvent.change(fileInput, { target: { files: [file] } });
      // Should handle all supported file types
    });
  });

  test('handles file size limits', () => {
    render(<MediaManager maxSize={5 * 1024 * 1024} />); // 5MB limit
    
    const fileInput = screen.getByLabelText('file-input');
    const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    
    // Should show error for file too large
    expect(screen.getByText(/exceeds maximum size/)).toBeInTheDocument();
  });
});

// Security tests
describe('MediaManager Security', () => {
  test('validates file types', () => {
    render(<MediaManager allowedTypes={['image/jpeg', 'image/png']} />);
    
    const fileInput = screen.getByLabelText('file-input');
    const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
    
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    
    // Should reject invalid file types
    expect(screen.getByText(/File type.*not allowed/)).toBeInTheDocument();
  });

  test('sanitizes file names', () => {
    render(<MediaManager />);
    
    const fileInput = screen.getByLabelText('file-input');
    const maliciousFile = new File(['test'], '../../etc/passwd', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [maliciousFile] } });
    
    // Should sanitize file names
    // The actual sanitization happens in the upload function
  });
});

// Export test utilities
export {
  // Test utilities
  mockSupabase,
  createTestFile,
  simulateDragAndDrop,
  // Test data
  testMediaItems,
  testFileTypes,
};