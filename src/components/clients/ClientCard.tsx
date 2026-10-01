import React from 'react';
import type { Client } from '@/types/client';
import { clientStyles } from '@/styles/clientStyles';

interface ClientCardProps {
  client: Client;
  onSelect?: (client: Client) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onSelect }) => {
  const initials = `${client.prenom.charAt(0)}${client.nom.charAt(0)}`.toUpperCase();
  const formattedDate = client.createdAt
    ? new Date(client.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <div className={clientStyles.card} onClick={() => onSelect?.(client)}>
      <div className="flex items-center min-w-0">
        <div className={clientStyles.clientAvatar}>{initials}</div>
        <div className="min-w-0">
          <h4 className={clientStyles.clientName}>
            {client.prenom} {client.nom}
          </h4>
          {client.telephone && (
            <p className={clientStyles.clientPhone}>
              <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {client.telephone}
            </p>
          )}
          {client.email && (
            <p className="text-[11px] text-gray-400 truncate mt-0.5">{client.email}</p>
          )}
        </div>
      </div>

      <div className="text-right shrink-0 ml-2">
        <span className={clientStyles.dateBadge}>{formattedDate}</span>
      </div>
    </div>
  );
};