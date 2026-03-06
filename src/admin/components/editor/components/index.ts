// Index des composants de base
// Exporte tous les composants disponibles pour la bibliothèque

export { default as Hero } from './Hero';
export type { HeroProps } from './Hero';

export { default as Text } from './Text';
export type { TextProps } from './Text';

export { default as Image } from './Image';
export type { ImageProps } from './Image';

export { default as Gallery } from './Gallery';
export type { GalleryProps } from './Gallery';

export { default as Card } from './Card';
export type { CardProps } from './Card';

export { default as Testimonials } from './Testimonials';
export type { TestimonialsProps, Testimonial } from './Testimonials';

export { default as CTA } from './CTA';
export type { CTAProps } from './CTA';

export { default as Contact } from './Contact';
export type { ContactProps, ContactField } from './Contact';

// Types communs
export interface BaseComponentProps {
  id?: string;
  type: string;
  props: Record<string, any>;
  onUpdate?: (props: Record<string, any>) => void;
  readOnly?: boolean;
}

// Configuration des composants disponibles
export const componentConfigs = [
  {
    type: 'hero',
    name: 'Hero Section',
    description: 'Section d\'accueil avec titre, sous-titre et CTA',
    category: 'sections',
    defaultProps: {
      title: 'Titre principal',
      subtitle: 'Sous-titre descriptif',
      ctaText: 'En savoir plus',
      ctaLink: '#',
      backgroundColor: 'gradient-teal',
      textColor: 'white',
      height: 'medium',
      align: 'center'
    }
  },
  {
    type: 'text',
    name: 'Bloc de texte',
    description: 'Bloc de texte avec formatage riche',
    category: 'content',
    defaultProps: {
      content: '<p>Votre texte ici...</p>',
      textAlign: 'left',
      maxWidth: 'full',
      backgroundColor: 'transparent',
      padding: 'medium'
    }
  },
  {
    type: 'image',
    name: 'Image',
    description: 'Image avec légende et options de redimensionnement',
    category: 'media',
    defaultProps: {
      src: 'https://via.placeholder.com/800x400',
      alt: 'Description de l\'image',
      caption: '',
      width: 'full',
      align: 'center',
      borderRadius: 'md',
      shadow: 'md'
    }
  },
  {
    type: 'gallery',
    name: 'Galerie d\'images',
    description: 'Grille d\'images avec lightbox',
    category: 'media',
    defaultProps: {
      images: [
        { id: '1', src: 'https://via.placeholder.com/400x300', alt: 'Image 1', caption: 'Première image' },
        { id: '2', src: 'https://via.placeholder.com/400x300', alt: 'Image 2', caption: 'Deuxième image' },
        { id: '3', src: 'https://via.placeholder.com/400x300', alt: 'Image 3', caption: 'Troisième image' }
      ],
      columns: 3,
      spacing: 'medium',
      showCaptions: true,
      lightbox: true,
      aspectRatio: 'landscape',
      borderRadius: 'md',
      shadow: 'md'
    }
  },
  {
    type: 'card',
    name: 'Carte',
    description: 'Carte avec titre, contenu et bouton',
    category: 'content',
    defaultProps: {
      title: 'Titre de la carte',
      subtitle: 'Sous-titre de la carte',
      content: 'Contenu de la carte. Vous pouvez ajouter du texte, des images ou d\'autres éléments ici.',
      button: {
        text: 'En savoir plus',
        link: '#',
        variant: 'primary'
      },
      variant: 'default',
      align: 'left',
      maxWidth: 'md',
      shadow: 'md',
      borderRadius: 'md',
      backgroundColor: 'white',
      textColor: 'gray-800',
      padding: 'md'
    }
  },
  {
    type: 'testimonials',
    name: 'Témoignages',
    description: 'Section de témoignages clients',
    category: 'sections',
    defaultProps: {
      title: 'Ce que disent nos clients',
      subtitle: 'Découvrez les témoignages de nos clients satisfaits',
      testimonials: [
        {
          id: '1',
          name: 'Jean Dupont',
          role: 'CEO',
          company: 'TechCorp',
          avatar: 'https://via.placeholder.com/100',
          content: 'Excellent service ! Notre satisfaction client a augmenté de 40% depuis que nous utilisons ce produit.',
          rating: 5,
          date: '2024-01-15'
        }
      ],
      layout: 'grid',
      columns: 3,
      showAvatars: true,
      showRatings: true,
      showCompany: true,
      backgroundColor: 'bg-white',
      textColor: 'text-gray-800'
    }
  },
  {
    type: 'cta',
    name: 'Call to Action',
    description: 'Section d\'appel à l\'action',
    category: 'sections',
    defaultProps: {
      title: 'Prêt à commencer ?',
      subtitle: 'Rejoignez-nous dès aujourd\'hui et découvrez comment nous pouvons vous aider à atteindre vos objectifs.',
      button: {
        text: 'Commencer maintenant',
        link: '#',
        variant: 'primary',
        size: 'lg'
      },
      layout: 'centered',
      backgroundColor: 'bg-gradient-to-r from-teal-600 to-teal-800',
      textColor: 'text-white',
      padding: 'lg',
      borderRadius: 'lg',
      shadow: 'lg'
    }
  },
  {
    type: 'contact',
    name: 'Formulaire de contact',
    description: 'Formulaire de contact avec validation',
    category: 'forms',
    defaultProps: {
      title: 'Contactez-nous',
      subtitle: 'Nous répondrons rapidement à votre message',
      fields: [
        { id: 'name', type: 'text', label: 'Nom complet', name: 'name', placeholder: 'Votre nom', required: true },
        { id: 'email', type: 'email', label: 'Email', name: 'email', placeholder: 'votre@email.com', required: true },
        { id: 'message', type: 'textarea', label: 'Message', name: 'message', placeholder: 'Votre message...', required: true }
      ],
      submitText: 'Envoyer le message',
      layout: 'card',
      backgroundColor: 'bg-white',
      textColor: 'text-gray-800',
      showLabels: true,
      showPlaceholders: true
    }
  }
];

// Obtenir la configuration d'un composant par type
export const getComponentConfig = (type: string) => {
  return componentConfigs.find(config => config.type === type);
};

// Obtenir tous les composants d'une catégorie
export const getComponentsByCategory = (category: string) => {
  return componentConfigs.filter(config => config.category === category);
};

// Catégories disponibles
export const categories = [
  { id: 'sections', name: 'Sections', description: 'Sections de page complètes' },
  { id: 'content', name: 'Contenu', description: 'Blocs de contenu éditable' },
  { id: 'media', name: 'Médias', description: 'Images, vidéos et galeries' },
  { id: 'forms', name: 'Formulaires', description: 'Formulaires et interactions' }
];