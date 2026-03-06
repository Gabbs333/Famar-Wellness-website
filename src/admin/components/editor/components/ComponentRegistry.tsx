// ComponentRegistry - Système d'enregistrement des composants réutilisables
// Permet d'enregistrer, gérer et réutiliser des composants personnalisés

import { ComponentDefinition } from './ComponentLibrary';

export interface RegisteredComponent {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  props: Record<string, any>;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  tags: string[];
  isPublic: boolean;
  author?: string;
}

export interface ComponentRegistryConfig {
  storageKey: string;
  maxComponents: number;
  defaultCategories: string[];
}

class ComponentRegistry {
  private components: Map<string, RegisteredComponent> = new Map();
  private config: ComponentRegistryConfig;
  private storage: Storage;

  constructor(config: Partial<ComponentRegistryConfig> = {}) {
    this.config = {
      storageKey: 'cms_component_registry',
      maxComponents: 100,
      defaultCategories: ['sections', 'content', 'media', 'forms', 'custom'],
      ...config
    };
    
    this.storage = typeof window !== 'undefined' ? localStorage : {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    } as Storage;
    
    this.loadFromStorage();
  }

  // Charger depuis le stockage local
  private loadFromStorage(): void {
    try {
      const stored = this.storage.getItem(this.config.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        data.forEach((comp: any) => {
          this.components.set(comp.id, {
            ...comp,
            createdAt: new Date(comp.createdAt),
            updatedAt: new Date(comp.updatedAt)
          });
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du registre:', error);
    }
  }

  // Sauvegarder dans le stockage local
  private saveToStorage(): void {
    try {
      const components = Array.from(this.components.values()).map(comp => ({
        ...comp,
        createdAt: comp.createdAt.toISOString(),
        updatedAt: comp.updatedAt.toISOString()
      }));
      this.storage.setItem(this.config.storageKey, JSON.stringify(components));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du registre:', error);
    }
  }

  // Générer un ID unique
  private generateId(): string {
    return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Enregistrer un nouveau composant
  registerComponent(
    definition: Omit<RegisteredComponent, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'> & { id?: string }
  ): RegisteredComponent {
    // Vérifier la limite
    if (this.components.size >= this.config.maxComponents) {
      throw new Error(`Limite de ${this.config.maxComponents} composants atteinte`);
    }

    const id = definition.id || this.generateId();
    const now = new Date();

    const component: RegisteredComponent = {
      ...definition,
      id,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      tags: definition.tags || [],
      isPublic: definition.isPublic !== undefined ? definition.isPublic : true
    };

    this.components.set(id, component);
    this.saveToStorage();

    return component;
  }

  // Enregistrer à partir d'un composant existant
  registerFromExisting(
    name: string,
    description: string,
    type: string,
    props: Record<string, any>,
    category: string = 'custom',
    options: Partial<Omit<RegisteredComponent, 'id' | 'name' | 'description' | 'type' | 'props' | 'category' | 'createdAt' | 'updatedAt' | 'usageCount'>> = {}
  ): RegisteredComponent {
    return this.registerComponent({
      name,
      description,
      type,
      props,
      category,
      thumbnail: options.thumbnail,
      tags: options.tags || [],
      isPublic: options.isPublic !== undefined ? options.isPublic : true,
      author: options.author
    });
  }

  // Mettre à jour un composant
  updateComponent(
    id: string,
    updates: Partial<Omit<RegisteredComponent, 'id' | 'createdAt' | 'usageCount'>>
  ): RegisteredComponent | null {
    const component = this.components.get(id);
    if (!component) {
      return null;
    }

    const updatedComponent: RegisteredComponent = {
      ...component,
      ...updates,
      updatedAt: new Date()
    };

    this.components.set(id, updatedComponent);
    this.saveToStorage();

    return updatedComponent;
  }

  // Supprimer un composant
  deleteComponent(id: string): boolean {
    const deleted = this.components.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  // Incrémenter le compteur d'utilisation
  incrementUsage(id: string): void {
    const component = this.components.get(id);
    if (component) {
      component.usageCount++;
      component.updatedAt = new Date();
      this.components.set(id, component);
      this.saveToStorage();
    }
  }

  // Obtenir un composant par ID
  getComponent(id: string): RegisteredComponent | null {
    return this.components.get(id) || null;
  }

  // Obtenir tous les composants
  getAllComponents(): RegisteredComponent[] {
    return Array.from(this.components.values());
  }

  // Filtrer les composants
  filterComponents(filters: {
    category?: string;
    tags?: string[];
    isPublic?: boolean;
    search?: string;
    minUsage?: number;
  } = {}): RegisteredComponent[] {
    return this.getAllComponents().filter(component => {
      if (filters.category && component.category !== filters.category) {
        return false;
      }
      
      if (filters.tags && filters.tags.length > 0) {
        const hasAllTags = filters.tags.every(tag => component.tags.includes(tag));
        if (!hasAllTags) {
          return false;
        }
      }
      
      if (filters.isPublic !== undefined && component.isPublic !== filters.isPublic) {
        return false;
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          component.name.toLowerCase().includes(searchLower) ||
          component.description.toLowerCase().includes(searchLower) ||
          component.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) {
          return false;
        }
      }
      
      if (filters.minUsage !== undefined && component.usageCount < filters.minUsage) {
        return false;
      }
      
      return true;
    });
  }

  // Obtenir les composants par catégorie
  getComponentsByCategory(category: string): RegisteredComponent[] {
    return this.filterComponents({ category });
  }

  // Obtenir les composants les plus utilisés
  getMostUsedComponents(limit: number = 10): RegisteredComponent[] {
    return this.getAllComponents()
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  // Obtenir les composants récemment créés
  getRecentComponents(limit: number = 10): RegisteredComponent[] {
    return this.getAllComponents()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Obtenir les statistiques
  getStatistics() {
    const components = this.getAllComponents();
    return {
      total: components.length,
      byCategory: components.reduce((acc, comp) => {
        acc[comp.category] = (acc[comp.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalUsage: components.reduce((sum, comp) => sum + comp.usageCount, 0),
      averageUsage: components.length > 0 
        ? components.reduce((sum, comp) => sum + comp.usageCount, 0) / components.length 
        : 0
    };
  }

  // Exporter le registre
  exportRegistry(): string {
    return JSON.stringify(this.getAllComponents(), null, 2);
  }

  // Importer le registre
  importRegistry(data: string): { success: boolean; imported: number; errors: string[] } {
    const errors: string[] = [];
    let imported = 0;

    try {
      const components = JSON.parse(data);
      
      if (!Array.isArray(components)) {
        throw new Error('Format invalide: les données doivent être un tableau');
      }

      components.forEach((comp, index) => {
        try {
          this.registerComponent({
            ...comp,
            id: comp.id || this.generateId()
          });
          imported++;
        } catch (error) {
          errors.push(`Composant ${index + 1}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
      });

      this.saveToStorage();
    } catch (error) {
      errors.push(`Erreur d'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    return { success: errors.length === 0, imported, errors };
  }

  // Vider le registre
  clearRegistry(): void {
    this.components.clear();
    this.storage.removeItem(this.config.storageKey);
  }
}

// Instance singleton
let registryInstance: ComponentRegistry | null = null;

export const getComponentRegistry = (config?: Partial<ComponentRegistryConfig>): ComponentRegistry => {
  if (!registryInstance) {
    registryInstance = new ComponentRegistry(config);
  }
  return registryInstance;
};

// Utilitaires
export const createComponentFromDefinition = (
  definition: ComponentDefinition,
  customProps?: Record<string, any>
): RegisteredComponent => {
  const registry = getComponentRegistry();
  return registry.registerFromExisting(
    definition.name,
    definition.description,
    definition.type,
    { ...definition.defaultProps, ...customProps },
    definition.category,
    {
      thumbnail: definition.preview ? 'data:image/svg+xml;base64,' + btoa(definition.preview.toString()) : undefined
    }
  );
};

export const convertToComponentDefinition = (
  component: RegisteredComponent
): ComponentDefinition => {
  return {
    id: component.id,
    type: component.type,
    name: component.name,
    description: component.description,
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    category: component.category,
    defaultProps: component.props,
    preview: (
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded h-20 flex items-center justify-center">
        <div className="text-center">
          <div className="font-bold text-gray-700">{component.name}</div>
          <div className="text-xs text-gray-500">Composant enregistré</div>
        </div>
      </div>
    )
  };
};