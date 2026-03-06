-- =============================================================================
-- CMS SEED DATA - Pre-populate with existing website content
-- This script seeds the CMS with all existing pages and their editable content
-- Run this after creating the CMS schema
-- =============================================================================

-- Clear existing data
TRUNCATE cms_pages CASCADE;

-- =============================================================================
-- PAGE: HOME / ACCUEIL
-- =============================================================================
INSERT INTO cms_pages (id, title, slug, content, published, meta_title, meta_description) 
VALUES (
  uuid_generate_v4(),
  'Accueil',
  'accueil',
  '{
    "sections": [
      {
        "id": "hero-1",
        "type": "hero",
        "content": {
          "title": "Bienvenue chez Famar Wellness",
          "subtitle": "Votre santé mérite l''excellence absolue",
          "backgroundImage": "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
          "ctaText": "Réserver maintenant",
          "ctaLink": "/reservation"
        }
      },
      {
        "id": "intro-1",
        "type": "intro",
        "content": {
          "title": "Votre santé mérite L''excellence absolue",
          "description": "Situé au cœur de Bastos à Yaoundé, notre cabinet réinvente la massothérapie en combinant l''expertise manuelle aux technologies les plus avancées (I-Motion, Andullation, Tecarthérapie). Que vous soyez sportif de haut niveau, souffrant de douleurs chroniques ou simplement en quête de bien-être, nous avons une solution personnalisée pour vous.",
          "image": "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          "linkText": "En savoir plus sur notre approche",
          "link": "/a-propos"
        }
      },
      {
        "id": "services-featured",
        "type": "services",
        "content": {
          "title": "Nos Soins Phares",
          "description": "Découvrez nos traitements les plus demandés pour une récupération et un bien-être optimal.",
          "services": [
            {
              "title": "Electrostimulation",
              "description": "20 minutes = 4h de sport. Renforcement musculaire et perte de poids rapide.",
              "image": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
              "title": "Thérapie par Andullation",
              "description": "Soulagement immédiat des douleurs dorsales et relaxation profonde.",
              "image": "https://images.unsplash.com/photo-1519824145371-296894a0daa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
              "title": "Massages Sportifs",
              "description": "Récupération musculaire et prévention des blessures pour les athlètes.",
              "image": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            }
          ]
        }
      },
      {
        "id": "cta-1",
        "type": "cta",
        "content": {
          "title": "Prêt à transformer votre santé ?",
          "description": "Ne laissez plus la douleur ou le stress dicter votre quotidien. Prenez rendez-vous dès aujourd''hui et découvrez la différence Famar Wellness.",
          "primaryButtonText": "Réserver ma séance",
          "primaryButtonLink": "/reservation",
          "secondaryButtonText": "Nous contacter",
          "secondaryButtonLink": "/contact"
        }
      }
    ]
  }'::jsonb,
  false,
  'Famar Wellness - Massothérapie et Bien-être à Yaoundé',
  'Cabinet de massothérapie à Yaoundé. I-Motion, Andullation, Tecarthérapie. Sportifs et bien-être.'
);

-- =============================================================================
-- PAGE: SERVICES
-- =============================================================================
INSERT INTO cms_pages (id, title, slug, content, published, meta_title, meta_description) 
VALUES (
  uuid_generate_v4(),
  'Services',
  'services',
  '{
    "sections": [
      {
        "id": "services-hero",
        "type": "hero",
        "content": {
          "title": "Nos Services",
          "subtitle": "Des soins personnalisés pour votre bien-être",
          "backgroundImage": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        }
      },
      {
        "id": "services-list",
        "type": "services",
        "content": {
          "title": "Tous Nos Soins",
          "description": "Découvrez notre gamme complète de soins et traitements.",
          "services": [
            {
              "title": "Massothérapie Manuelle",
              "description": "Massages thérapeutiques et relaxation",
              "image": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
              "title": "Massage Sportif",
              "description": "Récupération musculaire pour athletes",
              "image": "https://images.unsplash.com/photo-1519824145371-296894a0daa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
              "title": "Analyse du Dos",
              "description": "Diagnostic et traitement des douleurs dorsales",
              "image": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
              "title": "I-Motion Électrostimulation",
              "description": "Technologie de pointe pour renforcement musculaire",
              "image": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
              "title": "Andullation",
              "description": "Thérapie par vibrations pour relaxation profonde",
              "image": "https://images.unsplash.com/photo-1519824145371-296894a0daa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
              "title": "Tecarthérapie",
              "description": "Traitement par radiofréquence",
              "image": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            }
          ]
        }
      }
    ]
  }'::jsonb,
  false,
  'Nos Services - Famar Wellness',
  'Tous nos soins et traitements: massage sportif, analyse du dos, I-Motion, Andullation, Tecarthérapie à Yaoundé.'
);

