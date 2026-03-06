// TemplateManager.test.ts - Tests pour le gestionnaire de templates

import { getTemplateManager, Template, TemplateChange } from './TemplateManager';

describe('TemplateManager', () => {
  beforeEach(() => {
    // Nettoyer le localStorage avant chaque test
    localStorage.clear();
  });

  test('devrait créer une instance singleton', () => {
    const manager1 = getTemplateManager();
    const manager2 = getTemplateManager();
    
    expect(manager1).toBe(manager2);
  });

  test('devrait initialiser les templates système', () => {
    const manager = getTemplateManager();
    const templates = manager.getAllTemplates();
    
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.some(t => t.id === 'homepage')).toBe(true);
    expect(templates.some(t => t.id === 'about')).toBe(true);
    expect(templates.some(t => t.id === 'blank')).toBe(true);
  });

  test('devrait créer un nouveau template', () => {
    const manager = getTemplateManager();
    
    const templateData = {
      name: 'Test Template',
      description: 'Template de test',
      category: 'test',
      thumbnail: 'https://via.placeholder.com/300x200',
      components: [
        { type: 'hero', props: { title: 'Test' } }
      ]
    };

    const template = manager.createTemplate(templateData);
    
    expect(template.id).toBeDefined();
    expect(template.name).toBe('Test Template');
    expect(template.version).toBe(1);
    expect(template.components).toHaveLength(1);
  });

  test('devrait mettre à jour un template et créer un changement', () => {
    const manager = getTemplateManager();
    
    // Créer un template
    const template = manager.createTemplate({
      name: 'Template à mettre à jour',
      description: 'Description initiale',
      category: 'test',
      thumbnail: 'https://via.placeholder.com/300x200',
      components: [
        { type: 'hero', props: { title: 'Titre initial' } }
      ]
    });

    // Mettre à jour le template
    const updateResult = manager.updateTemplate(template.id, {
      components: [
        { type: 'hero', props: { title: 'Titre mis à jour' } },
        { type: 'text', props: { content: 'Nouveau contenu' } }
      ]
    });

    expect(updateResult).not.toBeNull();
    expect(updateResult!.template.version).toBe(2);
    expect(updateResult!.change.versionFrom).toBe(1);
    expect(updateResult!.change.versionTo).toBe(2);
    expect(updateResult!.change.changes.addedComponents).toHaveLength(1);
  });

  test('devrait associer une page à un template', () => {
    const manager = getTemplateManager();
    
    const template = manager.createTemplate({
      name: 'Template pour association',
      description: 'Test association',
      category: 'test',
      thumbnail: 'https://via.placeholder.com/300x200',
      components: []
    });

    const pageInfo = manager.associatePageWithTemplate('page-123', 'Page de test', template.id);
    
    expect(pageInfo.pageId).toBe('page-123');
    expect(pageInfo.templateId).toBe(template.id);
    expect(pageInfo.templateVersion).toBe(template.version);
    expect(pageInfo.hasUnappliedChanges).toBe(false);
  });

  test('devrait détecter les changements non appliqués', () => {
    const manager = getTemplateManager();
    
    // Créer un template
    const template = manager.createTemplate({
      name: 'Template avec changements',
      description: 'Test changements',
      category: 'test',
      thumbnail: 'https://via.placeholder.com/300x200',
      components: [
        { type: 'hero', props: { title: 'Version 1' } }
      ]
    });

    // Associer une page
    manager.associatePageWithTemplate('page-456', 'Page test', template.id);

    // Mettre à jour le template
    manager.updateTemplate(template.id, {
      components: [
        { type: 'hero', props: { title: 'Version 2' } },
        { type: 'text', props: { content: 'Nouveau texte' } }
      ]
    });

    // Vérifier les changements non appliqués
    const unappliedChanges = manager.getUnappliedChangesForPage('page-456');
    
    expect(unappliedChanges).toHaveLength(1);
    expect(unappliedChanges[0].versionFrom).toBe(1);
    expect(unappliedChanges[0].versionTo).toBe(2);
  });

  test('devrait appliquer les changements à une page', () => {
    const manager = getTemplateManager();
    
    // Créer un template
    const template = manager.createTemplate({
      name: 'Template pour application',
      description: 'Test application',
      category: 'test',
      thumbnail: 'https://via.placeholder.com/300x200',
      components: [
        { type: 'hero', props: { title: 'Avant' } }
      ]
    });

    // Associer une page
    manager.associatePageWithTemplate('page-789', 'Page application', template.id);

    // Mettre à jour le template
    const updateResult = manager.updateTemplate(template.id, {
      components: [
        { type: 'hero', props: { title: 'Après' } }
      ]
    });

    // Appliquer les changements
    const success = manager.applyTemplateChangesToPage('page-789', [updateResult!.change.changeId]);
    
    expect(success).toBe(true);
    
    // Vérifier qu'il n'y a plus de changements non appliqués
    const unappliedChanges = manager.getUnappliedChangesForPage('page-789');
    expect(unappliedChanges).toHaveLength(0);
  });

  test('devrait notifier les écouteurs de changement', (done) => {
    const manager = getTemplateManager();
    
    // Créer un template
    const template = manager.createTemplate({
      name: 'Template notification',
      description: 'Test notification',
      category: 'test',
      thumbnail: 'https://via.placeholder.com/300x200',
      components: []
    });

    // Associer une page
    manager.associatePageWithTemplate('page-notif', 'Page notification', template.id);

    // S'abonner aux notifications
    const unsubscribe = manager.subscribeToChanges((notification) => {
      expect(notification.templateId).toBe(template.id);
      expect(notification.versionFrom).toBe(1);
      expect(notification.versionTo).toBe(2);
      expect(notification.affectedPages).toHaveLength(1);
      
      unsubscribe();
      done();
    });

    // Mettre à jour le template (déclenchera la notification)
    manager.updateTemplate(template.id, {
      name: 'Template notification mis à jour'
    });
  });

  test('devrait obtenir les statistiques', () => {
    const manager = getTemplateManager();
    
    // Créer quelques templates
    manager.createTemplate({
      name: 'Template 1',
      description: 'Test 1',
      category: 'category1',
      thumbnail: 'https://via.placeholder.com/300x200',
      components: []
    });

    manager.createTemplate({
      name: 'Template 2',
      description: 'Test 2',
      category: 'category2',
      thumbnail: 'https://via.placeholder.com/300x200',
      components: []
    });

    const stats = manager.getStatistics();
    
    expect(stats.totalTemplates).toBeGreaterThan(2); // Inclut les templates système
    expect(stats.customTemplates).toBe(2);
    expect(stats.systemTemplates).toBeGreaterThan(0);
  });

  test('devrait gérer la suppression de template', () => {
    const manager = getTemplateManager();
    
    const template = manager.createTemplate({
      name: 'Template à supprimer',
      description: 'Test suppression',
      category: 'test',
      thumbnail: 'https://via.placeholder.com/300x200',
      components: []
    });

    // Associer une page (devrait empêcher la suppression)
    manager.associatePageWithTemplate('page-block', 'Page bloquante', template.id);
    
    expect(() => {
      manager.deleteTemplate(template.id);
    }).toThrow();

    // Dissocier la page
    manager.dissociatePageFromTemplate('page-block');
    
    // Maintenant la suppression devrait fonctionner
    const success = manager.deleteTemplate(template.id);
    expect(success).toBe(true);
    
    // Vérifier que le template n'existe plus
    const deletedTemplate = manager.getTemplate(template.id);
    expect(deletedTemplate).toBeNull();
  });
});