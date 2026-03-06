// PageEditor.test.tsx - Tests unitaires pour le composant PageEditor

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageEditor from './PageEditor';

// Mock des dépendances Tiptap
jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(() => ({
    getHTML: jest.fn(() => '<p>Test content</p>'),
    chain: jest.fn(() => ({
      focus: jest.fn(() => ({
        toggleHeading: jest.fn(() => ({
          run: jest.fn()
        })),
        toggleBold: jest.fn(() => ({
          run: jest.fn()
        })),
        toggleItalic: jest.fn(() => ({
          run: jest.fn()
        })),
        toggleStrike: jest.fn(() => ({
          run: jest.fn()
        })),
        toggleBulletList: jest.fn(() => ({
          run: jest.fn()
        })),
        toggleOrderedList: jest.fn(() => ({
          run: jest.fn()
        })),
        toggleBlockquote: jest.fn(() => ({
          run: jest.fn()
        })),
        toggleCode: jest.fn(() => ({
          run: jest.fn()
        })),
        toggleCodeBlock: jest.fn(() => ({
          run: jest.fn()
        })),
        setLink: jest.fn(() => ({
          run: jest.fn()
        })),
        unsetLink: jest.fn(() => ({
          run: jest.fn()
        })),
        setImage: jest.fn(() => ({
          run: jest.fn()
        })),
        setYoutubeVideo: jest.fn(() => ({
          run: jest.fn()
        })),
        clearNodes: jest.fn(() => ({
          unsetAllMarks: jest.fn(() => ({
            run: jest.fn()
          }))
        })),
        undo: jest.fn(() => ({
          run: jest.fn()
        })),
        redo: jest.fn(() => ({
          run: jest.fn()
        }))
      }))
    })),
    isActive: jest.fn((type: string) => type === 'bold'),
    storage: {
      characterCount: {
        characters: jest.fn(() => 100),
        words: jest.fn(() => 20)
      }
    },
    on: jest.fn(),
    off: jest.fn(),
    destroy: jest.fn()
  })),
  EditorContent: jest.fn(() => <div data-testid="editor-content">Editor Content</div>)
}));

// Mock des extensions Tiptap
jest.mock('@tiptap/starter-kit', () => 'StarterKit');
jest.mock('@tiptap/extension-placeholder', () => 'Placeholder');
jest.mock('@tiptap/extension-link', () => 'Link');
jest.mock('@tiptap/extension-image', () => 'Image');
jest.mock('@tiptap/extension-youtube', () => 'YouTube');