-- =============================================================================
-- PAGE: À PROPOS
-- =============================================================================
INSERT INTO cms_pages (id, title, slug, content, published, meta_title, meta_description) 
VALUES (
  uuid_generate_v4(),
  'À propos',
  'a-propos',
  '{
    "sections": [
      {
        "id": "about-hero",
        "type": "hero",
        "content": {
          "title": "À propos de Famar Wellness",
          "subtitle": "Votre partenaire bien-être à Yaoundé",
          "backgroundImage": "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        }
      },
      {
        "id": "about-intro",
        "type": "text",
        "content": {
          "html": "<h2>Notre Expertise</h2><p>Situé au cœur de Bastos à Yaoundé, notre cabinet réinvente la massothérapie en combinant l''expertise manuelle aux technologies les plus avancées.</p><p>Nous accueillons les sportifs de haut niveau, les personnes souffrant de douleurs chroniques, et tous ceux en quête de bien-être.</p>"
        }
      }
    ]
  }'::jsonb,
  false,
  'À propos - Famar Wellness',
  'Découvrez Famar Wellness, votre cabinet de massothérapie à Yaoundé. Expertise manuelle et technologies avancées.'
);

-- =============================================================================
-- PAGE: CONTACT
-- =============================================================================
INSERT INTO cms_pages (id, title, slug, content, published, meta_title, meta_description) 
VALUES (
  uuid_generate_v4(),
  'Contact',
  'contact',
  '{
    "sections": [
      {
        "id": "contact-hero",
        "type": "hero",
        "content": {
          "title": "Contactez-nous",
          "subtitle": "Nous sommes disponibles pour répondre à vos questions",
          "backgroundImage": "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        }
      },
      {
        "id": "contact-form",
        "type": "contact",
        "content": {
          "title": "Envoyez-nous un message",
          "email": "contact@famarwellness.com",
          "phone": "+237 674 51 81 13",
          "address": "Bastos, Yaoundé, Cameroun"
        }
      }
    ]
  }'::jsonb,
  false,
  'Contact - Famar Wellness',
  'Contactez Famar Wellness à Yaoundé. Téléphone: +237 674 51 81 13. Email: contact@famarwellness.com'
);

-- =============================================================================
-- PAGE: RÉSERVATION
-- =============================================================================
INSERT INTO cms_pages (id, title, slug, content, published, meta_title, meta_description) 
VALUES (
  uuid_generate_v4(),
  'Réservation',
  'reservation',
  '{
    "sections": [
      {
        "id": "booking-hero",
        "type": "hero",
        "content": {
          "title": "Réservez votre séance",
          "subtitle": "Choisissez le créneau qui vous convient",
          "backgroundImage": "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        }
      },
      {
        "id": "booking-services",
        "type": "text",
        "content": {
          "html": "<h2>Nos Services</h2><ul><li>Massothérapie Manuelle</li><li>Massage Sportif</li><li>Analyse du Dos</li><li>I-Motion Électrostimulation</li><li>Andullation</li><li>Tecarthérapie</li></ul>"
        }
      }
    ]
  }'::jsonb,
  false,
  'Réservation - Famar Wellness',
  'Réservez votre séance de massothérapie à Yaoundé. Massage sportif, I-Motion, Andullation, Tecarthérapie.'
);

