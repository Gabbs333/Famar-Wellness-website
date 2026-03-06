# Améliorations d'Accessibilité pour MediaManager

## Résumé de l'Audit
- **Score actuel**: 63%
- **Points forts**: Images avec alt, structure sémantique, messages d'erreur, design responsive
- **Améliorations nécessaires**: ARIA, navigation clavier, contrastes, lecteurs d'écran

## Améliorations Prioritaires

### 1. Attributs ARIA pour Annonces Dynamiques
```tsx
// Ajouter dans les états de chargement/upload
<div 
  aria-live="polite" 
  aria-atomic="true"
  role="status"
>
  {uploading && `Upload en cours: ${uploadProgress}%`}
</div>

// Pour les erreurs
{error && (
  <div 
    role="alert" 
    aria-live="assertive"
    className="..."
  >
    {error}
  </div>
)}
```

### 2. Labels pour les Champs de Formulaire
```tsx
// Pour le champ de recherche
<label htmlFor="search-input" className="sr-only">
  Rechercher dans la médiathèque
</label>
<input
  id="search-input"
  type="text"
  placeholder="Search media..."
  // ...
/>

// Pour le file input
<label htmlFor="file-upload" className="sr-only">
  Téléverser des fichiers
</label>
<input
  id="file-upload"
  type="file"
  ref={fileInputRef}
  className="sr-only"
  // ...
/>
```

### 3. Navigation au Clavier
```tsx
// Gestion de la touche ESC pour fermer les modals
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && previewItem) {
      setPreviewItem(null);
    }
  };
  
  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
}, [previewItem]);

// Focus management pour les modals
useEffect(() => {
  if (previewItem && modalRef.current) {
    modalRef.current.focus();
  }
}, [previewItem]);
```

### 4. Skip Navigation Link
```tsx
// Ajouter en haut du composant
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:border"
>
  Passer à la médiathèque
</a>

<main id="main-content" tabIndex={-1}>
  {/* Contenu du MediaManager */}
</main>
```

### 5. Améliorations des Boutons et Icônes
```tsx
// Boutons avec icônes seulement
<button
  aria-label={`Supprimer ${item.original_filename}`}
  onClick={() => handleDeleteItem(item)}
  className="..."
>
  <Trash2 className="w-5 h-5" />
</button>

// Boutons de vue grid/list
<button
  aria-label="Vue grille"
  aria-pressed={viewMode === 'grid'}
  onClick={() => setViewMode('grid')}
  className={...}
>
  <Grid className="w-5 h-5" />
</button>
```

### 6. États ARIA pour les Éléments Interactifs
```tsx
// Pour les éléments média sélectionnables
<div
  role="checkbox"
  aria-checked={selectedItems.some(selected => selected.id === item.id)}
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleFileSelect(item);
      e.preventDefault();
    }
  }}
  // ...
>
  {/* Contenu de l'élément média */}
</div>
```

### 7. Améliorations des Messages d'État
```tsx
// Pour la progression d'upload
{uploading && (
  <div 
    role="progressbar"
    aria-valuenow={uploadProgress}
    aria-valuemin="0"
    aria-valuemax="100"
    aria-label="Progression du téléversement"
  >
    <div className="..." style={{ width: `${uploadProgress}%` }} />
    <span className="sr-only">{uploadProgress}% complet</span>
  </div>
)}

// Pour l'optimisation
{optimizing && (
  <div 
    aria-live="polite"
    aria-label={`Optimisation en cours: ${optimizationProgress}%`}
  >
    <span className="sr-only">
      Optimisation de {optimizationQueue.length} images: {optimizationProgress}%
    </span>
  </div>
)}
```

## Code Complet des Améliorations