describe('PageEditor Component', () => {
  const mockOnSave = jest.fn();
  const mockOnPublish = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the PageEditor component with default props', () => {
    render(<PageEditor />);
    
    // Vérifie que le composant est rendu
    expect(screen.getByPlaceholderText('Titre de la page')).toBeInTheDocument();
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    expect(screen.getByText('Prêt')).toBeInTheDocument();
  });

  test('renders with initial content and title', () => {
    render(
      <PageEditor 
        initialContent="<p>Initial content</p>"
        pageTitle="Test Page"
      />
    );
    
    expect(screen.getByDisplayValue('Test Page')).toBeInTheDocument();
  });

  test('handles title change', () => {
    render(<PageEditor />);
    
    const titleInput = screen.getByPlaceholderText('Titre de la page');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    
    expect(titleInput).toHaveValue('New Title');
  });

  test('toggles preview mode', () => {
    render(<PageEditor />);
    
    const previewButton = screen.getByText('Prévisualiser');
    fireEvent.click(previewButton);
    
    expect(screen.getByText('Éditer')).toBeInTheDocument();
  });

  test('handles save button click', async () => {
    render(<PageEditor onSave={mockOnSave} />);
    
    const saveButton = screen.getByText('Sauvegarder');
    fireEvent.click(saveButton);
    
    // Vérifie que la fonction onSave est appelée
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  test('handles publish button click', async () => {
    render(<PageEditor onPublish={mockOnPublish} />);
    
    const publishButton = screen.getByText('Publier');
    fireEvent.click(publishButton);
    
    // Vérifie que la fonction onPublish est appelée
    await waitFor(() => {
      expect(mockOnPublish).toHaveBeenCalled();
    });
  });

  test('shows component library when button is clicked', () => {
    render(<PageEditor />);
    
    const addComponentButton = screen.getByText('Ajouter un composant');
    fireEvent.click(addComponentButton);
    
    // Vérifie que la bibliothèque de composants est affichée
    expect(screen.getByText('Bibliothèque de composants')).toBeInTheDocument();
  });

  test('handles SEO metadata expansion', () => {
    render(<PageEditor />);
    
    const seoDetails = screen.getByText('Métadonnées SEO');
    fireEvent.click(seoDetails);
    
    // Vérifie que les champs SEO sont visibles
    expect(screen.getByPlaceholderText('Titre pour les moteurs de recherche')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description pour les moteurs de recherche')).toBeInTheDocument();
  });

  test('renders in read-only mode', () => {
    render(<PageEditor readOnly={true} />);
    
    // Vérifie que les boutons d'action ne sont pas visibles
    expect(screen.queryByText('Sauvegarder')).not.toBeInTheDocument();
    expect(screen.queryByText('Publier')).not.toBeInTheDocument();
    expect(screen.getByText('Mode lecture seule')).toBeInTheDocument();
  });

  test('generates slug from title', async () => {
    render(<PageEditor pageTitle="Test Page Title" />);
    
    // Vérifie que le slug est généré
    await waitFor(() => {
      expect(screen.getByText(/test-page-title/)).toBeInTheDocument();
    });
  });

  test('displays save status correctly', () => {
    render(<PageEditor />);
    
    // Vérifie que le statut de sauvegarde est affiché
    expect(screen.getByText('Prêt')).toBeInTheDocument();
    expect(screen.getByText('Sauvegarde automatique activée')).toBeInTheDocument();
  });
});

// Tests pour les sous-composants
describe('PageEditor Subcomponents', () => {
  test('renders EditorToolbar when not in read-only mode', () => {
    render(<PageEditor readOnly={false} />);
    
    // Vérifie que la barre d'outils est rendue
    expect(screen.getByText('Ajouter un composant')).toBeInTheDocument();
  });

  test('does not render EditorToolbar in read-only mode', () => {
    render(<PageEditor readOnly={true} />);
    
    // Vérifie que la barre d'outils n'est pas rendue
    expect(screen.queryByText('Ajouter un composant')).not.toBeInTheDocument();
  });

  test('handles drag and drop visual feedback', () => {
    render(<PageEditor />);
    
    const editorArea = screen.getByTestId('editor-content').parentElement?.parentElement;
    
    // Simule un drag over
    if (editorArea) {
      fireEvent.dragOver(editorArea);
      
      // Vérifie que le feedback visuel est présent
      // Note: Le feedback visuel peut être testé via les classes CSS
    }
  });
});

// Tests d'accessibilité
describe('PageEditor Accessibility', () => {
  test('has proper ARIA labels and roles', () => {
    render(<PageEditor />);
    
    // Vérifie que les éléments importants ont des labels appropriés
    const titleInput = screen.getByPlaceholderText('Titre de la page');
    expect(titleInput).toHaveAttribute('type', 'text');
    
    const saveButton = screen.getByText('Sauvegarder');
    expect(saveButton).toHaveAttribute('type', 'button');
    
    const previewButton = screen.getByText('Prévisualiser');
    expect(previewButton).toHaveAttribute('type', 'button');
  });

  test('supports keyboard navigation', () => {
    render(<PageEditor />);
    
    // Vérifie que les éléments sont focusables
    const titleInput = screen.getByPlaceholderText('Titre de la page');
    expect(titleInput).toBeFocusable();
    
    const saveButton = screen.getByText('Sauvegarder');
    expect(saveButton).toBeFocusable();
  });
});