-- =============================================================================
-- PAGE: TECHNOLOGIES
-- =============================================================================
INSERT INTO cms_pages (id, title, slug, content, published, meta_title, meta_description) 
VALUES (
  uuid_generate_v4(),
  'Technologies',
  'technologies',
  '{
    "sections": [
      {
        "id": "tech-hero",
        "type": "hero",
        "content": {
          "title": "Nos Technologies",
          "subtitle": "L''innovation au service de votre bien-être",
          "backgroundImage": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        }
      }
    ]
  }'::jsonb,
  false,
  'Technologies - Famar Wellness',
  'Découvrez nos technologies de pointe: I-Motion, Andullation, Tecarthérapie pour votre bien-être à Yaoundé.'
);

-- =============================================================================
-- PAGE: GALERIE
-- =============================================================================
INSERT INTO cms_pages (id, title, slug, content, published, meta_title, meta_description) 
VALUES (
  uuid_generate_v4(),
  'Galerie',
  'galerie',
  '{
    "sections": [
      {
        "id": "gallery-hero",
        "type": "hero",
        "content": {
          "title": "Galerie",
          "subtitle": "Découvrez notre cabinet et nos soins",
          "backgroundImage": "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        }
      },
      {
        "id": "gallery-1",
        "type": "gallery",
        "content": {
          "title": "Notre Cabinet",
          "columns": 3,
          "images": [
            {"src": "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", "alt": "Cabinet"},
            {"src": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", "alt": "Massage"},
            {"src": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", "alt": "Technologie"}
          ]
        }
      }
    ]
  }'::jsonb,
  false,
  'Galerie - Famar Wellness',
  'Découvrez notre cabinet de massothérapie à Yaoundé en images.'
);

-- =============================================================================
-- MODALS / POPUPS (stored as special pages with modal flag)
-- =============================================================================
INSERT INTO cms_pages (id, title, slug, content, published, meta_title, meta_description) 
VALUES (
  uuid_generate_v4(),
  'Modal Rappel',
  'modal-callback',
  '{
    "type": "modal",
    "sections": [
      {
        "id": "callback-content",
        "type": "text",
        "content": {
          "title": "Rappel Téléphonique",
          "description": "Laissez-nous vos coordonnées, nous vous rappellerons pour répondre à vos questions ou fixer un rendez-vous.",
          "successMessage": "Demande envoyée ! Nous vous rappellerons dans les plus brefs délais."
        }
      }
    ]
  }'::jsonb,
  false,
  '',
  ''
);

INSERT INTO cms_pages (id, title, slug, content, published, meta_title, meta_description) 
VALUES (
  uuid_generate_v4(),
  'Modal Newsletter',
  'modal-newsletter',
  '{
    "type": "modal",
    "sections": [
      {
        "id": "newsletter-content",
        "type": "text",
        "content": {
          "title": "Abonnez-vous à notre newsletter",
          "description": "Recevez nos offres spéciales et conseils bien-être",
          "placeholder": "Votre email",
          "buttonText": "S''abonner",
          "successMessage": "Merci pour votre inscription !"
        }
      }
    ]
  }'::jsonb,
  false,
  '',
  ''
);

-- =============================================================================
-- CONFIRMATION
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'CMS SEED DATA CREE AVEC SUCCES!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Pages creees:';
    RAISE NOTICE '- Accueil (accueil)';
    RAISE NOTICE '- Services (services)';
    RAISE NOTICE '- A propos (a-propos)';
    RAISE NOTICE '- Contact (contact)';
    RAISE NOTICE '- Reservation (reservation)';
    RAISE NOTICE '- Technologies (technologies)';
    RAISE NOTICE '- Galerie (galerie)';
    RAISE NOTICE '- Modal Rappel (modal-callback)';
    RAISE NOTICE '- Modal Newsletter (modal-newsletter)';
    RAISE NOTICE '====================================================';
END $$;
