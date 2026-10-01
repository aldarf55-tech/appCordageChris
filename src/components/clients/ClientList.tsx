import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import type { Client, SortOrder } from '@/types/client';
import { ClientCard } from './ClientCard';
import { clientStyles } from '@/styles/clientStyles';

interface ClientListProps {
  onSelectClient?: (client: Client) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ onSelectClient }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Requête réactive temps réel via Dexie
  const clients = useLiveQuery(
    async () => {
      const allClients = await db.clients.toArray();
      const query = searchQuery.trim().toLowerCase();

      // Filtrage
      const filtered = allClients.filter((c) => {
        if (!query) return true;
        const fullName = `${c.prenom} ${c.nom}`.toLowerCase();
        const phone = (c.telephone || '').replace(/\s+/g, '');
        const email = (c.email || '').toLowerCase();
        return fullName.includes(query) || phone.includes(query) || email.includes(query);
      });

      // Tri chronologique
      return filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
    },
    [searchQuery, sortOrder],
    []
  );

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <div className={clientStyles.container}>
      {/* HEADER */}
      <div className={clientStyles.headerContainer}>
        <h2 className={clientStyles.title}>Répertoire Clients</h2>
        <span className={clientStyles.countBadge}>{clients.length} client{clients.length > 1 ? 's' : ''}</span>
      </div>

      {/* RECHERCHE ET TRI */}
      <div className={clientStyles.controlsWrapper}>
        <div className={clientStyles.searchWrapper}>
          <svg className={clientStyles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, téléphone, email..."
            className={clientStyles.searchInput}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className={clientStyles.clearButton}
            >
              ✕
            </button>
          )}
        </div>

        <div className={clientStyles.sortWrapper}>
          <span>Ordre :</span>
          <button type="button" onClick={toggleSort} className={clientStyles.sortButton}>
            <span>{sortOrder === 'desc' ? 'Plus récents en premier' : 'Plus anciens en premier'}</span>
            <svg className={`w-3.5 h-3.5 transform transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* LISTE DES CLIENTS */}
      {clients.length === 0 ? (
        <div className={clientStyles.emptyState}>
          <p className={clientStyles.emptyTitle}>
            {searchQuery ? 'Aucun client ne correspond à votre recherche' : 'Aucun client enregistré'}
          </p>
          <p className={clientStyles.emptySub}>
            {searchQuery ? 'Essayez avec un autre terme ou vérifiez le numéro.' : 'Utilisez le bouton "+" pour ajouter votre premier client.'}
          </p>
        </div>
      ) : (
        <div className={clientStyles.listContainer}>
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onSelect={onSelectClient}
            />
          ))}
        </div>
      )}
    </div>
  );
};