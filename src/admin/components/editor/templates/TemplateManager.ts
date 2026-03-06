// TemplateManager - Gestionnaire de templates avec propagation des changements
// Gère les templates, leurs versions et la propagation des changements aux pages

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  components: any[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
  isSystem?: boolean;
  pagesUsingTemplate?: string[]; // IDs des pages utilisant ce template
}

export interface TemplateChange {
  templateId: string;
  versionFrom: number;
  versionTo: number;
  changes: {
    addedComponents?: any[];
    removedComponents?: any[];
    modifiedComponents?: Array<{
      componentId: string;
      oldProps: any;
      newProps: any;
    }>;
  };
  appliedToPages: string[]; // Pages où le changement a été appliqué
  createdAt: Date;
  changeId: string; // Identifiant unique du changement
}

export interface TemplateChangeNotification {
  templateId: string;
  templateName: string;
  changeId: string;
  versionFrom: number;
  versionTo: number;
  changes: TemplateChange['changes'];
  affectedPages: PageTemplateInfo[];
  createdAt: Date;
}

export interface PageTemplateInfo {
  pageId: string;
  pageTitle: string;
  templateId: string;
  templateVersion: number;
  lastSynced: Date;
  hasUnappliedChanges: boolean;
}

class TemplateManager {
  private templates: Map<string, Template> = new Map();
  private templateChanges: Map<string, TemplateChange[]> = new Map();
  private pageTemplateInfo: Map<string, PageTemplateInfo> = new Map();
  private storageKey = 'cms_template_manager';
  private changeListeners: Set<(notification: TemplateChangeNotification) => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.initializeSystemTemplates();
  }

  // Initialiser les templates système
  private initializeSystemTemplates(): void {
    const systemTemplates: Template[] = [
      {
        id: 'homepage',
        name: 'Page d\'accueil',
        description: 'Template complet pour une page d\'accueil moderne',
        category: 'pages',
        thumbnail: 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Accueil',
        components: [
          { type: 'hero', props: { title: 'Bienvenue', subtitle: 'Sous-titre accueil' } },
          { type: 'text', props: { content: '<p>Contenu de la page d\'accueil...</p>' } }
        ],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSystem: true
      },
      {
        id: 'about',
        name: 'Page À propos',
        description: 'Template pour une page de présentation',
        category: 'pages',
        thumbnail: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=À+propos',
        components: [
          { type: 'hero', props: { title: 'À propos de nous', subtitle: 'Notre histoire' } },
          { type: 'text', props: { content: '<p>Notre histoire et notre mission...</p>' } },
          { type: 'image', props: { src: 'https://via.placeholder.com/800x400', alt: 'Équipe' } }
        ],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSystem: true
      },
      {
        id: 'blank',
        name: 'Page vide',
        description: 'Commencer avec une page vierge',
        category: 'system',
        thumbnail: 'https://via.placeholder.com/300x200/6B7280/FFFFFF?text=Vierge',
        components: [],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSystem: true
      }
    ];

    systemTemplates.forEach(template => {
      if (!this.templates.has(template.id)) {
        this.templates.set(template.id, template);
      }
    });

    this.saveToStorage();
  }

  // Charger depuis le stockage local
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Templates
        if (data.templates) {
          data.templates.forEach((template: any) => {
            this.templates.set(template.id, {
              ...template,
              createdAt: new Date(template.createdAt),
              updatedAt: new Date(template.updatedAt)
            });
          });
        }
        
        // Changements de template
        if (data.templateChanges) {
          Object.entries(data.templateChanges).forEach(([templateId, changes]: [string, any]) => {
            this.templateChanges.set(templateId, changes.map((change: any) => ({
              ...change,
              createdAt: new Date(change.createdAt)
            })));
          });
        }
        
        // Informations page-template
        if (data.pageTemplateInfo) {
          Object.entries(data.pageTemplateInfo).forEach(([pageId, info]: [string, any]) => {
            this.pageTemplateInfo.set(pageId, {
              ...info,
              lastSynced: new Date(info.lastSynced)
            });
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du gestionnaire de templates:', error);
    }
  }

  // Sauvegarder dans le stockage local
  private saveToStorage(): void {
    try {
      const data = {
        templates: Array.from(this.templates.values()).map(template => ({
          ...template,
          createdAt: template.createdAt.toISOString(),
          updatedAt: template.updatedAt.toISOString()
        })),
        templateChanges: Object.fromEntries(
          Array.from(this.templateChanges.entries()).map(([templateId, changes]) => [
            templateId,
            changes.map(change => ({
              ...change,
              createdAt: change.createdAt.toISOString()
            }))
          ])
        ),
        pageTemplateInfo: Object.fromEntries(
          Array.from(this.pageTemplateInfo.entries()).map(([pageId, info]) => [
            pageId,
            {
              ...info,
              lastSynced: info.lastSynced.toISOString()
            }
          ])
        )
      };

      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du gestionnaire de templates:', error);
    }
  }

  // Créer un nouveau template
  createTemplate(templateData: Omit<Template, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'pagesUsingTemplate'>): Template {
    const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const template: Template = {
      ...templateData,
      id,
      version: 1,
      createdAt: now,
      updatedAt: now,
      pagesUsingTemplate: []
    };

    this.templates.set(id, template);
    this.saveToStorage();

    return template;
  }

  // Mettre à jour un template
  updateTemplate(
    templateId: string,
    updates: Partial<Pick<Template, 'name' | 'description' | 'category' | 'thumbnail' | 'components'>>
  ): { template: Template; change: TemplateChange } | null {
    const template = this.templates.get(templateId);
    if (!template) {
      return null;
    }

    const oldVersion = template.version;
    const newVersion = oldVersion + 1;

    // Analyser les changements
    const changes = this.analyzeTemplateChanges(template, updates);

    // Créer l'enregistrement de changement
    const templateChange: TemplateChange = {
      templateId,
      versionFrom: oldVersion,
      versionTo: newVersion,
      changes,
      appliedToPages: [],
      createdAt: new Date(),
      changeId: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Mettre à jour le template
    const updatedTemplate: Template = {
      ...template,
      ...updates,
      version: newVersion,
      updatedAt: new Date()
    };

    this.templates.set(templateId, updatedTemplate);

    // Enregistrer le changement
    if (!this.templateChanges.has(templateId)) {
      this.templateChanges.set(templateId, []);
    }
    this.templateChanges.get(templateId)!.push(templateChange);

    // Marquer les pages comme ayant des changements non appliqués
    if (template.pagesUsingTemplate && template.pagesUsingTemplate.length > 0) {
      template.pagesUsingTemplate.forEach(pageId => {
        const pageInfo = this.pageTemplateInfo.get(pageId);
        if (pageInfo) {
          pageInfo.hasUnappliedChanges = true;
          this.pageTemplateInfo.set(pageId, pageInfo);
        }
      });
    }

    this.saveToStorage();

    // Notifier les écouteurs du changement
    this.notifyChangeListeners(templateId, templateChange);

    return { template: updatedTemplate, change: templateChange };
  }

  // Analyser les changements entre deux versions de template
  private analyzeTemplateChanges(oldTemplate: Template, updates: any): TemplateChange['changes'] {
    const changes: TemplateChange['changes'] = {};

    // Vérifier les composants ajoutés
    if (updates.components && oldTemplate.components) {
      const oldComponentIds = oldTemplate.components.map((c: any) => c.id || JSON.stringify(c));
      const newComponentIds = updates.components.map((c: any) => c.id || JSON.stringify(c));
      
      const addedComponents = updates.components.filter((c: any) => {
        const componentId = c.id || JSON.stringify(c);
        return !oldComponentIds.includes(componentId);
      });
      
      const removedComponents = oldTemplate.components.filter((c: any) => {
        const componentId = c.id || JSON.stringify(c);
        return !newComponentIds.includes(componentId);
      });

      if (addedComponents.length > 0) {
        changes.addedComponents = addedComponents;
      }
      
      if (removedComponents.length > 0) {
        changes.removedComponents = removedComponents;
      }

      // Vérifier les composants modifiés
      const modifiedComponents: Array<{
        componentId: string;
        oldProps: any;
        newProps: any;
      }> = [];

      oldTemplate.components.forEach((oldComp: any, index: number) => {
        const newComp = updates.components?.[index];
        if (newComp && JSON.stringify(oldComp) !== JSON.stringify(newComp)) {
          const componentId = oldComp.id || `component_${index}`;
          modifiedComponents.push({
            componentId,
            oldProps: oldComp,
            newProps: newComp
          });
        }
      });

      if (modifiedComponents.length > 0) {
        changes.modifiedComponents = modifiedComponents;
      }
    }

    return changes;
  }

  // Associer une page à un template
  associatePageWithTemplate(pageId: string, pageTitle: string, templateId: string): PageTemplateInfo {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} non trouvé`);
    }

    const pageInfo: PageTemplateInfo = {
      pageId,
      pageTitle,
      templateId,
      templateVersion: template.version,
      lastSynced: new Date(),
      hasUnappliedChanges: false
    };

    this.pageTemplateInfo.set(pageId, pageInfo);

    // Ajouter la page à la liste des pages utilisant le template
    if (!template.pagesUsingTemplate) {
      template.pagesUsingTemplate = [];
    }
    if (!template.pagesUsingTemplate.includes(pageId)) {
      template.pagesUsingTemplate.push(pageId);
      this.templates.set(templateId, template);
    }

    this.saveToStorage();

    return pageInfo;
  }

  // Dissocier une page d'un template
  dissociatePageFromTemplate(pageId: string): void {
    const pageInfo = this.pageTemplateInfo.get(pageId);
    if (pageInfo) {
      // Retirer la page de la liste des pages utilisant le template
      const template = this.templates.get(pageInfo.templateId);
      if (template && template.pagesUsingTemplate) {
        template.pagesUsingTemplate = template.pagesUsingTemplate.filter(id => id !== pageId);
        this.templates.set(pageInfo.templateId, template);
      }

      this.pageTemplateInfo.delete(pageId);
      this.saveToStorage();
    }
  }

  // Obtenir les changements non appliqués pour une page
  getUnappliedChangesForPage(pageId: string): TemplateChange[] {
    const pageInfo = this.pageTemplateInfo.get(pageId);
    if (!pageInfo || !pageInfo.hasUnappliedChanges) {
      return [];
    }

    const templateChanges = this.templateChanges.get(pageInfo.templateId) || [];
    return templateChanges.filter(change => 
      change.versionFrom > pageInfo.templateVersion && 
      !change.appliedToPages.includes(pageId)
    );
  }

  // Appliquer les changements de template à une page
  applyTemplateChangesToPage(pageId: string, changeIds: string[]): boolean {
    const pageInfo = this.pageTemplateInfo.get(pageId);
    if (!pageInfo) {
      return false;
    }

    const templateChanges = this.templateChanges.get(pageInfo.templateId) || [];
    const template = this.templates.get(pageInfo.templateId);
    if (!template) {
      return false;
    }

    let appliedAny = false;

    changeIds.forEach(changeId => {
      const change = templateChanges.find(c => 
        `${c.templateId}_${c.versionFrom}_${c.versionTo}` === changeId
      );

      if (change && !change.appliedToPages.includes(pageId)) {
        change.appliedToPages.push(pageId);
        appliedAny = true;
      }
    });

    // Mettre à jour la version du template pour la page
    if (appliedAny) {
      pageInfo.templateVersion = template.version;
      pageInfo.lastSynced = new Date();
      pageInfo.hasUnappliedChanges = this.hasUnappliedChanges(pageId);
      this.pageTemplateInfo.set(pageId, pageInfo);
      this.saveToStorage();
    }

    return appliedAny;
  }

  // Vérifier si une page a des changements non appliqués
  hasUnappliedChanges(pageId: string): boolean {
    const pageInfo = this.pageTemplateInfo.get(pageId);
    if (!pageInfo) {
      return false;
    }

    const template = this.templates.get(pageInfo.templateId);
    if (!template) {
      return false;
    }

    return pageInfo.templateVersion < template.version;
  }

  // Obtenir toutes les pages utilisant un template
  getPagesUsingTemplate(templateId: string): PageTemplateInfo[] {
    const pages: PageTemplateInfo[] = [];
    
    this.pageTemplateInfo.forEach((pageInfo, pageId) => {
      if (pageInfo.templateId === templateId) {
        pages.push(pageInfo);
      }
    });

    return pages;
  }

  // Obtenir un template par ID
  getTemplate(templateId: string): Template | null {
    return this.templates.get(templateId) || null;
  }

  // Obtenir tous les templates
  getAllTemplates(): Template[] {
    return Array.from(this.templates.values());
  }

  // Obtenir les templates par catégorie
  getTemplatesByCategory(category: string): Template[] {
    return this.getAllTemplates().filter(template => template.category === category);
  }

  // Supprimer un template
  deleteTemplate(templateId: string): boolean {
    const template = this.templates.get(templateId);
    if (!template || template.isSystem) {
      return false;
    }

    // Vérifier si des pages utilisent ce template
    const pagesUsingTemplate = this.getPagesUsingTemplate(templateId);
    if (pagesUsingTemplate.length > 0) {
      throw new Error(`Impossible de supprimer le template: ${pagesUsingTemplate.length} page(s) l'utilisent`);
    }

    this.templates.delete(templateId);
    this.templateChanges.delete(templateId);
    this.saveToStorage();

    return true;
  }

  // Obtenir les statistiques
  getStatistics() {
    const templates = this.getAllTemplates();
    const pages = Array.from(this.pageTemplateInfo.values());

    return {
      totalTemplates: templates.length,
      totalPagesUsingTemplates: pages.length,
      templatesByCategory: templates.reduce((acc, template) => {
        acc[template.category] = (acc[template.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      pagesWithUnappliedChanges: pages.filter(p => p.hasUnappliedChanges).length,
      systemTemplates: templates.filter(t => t.isSystem).length,
      customTemplates: templates.filter(t => !t.isSystem).length
    };
  }

  // Notifier les écouteurs de changement
  private notifyChangeListeners(templateId: string, change: TemplateChange): void {
    const template = this.templates.get(templateId);
    if (!template) return;

    const affectedPages = this.getPagesUsingTemplate(templateId);
    
    const notification: TemplateChangeNotification = {
      templateId,
      templateName: template.name,
      changeId: change.changeId,
      versionFrom: change.versionFrom,
      versionTo: change.versionTo,
      changes: change.changes,
      affectedPages,
      createdAt: change.createdAt
    };

    this.changeListeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Erreur dans l\'écouteur de changement:', error);
      }
    });
  }

  // S'abonner aux notifications de changement
  subscribeToChanges(listener: (notification: TemplateChangeNotification) => void): () => void {
    this.changeListeners.add(listener);
    return () => {
      this.changeListeners.delete(listener);
    };
  }

  // Obtenir les changements récents pour un template
  getRecentChanges(templateId: string, limit: number = 10): TemplateChange[] {
    const changes = this.templateChanges.get(templateId) || [];
    return changes
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Appliquer automatiquement les changements mineurs
  applyMinorChangesAutomatically(templateId: string, pageId: string): boolean {
    const pageInfo = this.pageTemplateInfo.get(pageId);
    if (!pageInfo || pageInfo.templateId !== templateId) {
      return false;
    }

    const unappliedChanges = this.getUnappliedChangesForPage(pageId);
    const minorChanges = unappliedChanges.filter(change => {
      // Considérer comme mineur: modifications de propriétés seulement (pas d'ajout/suppression)
      return change.changes.modifiedComponents && 
             !change.changes.addedComponents && 
             !change.changes.removedComponents;
    });

    if (minorChanges.length === 0) {
      return false;
    }

    const changeIds = minorChanges.map(change => change.changeId);
    return this.applyTemplateChangesToPage(pageId, changeIds);
  }

  // Obtenir un résumé des changements non appliqués
  getUnappliedChangesSummary(pageId: string): {
    total: number;
    addedComponents: number;
    removedComponents: number;
    modifiedComponents: number;
  } {
    const changes = this.getUnappliedChangesForPage(pageId);
    
    return {
      total: changes.length,
      addedComponents: changes.reduce((sum, change) => 
        sum + (change.changes.addedComponents?.length || 0), 0),
      removedComponents: changes.reduce((sum, change) => 
        sum + (change.changes.removedComponents?.length || 0), 0),
      modifiedComponents: changes.reduce((sum, change) => 
        sum + (change.changes.modifiedComponents?.length || 0), 0)
    };
  }

  // Vérifier les conflits de changement
  checkChangeConflicts(pageId: string, changeId: string): string[] {
    const pageInfo = this.pageTemplateInfo.get(pageId);
    if (!pageInfo) {
      return ['Page non trouvée'];
    }

    const change = this.templateChanges
      .get(pageInfo.templateId)
      ?.find(c => c.changeId === changeId);

    if (!change) {
      return ['Changement non trouvé'];
    }

    const conflicts: string[] = [];

    // Vérifier les conflits avec les composants modifiés localement
    // (Dans une implémentation réelle, on vérifierait les modifications locales)
    
    return conflicts;
  }
}