### Version Améliorée du MediaManager
```tsx
// Ajouter ces imports
import { useEffect, useRef, useState, useCallback } from 'react';

// Ajouter ces refs
const modalRef = useRef<HTMLDivElement>(null);
const mainContentRef = useRef<HTMLDivElement>(null);

// Ajouter ces effets
useEffect(() => {
  // Focus management pour l'accessibilité
  if (mainContentRef.current) {
    mainContentRef.current.focus();
  }
}, []);

useEffect(() => {
  // Gestion de la touche ESC
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (previewItem) {
        setPreviewItem(null);
      }
      if (showOptimizationPanel) {
        setShowOptimizationPanel(false);
      }
      if (showCompressionAnalysis) {
        setShowCompressionAnalysis(false);
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [previewItem, showOptimizationPanel, showCompressionAnalysis]);

// Modifier le JSX pour inclure l'accessibilité
return (
  <>
    {/* Skip navigation link */}
    <a 
      href="#media-manager-main" 
      className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[100] focus:p-4 focus:bg-white focus:border-2 focus:border-teal-600"
    >
      Passer au contenu principal
    </a>

    <div 
      id="media-manager-main"
      ref={mainContentRef}
      tabIndex={-1}
      className="bg-white rounded-lg shadow-md p-6"
      role="main"
      aria-label="Gestionnaire de médias"
    >
      {/* Header avec titre approprié */}
      <header>
        <h1 className="sr-only">Gestionnaire de médias</h1>
        <h2 className="text-2xl font-bold text-gray-800" id="media-library-heading">
          Media Library
        </h2>
      </header>

      {/* Messages d'erreur avec role="alert" */}
      {error && (
        <div 
          role="alert"
          aria-live="assertive"
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Zone d'upload avec labels accessibles */}
      <section aria-labelledby="upload-section-heading">
        <h3 id="upload-section-heading" className="sr-only">
          Zone de téléversement de fichiers
        </h3>
        
        <label htmlFor="file-upload-input" className="sr-only">
          Sélectionner des fichiers à téléverser
        </label>
        <input
          id="file-upload-input"
          type="file"
          ref={fileInputRef}
          className="sr-only"
          onChange={handleFileInputChange}
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
          aria-describedby="file-upload-instructions"
        />

        <div
          ref={dropZoneRef}
          role="region"
          aria-label="Zone de dépôt de fichiers"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
              e.preventDefault();
            }
          }}
        >
          <p id="file-upload-instructions">
            Glissez-déposez des fichiers ici, ou{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-teal-600 hover:text-teal-800 underline"
            >
              cliquez pour parcourir
            </button>
          </p>
        </div>
      </section>

      {/* Progression d'upload avec ARIA */}
      {uploading && (
        <div 
          role="progressbar"
          aria-valuenow={uploadProgress}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Progression du téléversement"
          className="mt-4"
        >
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="sr-only">{uploadProgress}% complet</span>
          <p className="text-sm text-gray-600 mt-1">
            Téléversement en cours... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Reste du composant avec améliorations similaires... */}
    </div>
  </>
);
```

## Checklist d'Implémentation

### Phase 1 - Priorité Haute (WCAG A)
- [ ] Ajouter `aria-label` aux boutons sans texte
- [ ] Ajouter `htmlFor`/`id` aux labels des champs
- [ ] Implémenter la touche ESC pour fermer les modals
- [ ] Ajouter `role="alert"` aux messages d'erreur
- [ ] Vérifier l'ordre de tabulation logique

### Phase 2 - Priorité Moyenne (WCAG AA)
- [ ] Ajouter `aria-live` aux annonces dynamiques
- [ ] Implémenter `aria-valuenow` pour les progressions
- [ ] Ajouter des descriptions aux images complexes
- [ ] Tester les contrastes de couleur
- [ ] Ajouter un lien "skip to content"

### Phase 3 - Priorité Basse (WCAG AAA)
- [ ] Implémenter `aria-describedby` pour instructions détaillées
- [ ] Ajouter des raccourcis clavier personnalisés
- [ ] Support complet des lecteurs d'écran
- [ ] Tests avec différents handicaps
- [ ] Documentation d'accessibilité

## Tests à Effectuer

### Tests Automatiques
```bash
# Lighthouse
npx lighthouse http://localhost:3000/admin/media --view

# axe-core
npm install axe-core @axe-core/react

# Jest avec testing-library
npm install @testing-library/jest-dom @testing-library/user-event
```

### Tests Manuels
1. **Navigation au clavier**
   - Tabulation dans l'ordre logique
   - Touche ESC fonctionne
   - Espace/Entrée sur les éléments interactifs

2. **Lecteurs d'écran**
   - NVDA (Windows)
   - VoiceOver (macOS/iOS)
   - JAWS (Windows)

3. **Contrastes**
   - Outil Lighthouse
   - Extension axe DevTools
   - Site WebAIM Contrast Checker

4. **Mobile**
   - Zoom à 200%
   - Taille des cibles tactiles
   - Orientation portrait/paysage

## Ressources Utiles

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)

### Outils
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Evaluation Tool](https://wave.webaim.org/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Plugins React
```json
{
  "dependencies": {
    "@axe-core/react": "^4.7.0",
    "react-aria": "^3.0.0",
    "react-focus-lock": "^2.9.0"
  }
}
```

## Suivi et Maintenance

### Métriques à Surveiller
- Score Lighthouse Accessibility
- Nombre de violations axe-core
- Feedback des utilisateurs handicapés
- Temps de résolution des problèmes d'accessibilité

### Revue d'Accessibilité
- Revue trimestrielle avec checklist WCAG
- Tests utilisateurs avec personnes handicapées
- Mise à jour avec les nouvelles guidelines
- Formation de l'équipe sur l'accessibilité

---

**Dernière mise à jour**: Audit du MediaManager - Score 63%
**Prochaine revue**: Après implémentation des améliorations prioritaires
**Objectif**: Atteindre 90%+ de conformité WCAG AA