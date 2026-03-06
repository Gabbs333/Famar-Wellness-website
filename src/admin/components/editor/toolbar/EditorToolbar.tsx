// EditorToolbar - Barre d'outils pour l'éditeur Tiptap
// Fournit les boutons de formatage de texte et d'insertion de contenu

import React from 'react';
import { Editor } from '@tiptap/react';

interface EditorToolbarProps {
  editor: Editor | null;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  // Fonctions pour les boutons
  const toggleHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const toggleBold = () => {
    editor.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor.chain().focus().toggleItalic().run();
  };

  const toggleStrike = () => {
    editor.chain().focus().toggleStrike().run();
  };

  const toggleBulletList = () => {
    editor.chain().focus().toggleBulletList().run();
  };

  const toggleOrderedList = () => {
    editor.chain().focus().toggleOrderedList().run();
  };

  const toggleBlockquote = () => {
    editor.chain().focus().toggleBlockquote().run();
  };

  const toggleCode = () => {
    editor.chain().focus().toggleCode().run();
  };

  const toggleCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  const setLink = () => {
    const url = window.prompt('URL du lien:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const unsetLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const insertImage = () => {
    const url = window.prompt('URL de l\'image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertYouTube = () => {
    const url = window.prompt('URL de la vidéo YouTube:');
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const clearFormatting = () => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  };

  const undo = () => {
    editor.chain().focus().undo().run();
  };

  const redo = () => {
    editor.chain().focus().redo().run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-white">
      {/* Boutons de formatage de texte */}
      <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
        <button
          onClick={() => toggleHeading(1)}
          className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-teal-100 text-teal-700' : 'text-gray-700 hover:bg-gray-100'}`}
          title="Titre 1"
        >
          H1
        </button>
        <button
          onClick={() => toggleHeading(2)}
          className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-teal-100 text-teal-700' : 'text-gray-700 hover:bg-gray-100'}`}
          title="Titre 2"
        >
          H2
        </button>
        <button
          onClick={() => toggleHeading(3)}
          className={`p-2 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-teal-100 text-teal-700' : 'text-gray-700 hover:bg-gray-100'}`}
          title="Titre 3"
        >
          H3
        </button>
      </div>

      <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
        <button
          onClick={toggleBold}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-teal-100 text-teal-700' : 'text-gray-700 hover:bg-gray-100'}`}
          title="Gras"
        >
          <span className="font-bold">B</span>
        </button>
        <button
          onClick={toggleItalic}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-teal-100 text-teal-700' : 'text-gray-700 hover:bg-gray-100'}`}
          title="Italique"
        >
          <span className="italic">I</span>
        </button>
        <button
          onClick={toggleStrike}
          className={`p-2 rounded ${editor.isActive('strike') ? 'bg-teal-100 text-teal-700' : 'text-gray-700 hover:bg-gray-100'}`}
          title="Barré"
        >
          <span className="line-through">S</span>
        </button>
      </div>

      <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
        <button
          onClick={toggleBulletList}
          className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-teal-100 text-teal-700' : 'text-gray-700 hover:bg-gray-100'}`}
          title="Liste à puces"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={toggleOrderedList}
          className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-teal-100 text-teal-700' : 'text-gray-700 hover:bg-gray-100'}`}
          title="Liste numérotée"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={toggleBlockquote}
          className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-teal-100 text-teal-700' : 'text-gray-700 hover:bg-gray-100'}`}
          title="Citation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>

      <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
        <button
          onClick={toggleCode}
          className={`p-2 rounded ${editor.isActive('code') ? 'bg-teal-100 text-teal-700' : 'text-gray-700 hover:bg-gray-100'}`}
          title="Code en ligne"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </button>
        <button
          onClick={toggleCodeBlock}
          className={`p-2 rounded ${editor.isActive('codeBlock') ? 'bg-teal-100 text-teal-700' : 'text-gray-700 hover:bg-gray-100'}`}
          title="Bloc de code"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Boutons d'insertion */}
      <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
        <button
          onClick={setLink}
          className={`p-2 rounded ${editor.isActive('link') ? 'bg-teal-100 text-teal-700' : 'text-gray-700 hover:bg-gray-100'}`}
          title="Insérer un lien"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
        {editor.isActive('link') && (
          <button
            onClick={unsetLink}
            className="p-2 rounded text-red-600 hover:bg-red-50"
            title="Supprimer le lien"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          onClick={insertImage}
          className="p-2 rounded text-gray-700 hover:bg-gray-100"
          title="Insérer une image"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          onClick={insertYouTube}
          className="p-2 rounded text-gray-700 hover:bg-gray-100"
          title="Insérer une vidéo YouTube"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Boutons d'actions */}
      <div className="flex items-center">
        <button
          onClick={clearFormatting}
          className="p-2 rounded text-gray-700 hover:bg-gray-100"
          title="Effacer le formatage"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <button
          onClick={undo}
          disabled={!editor.can().undo()}
          className="p-2 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Annuler"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={!editor.can().redo()}
          className="p-2 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Rétablir"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-6a8 8 0 00-8 8v2M21 10l-6-6m6 6l-6 6" />
          </svg>
        </button>
      </div>

      {/* Indicateurs d'état */}
      <div className="ml-auto flex items-center text-sm text-gray-600">
        <span className="mr-3">
          {editor.isActive('heading', { level: 1 }) ? 'Titre 1' :
           editor.isActive('heading', { level: 2 }) ? 'Titre 2' :
           editor.isActive('heading', { level: 3 }) ? 'Titre 3' :
           'Paragraphe'}
        </span>
        <span className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-teal-100 text-teal-700' : 'bg-gray-100'}`}>
          Gras: {editor.isActive('bold') ? 'Oui' : 'Non'}
        </span>
        <span className={`ml-2 px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-teal-100 text-teal-700' : 'bg-gray-100'}`}>
          Italique: {editor.isActive('italic') ? 'Oui' : 'Non'}
        </span>
      </div>
    </div>
  );
};

export default EditorToolbar;