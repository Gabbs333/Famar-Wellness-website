// Contact - Composant de formulaire de contact
// Formulaire de contact avec validation et soumission

import React, { useState } from 'react';

export interface ContactField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    customMessage?: string;
  };
  options?: Array<{ value: string; label: string }>;
}

export interface ContactProps {
  title?: string;
  subtitle?: string;
  fields?: ContactField[];
  submitText?: string;
  successMessage?: string;
  errorMessage?: string;
  layout?: 'simple' | 'card' | 'split';
  backgroundColor?: string;
  textColor?: string;
  showLabels?: boolean;
  showPlaceholders?: boolean;
  readOnly?: boolean;
  onSubmit?: (data: Record<string, any>) => void;
}

const Contact: React.FC<ContactProps> = ({
  title = 'Contactez-nous',
  subtitle = 'Nous répondrons rapidement à votre message',
  fields = [
    { id: 'name', type: 'text', label: 'Nom complet', name: 'name', placeholder: 'Votre nom', required: true },
    { id: 'email', type: 'email', label: 'Email', name: 'email', placeholder: 'votre@email.com', required: true },
    { id: 'phone', type: 'tel', label: 'Téléphone', name: 'phone', placeholder: 'Votre numéro de téléphone', required: false },
    { id: 'subject', type: 'select', label: 'Sujet', name: 'subject', placeholder: 'Choisissez un sujet', required: true, options: [
      { value: 'general', label: 'Question générale' },
      { value: 'support', label: 'Support technique' },
      { value: 'sales', label: 'Demande commerciale' },
      { value: 'partnership', label: 'Partenariat' }
    ]},
    { id: 'message', type: 'textarea', label: 'Message', name: 'message', placeholder: 'Votre message...', required: true, validation: { minLength: 10 } },
    { id: 'newsletter', type: 'checkbox', label: 'S\'inscrire à la newsletter', name: 'newsletter', required: false }
  ],
  submitText = 'Envoyer le message',
  successMessage = 'Merci ! Votre message a été envoyé avec succès.',
  errorMessage = 'Une erreur est survenue. Veuillez réessayer.',
  layout = 'card',
  backgroundColor = 'bg-white',
  textColor = 'text-gray-800',
  showLabels = true,
  showPlaceholders = true,
  readOnly = false,
  onSubmit
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Classes CSS dynamiques
  const layoutClasses = {
    simple: 'space-y-4',
    card: 'bg-white rounded-lg shadow-lg p-6 space-y-4',
    split: 'grid grid-cols-1 md:grid-cols-2 gap-6'
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateField = (field: ContactField, value: any): string | null => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return 'Ce champ est requis';
    }

    if (field.validation) {
      const { pattern, minLength, maxLength, customMessage } = field.validation;
      
      if (pattern && value) {
        const regex = new RegExp(pattern);
        if (!regex.test(value.toString())) {
          return customMessage || 'Format invalide';
        }
      }
      
      if (minLength && value && value.toString().length < minLength) {
        return customMessage || `Minimum ${minLength} caractères`;
      }
      
      if (maxLength && value && value.toString().length > maxLength) {
        return customMessage || `Maximum ${maxLength} caractères`;
      }
    }

    // Validation spécifique par type
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.toString())) {
        return 'Email invalide';
      }
    }

    if (field.type === 'tel' && value) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
      if (!phoneRegex.test(value.toString().replace(/\s/g, ''))) {
        return 'Numéro de téléphone invalide';
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = formData[field.name];
      const error = validateField(field, value);
      
      if (error) {
        newErrors[field.name] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (readOnly) return;
    
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      
      // Simulation de succès
      setTimeout(() => {
        setSubmitStatus('success');
        setIsSubmitting(false);
        
        // Réinitialiser le formulaire après succès
        if (!readOnly) {
          setFormData({});
        }
      }, 1000);
    } catch (error) {
      setSubmitStatus('error');
      setIsSubmitting(false);
    }
  };

  const renderField = (field: ContactField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    
    const commonProps = {
      id: field.id,
      name: field.name,
      value: value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleInputChange(field.name, e.target.value),
      placeholder: showPlaceholders ? field.placeholder : undefined,
      disabled: readOnly || isSubmitting,
      className: `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`,
      'aria-invalid': error ? 'true' : 'false',
      'aria-describedby': error ? `${field.id}-error` : undefined
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
          />
        );
      
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">{field.placeholder || 'Sélectionnez...'}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.id}
              name={field.name}
              checked={!!value}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              disabled={readOnly || isSubmitting}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor={field.id} className="ml-2 block text-sm text-gray-700">
              {field.label}
            </label>
          </div>
        );
      
      default:
        return (
          <input
            type={field.type}
            {...commonProps}
          />
        );
    }
  };

  return (
    <div className={`contact-component ${backgroundColor} ${textColor} p-6 rounded-lg`}>
      {/* En-tête */}
      <div className="mb-6">
        {title && (
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
        )}
        {subtitle && (
          <p className="text-gray-600">{subtitle}</p>
        )}
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className={layoutClasses[layout]}>
        {fields.map(field => (
          <div key={field.id} className="space-y-1">
            {showLabels && field.type !== 'checkbox' && (
              <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            
            {renderField(field)}
            
            {errors[field.name] && (
              <p id={`${field.id}-error`} className="text-sm text-red-600">
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}
        
        {/* Bouton de soumission */}
        {!readOnly && (
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors duration-200 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Envoi en cours...
                </span>
              ) : (
                submitText
              )}
            </button>
          </div>
        )}
      </form>

      {/* Messages de statut */}
      {submitStatus === 'success' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-700">{successMessage}</p>
          </div>
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Informations de contact supplémentaires */}
      {!readOnly && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+33 1 23 45 67 89</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>contact@example.com</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Paris, France</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;