// Instance singleton
let templateManagerInstance: TemplateManager | null = null;

export const getTemplateManager = (): TemplateManager => {
  if (!templateManagerInstance) {
    templateManagerInstance = new TemplateManager();
  }
  return templateManagerInstance;
};

// Utilitaires
export const createTemplateFromComponents = (
  name: string,
  description: string,
  components: any[],
  category: string = 'custom',
  thumbnail: string = 'https://via.placeholder.com/300x200/6B7280/FFFFFF?text=Template'
): Template => {
  const manager = getTemplateManager();
  return manager.createTemplate({
    name,
    description,
    category,
    thumbnail,
    components
  });
};

export const applyTemplateToPage = (
  pageId: string,
  pageTitle: string,
  templateId: string,
  components: any[]
): { success: boolean; pageInfo: PageTemplateInfo; unappliedChanges?: TemplateChange[] } => {
  const manager = getTemplateManager();
  
  try {
    const pageInfo = manager.associatePageWithTemplate(pageId, pageTitle, templateId);
    const unappliedChanges = manager.getUnappliedChangesForPage(pageId);
    
    return {
      success: true,
      pageInfo,
      unappliedChanges: unappliedChanges.length > 0 ? unappliedChanges : undefined
    };
  } catch (error) {
    console.error('Erreur lors de l\'application du template à la page:', error);
    return {
      success: false,
      pageInfo: {
        pageId,
        pageTitle,
        templateId: '',
        templateVersion: 0,
        lastSynced: new Date(),
        hasUnappliedChanges: false
      }
    };
  }
};