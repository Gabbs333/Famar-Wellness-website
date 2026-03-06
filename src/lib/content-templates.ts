// Content Templates System
// Provides pre-defined templates for quick content creation

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'page' | 'post' | 'section';
  content: {
    title?: string;
    content?: string;
    excerpt?: string;
    meta_title?: string;
    meta_description?: string;
    components?: any[];
  };
  icon: string;
}

// Page Templates
export const pageTemplates: ContentTemplate[] = [
  {
    id: 'about-us',
    name: 'About Us',
    description: 'Company introduction page with team section',
    category: 'page',
    icon: 'users',
    content: {
      title: 'About Us',
      meta_title: 'About Us - Company Name',
      meta_description: 'Learn more about our company and team',
      components: [
        {
          type: 'hero',
          props: {
            title: 'About Our Company',
            subtitle: 'We are dedicated to providing exceptional services',
            ctaText: 'Contact Us'
          }
        },
        {
          type: 'text',
          props: {
            content: '<h2>Our Story</h2><p>Founded in 2020, we have been committed to excellence...</p>'
          }
        },
        {
          type: 'testimonials',
          props: {
            title: 'What Our Clients Say',
            testimonials: []
          }
        }
      ]
    }
  },
  {
    id: 'services',
    name: 'Services Overview',
    description: 'Services listing page with pricing cards',
    category: 'page',
    icon: 'list',
    content: {
      title: 'Our Services',
      meta_title: 'Our Services - Company Name',
      meta_description: 'Explore our range of professional services',
      components: [
        {
          type: 'hero',
          props: {
            title: 'Our Services',
            subtitle: 'Professional solutions for your needs'
          }
        },
        {
          type: 'card',
          props: {
            title: 'Service 1',
            content: 'Detailed description of service 1'
          }
        }
      ]
    }
  },
  {
    id: 'contact',
    name: 'Contact Page',
    description: 'Contact form with location map',
    category: 'page',
    icon: 'mail',
    content: {
      title: 'Contact Us',
      meta_title: 'Contact Us - Company Name',
      meta_description: 'Get in touch with us',
      components: [
        {
          type: 'hero',
          props: {
            title: 'Get In Touch',
            subtitle: 'We would love to hear from you'
          }
        },
        {
          type: 'contact',
          props: {
            title: 'Send us a message',
            fields: ['name', 'email', 'phone', 'message']
          }
        }
      ]
    }
  }
];

// Blog Post Templates
export const postTemplates: ContentTemplate[] = [
  {
    id: 'how-to',
    name: 'How-To Guide',
    description: 'Step-by-step tutorial format',
    category: 'post',
    icon: 'book',
    content: {
      title: '',
      excerpt: '',
      meta_title: '',
      meta_description: '',
      content: `<h2>Introduction</h2>
<p>Brief introduction to the topic...</p>

<h2>Prerequisites</h2>
<ul>
  <li>Requirement 1</li>
  <li>Requirement 2</li>
</ul>

<h2>Step 1: Getting Started</h2>
<p>First step description...</p>

<h2>Step 2: The Next Step</h2>
<p>Second step description...</p>

<h2>Conclusion</h2>
<p>Summary of what was covered...</p>`
    }
  },
  {
    id: 'listicle',
    name: 'List Article',
    description: 'Numbered list format for top X items',
    category: 'post',
    icon: 'numbered',
    content: {
      title: '',
      excerpt: '',
      meta_title: '',
      meta_description: '',
      content: `<h2>Introduction</h2>
<p>Why this topic matters...</p>

<h2>1. First Item</h2>
<p>Description of item 1...</p>

<h2>2. Second Item</h2>
<p>Description of item 2...</p>

<h2>3. Third Item</h2>
<p>Description of item 3...</p>

<h2>Conclusion</h2>
<p>Final thoughts...</p>`
    }
  },
  {
    id: 'review',
    name: 'Product Review',
    description: 'Detailed product/service review',
    category: 'post',
    icon: 'star',
    content: {
      title: '',
      excerpt: '',
      meta_title: '',
      meta_description: '',
      content: `<h2>Overview</h2>
<p>Brief overview of the product...</p>

<h2>Features</h2>
<ul>
  <li>Feature 1</li>
  <li>Feature 2</li>
  <li>Feature 3</li>
</ul>

<h2>Pros</h2>
<ul>
  <li>Pro 1</li>
  <li>Pro 2</li>
</ul>

<h2>Cons</h2>
<ul>
  <li>Con 1</li>
</ul>

<h2>Final Verdict</h2>
<p>Overall conclusion...</p>`
    }
  },
  {
    id: 'news',
    name: 'News Article',
    description: 'Timely news or announcement',
    category: 'post',
    icon: 'newspaper',
    content: {
      title: '',
      excerpt: '',
      meta_title: '',
      meta_description: '',
      content: `<h2>What Happened</h2>
<p>Main news content...</p>

<h2>Background</h2>
<p>Context and background information...</p>

<h2>What's Next</h2>
<p>Future implications...</p>

<h2>Quote</h2>
<blockquote>"Relevant quote from involved party..."</blockquote>`
    }
  }
];

// Section Templates
export const sectionTemplates: ContentTemplate[] = [
  {
    id: 'hero-cta',
    name: 'Hero with CTA',
    description: 'Hero section with call-to-action button',
    category: 'section',
    icon: 'megaphone',
    content: {
      title: 'Welcome to Our Site',
      content: 'Discover amazing services and products',
      components: []
    }
  },
  {
    id: 'features-grid',
    name: 'Features Grid',
    description: '3-column features section',
    category: 'section',
    icon: 'grid',
    content: {
      components: []
    }
  },
  {
    id: 'testimonial-slider',
    name: 'Testimonials',
    description: 'Customer testimonials section',
    category: 'section',
    icon: 'quote',
    content: {
      title: 'What Our Clients Say',
      components: []
    }
  }
];

// Get all templates
export const getAllTemplates = (): ContentTemplate[] => [
  ...pageTemplates,
  ...postTemplates,
  ...sectionTemplates
];

// Get templates by category
export const getTemplatesByCategory = (category: 'page' | 'post' | 'section'): ContentTemplate[] => {
  switch (category) {
    case 'page':
      return pageTemplates;
    case 'post':
      return postTemplates;
    case 'section':
      return sectionTemplates;
    default:
      return [];
  }
};

// Get template by ID
export const getTemplateById = (id: string): ContentTemplate | undefined => {
  return getAllTemplates().find(t => t.id === id);
};

export default {
  pageTemplates,
  postTemplates,
  sectionTemplates,
  getAllTemplates,
  getTemplatesByCategory,
  getTemplateById
};
