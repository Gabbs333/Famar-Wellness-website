import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const Contacts = () => {
  const { token, logout } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, [token, logout]);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/admin/contacts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else if (response.status === 401) {
        logout(); // Jeton expiré
      }
    } catch (error) {
      console.error('Échec de la récupération des contacts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setContacts(contacts.map(c => c.id === id ? { ...c, status: newStatus } : c));
      }
    } catch (error) {
      console.error('Échec de la mise à jour du statut du contact', error);
    }
  };

  if (loading) return <div className="text-center p-8">Chargement...</div>;

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-bold mb-6">Contacts</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordonnées</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sujet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(contact.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.email}</div>
                    <div className="text-sm text-gray-500">{contact.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">{contact.subject}</div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">{contact.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      contact.status === 'new' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {contact.status === 'new' ? 'Nouveau' : 'Lu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {contact.status === 'new' && (
                      <button
                        onClick={() => handleStatusUpdate(contact.id, 'read')}
                        className="text-teal-600 hover:text-teal-900 mr-4"
                      >
                        Marquer comme lu
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
