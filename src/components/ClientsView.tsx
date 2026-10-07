import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import type { Client } from '@/types/client';
import { deleteClient, updateClient } from '@/services/clientService';

interface ClientsViewProps {
  onAddJobForClient: (client: Client) => void;
}

export function ClientsView({ onAddJobForClient }: ClientsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // 1. Récupération & Tri alphabétique (Nom + Prénom)
  const clients =
    useLiveQuery(async () => {
      const allClients = await db.clients.toArray();
      return allClients.sort((a, b) => {
        const nameA = `${a.nom} ${a.prenom}`.toLowerCase();
        const nameB = `${b.nom} ${b.prenom}`.toLowerCase();
        return nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' });
      });
    }) || [];

  // 2. Filtrage pour la recherche rapide
  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${client.prenom} ${client.nom}`.toLowerCase();
    const phone = client.telephone || '';
    return fullName.includes(term) || phone.includes(term);
  });

  // 3. Sauvegarde des modifications
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editingClient.id) return;

    await updateClient(editingClient.id, {
      nom: editingClient.nom,
      prenom: editingClient.prenom,
      telephone: editingClient.telephone,
      email: editingClient.email,
      notes: editingClient.notes,
    });

    setEditingClient(null);
  };

  const handleDelete = async (client: Client) => {
    if (!client.id) return;
    const confirmed = window.confirm(
      `Supprimer ${client.prenom} ${client.nom} ? Ses prises en charge seront conservées, mais ne seront plus associées à son nom.`
    );
    if (!confirmed) return;

    try {
      await deleteClient(client.id);
    } catch (error) {
      console.error('Erreur lors de la suppression du client :', error);
      window.alert('Le client n’a pas pu être supprimé.');
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* EN-TÊTE & RECHERCHE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xs text-gray-500">
            {clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}
          </h2>
        </div>

        <input
          type="search"
          placeholder="🔍 Rechercher un nom, téléphone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* LISTE DES CLIENTS */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
          {searchTerm ? 'Aucun client ne correspond à la recherche.' : 'Aucun client enregistré pour le moment.'}
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-start gap-3 hover:border-gray-300 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-base">
                    {client.nom.toUpperCase()} {client.prenom}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                  {client.telephone && (
                    <a
                      href={`tel:${client.telephone}`}
                      className="text-blue-600 font-medium hover:underline flex items-center gap-1"
                    >
                      📞 {client.telephone}
                    </a>
                  )}
                  {client.email && (
                    <a
                      href={`mailto:${client.email}`}
                      className="text-gray-500 hover:underline flex items-center gap-1"
                    >
                      ✉️ {client.email}
                    </a>
                  )}
                </div>

                {client.notes && (
                  <p className="text-xs text-gray-500 italic bg-gray-50 p-1.5 rounded-md mt-1 border border-gray-100">
                    « {client.notes} »
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onAddJobForClient(client)}
                  aria-label={`Nouvelle prise en charge pour ${client.prenom} ${client.nom}`}
                  title="Ajouter une prise en charge"
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingClient(client)}
                  aria-label={`Modifier ${client.prenom} ${client.nom}`}
                  title="Modifier le client"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(client)}
                  aria-label={`Supprimer ${client.prenom} ${client.nom}`}
                  title="Supprimer le client"
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="m19 6-1 14H6L5 6" />
                    <path d="M10 11v5M14 11v5" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALE D'ÉDITION */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                Modifier le client
              </h3>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="edit-client-first-name" className="block text-xs font-semibold text-gray-600 mb-1">
                    Prénom *
                  </label>
                  <input
                    id="edit-client-first-name"
                    type="text"
                    required
                    value={editingClient.prenom}
                    onChange={(e) =>
                      setEditingClient({ ...editingClient, prenom: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="edit-client-last-name" className="block text-xs font-semibold text-gray-600 mb-1">
                    Nom *
                  </label>
                  <input
                    id="edit-client-last-name"
                    type="text"
                    required
                    value={editingClient.nom}
                    onChange={(e) =>
                      setEditingClient({ ...editingClient, nom: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-client-phone" className="block text-xs font-semibold text-gray-600 mb-1">
                  Téléphone
                </label>
                <input
                  id="edit-client-phone"
                  type="tel"
                  value={editingClient.telephone || ''}
                  onChange={(e) =>
                    setEditingClient({ ...editingClient, telephone: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="edit-client-email" className="block text-xs font-semibold text-gray-600 mb-1">
                  Email
                </label>
                <input
                  id="edit-client-email"
                  type="email"
                  value={editingClient.email || ''}
                  onChange={(e) =>
                    setEditingClient({ ...editingClient, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="edit-client-notes" className="block text-xs font-semibold text-gray-600 mb-1">
                  Notes
                </label>
                <textarea
                  id="edit-client-notes"
                  rows={2}
                  value={editingClient.notes || ''}
                  onChange={(e) =>
                    setEditingClient({ ...editingClient, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}