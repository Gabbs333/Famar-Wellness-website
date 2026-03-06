// SaveStatus - Indicateur de statut de sauvegarde
// Affiche l'état de sauvegarde et la dernière date de sauvegarde

import React from 'react';

interface SaveStatusProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  onSave?: () => void;
}

const SaveStatus: React.FC<SaveStatusProps> = ({ status, lastSaved, onSave }) => {
  // Formater la date de dernière sauvegarde
  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Jamais';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) {
      return 'À l\'instant';
    } else if (diffMins < 60) {
      return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Obtenir les styles et le texte selon le statut
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          text: 'Sauvegarde en cours...',
          icon: (
            <svg className="animate-spin h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ),
          bgColor: 'bg-teal-50',
          textColor: 'text-teal-700',
          borderColor: 'border-teal-200'
        };
      case 'saved':
        return {
          text: 'Sauvegardé',
          icon: (
            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'error':
        return {
          text: 'Erreur de sauvegarde',
          icon: (
            <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      case 'idle':
      default:
        return {
          text: 'Prêt',
          icon: (
            <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="flex items-center space-x-3">
      {/* Indicateur de statut */}
      <div className={`flex items-center px-3 py-1.5 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
        <div className="flex items-center">
          {statusConfig.icon}
          <span className={`ml-2 text-sm font-medium ${statusConfig.textColor}`}>
            {statusConfig.text}
          </span>
        </div>
      </div>

      {/* Dernière sauvegarde */}
      {lastSaved && (
        <div className="text-sm text-gray-600">
          Dernière sauvegarde: {formatLastSaved(lastSaved)}
        </div>
      )}

      {/* Bouton de sauvegarde manuelle */}
      {onSave && status !== 'saving' && (
        <button
          onClick={onSave}
          className="text-sm text-teal-600 hover:text-teal-800 underline"
          title="Sauvegarder maintenant"
        >
          Sauvegarder
        </button>
      )}

      {/* Indicateur de sauvegarde automatique */}
      <div className="text-xs text-gray-500">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-teal-500 mr-1"></div>
          Sauvegarde automatique activée
        </div>
      </div>
    </div>
  );
};

export default SaveStatus;