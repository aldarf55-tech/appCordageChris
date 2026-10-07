import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { JobCard } from '@/components/cards/JobCard';
import type { Client } from '@/types/client';

export function HistoryView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // 1. Récupération réactive des travaux et des clients
  const { jobs, clientsMap } =
    useLiveQuery(async () => {
      const [allJobs, allClients] = await Promise.all([
        db.stringingJobs.toArray(),
        db.clients.toArray(),
      ]);

      const map = new Map<string, Client>();
      allClients.forEach((client) => {
        if (client.id) map.set(client.id, client);
      });

      // Tri anti-chronologique (du plus récent au plus ancien)
      const sortedJobs = allJobs.sort((a, b) => {
        const timeA = new Date(a.dateReception || a.createdAt || 0).getTime();
        const timeB = new Date(b.dateReception || b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      return { jobs: sortedJobs, clientsMap: map };
    }, []) || { jobs: [], clientsMap: new Map() };

  // 2. Filtrage réactif par Nom/Prénom, Statut et Date
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const client = job.clientId ? clientsMap.get(job.clientId) : undefined;
      const clientFullName = client
        ? `${client.prenom} ${client.nom}`.toLowerCase()
        : '';

      const term = searchTerm.toLowerCase();
      const raquette = `${job.raquetteMarque} ${job.raquetteModele}`.toLowerCase();
      const cordage = `${job.cordageMarque || ''} ${job.cordageNom || ''}`.toLowerCase();

      const matchesSearch =
        clientFullName.includes(term) ||
        raquette.includes(term) ||
        cordage.includes(term);

      const matchesStatus =
        statusFilter === 'all' || job.statut === statusFilter;

      let matchesDate = true;
      if (selectedDate) {
        const jobDateStr = job.dateReception || job.createdAt;
        if (jobDateStr) {
          const jobDateFormatted = new Date(jobDateStr)
            .toISOString()
            .split('T')[0];
          matchesDate = jobDateFormatted === selectedDate;
        } else {
          matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [jobs, clientsMap, searchTerm, statusFilter, selectedDate]);

  return (
    <div className="p-4 space-y-4 pb-20 max-w-3xl mx-auto">
      {/* BARRE DE FILTRES */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Recherche
          </label>
          <input
            type="search"
            placeholder="🔍 Client, raquette, cordage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Statut
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="recu">📥 Reçu</option>
            <option value="pret">✅ Prêt</option>
            <option value="livre">🤝 Livré</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Date de réception
          </label>
          <div className="flex gap-1">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border transition-colors"
                title="Effacer la date"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AFFICHAGE DES CARTES */}
      {filteredJobs.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-300 space-y-2">
          <p className="text-2xl">🔍</p>
          <p className="text-sm font-medium text-gray-600">
            Aucun cordage ne correspond aux filtres.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredJobs.map((job) => {
            const client = job.clientId
              ? clientsMap.get(job.clientId)
              : undefined;
            const clientName = client
              ? `${client.prenom} ${client.nom}`
              : undefined;

            return (
              <JobCard
                key={job.id}
                job={job}
                clientName={clientName}
                clientPhone={client?.telephone}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}