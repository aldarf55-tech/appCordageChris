import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import type { Client } from '@/types/client';

const PERIOD_START_KEY = 'cordage_stats_period_start';

interface ClientRanking {
  id: string;
  name: string;
  jobs: number;
  revenue: number;
}

interface StringRanking {
  name: string;
  quantity: number;
}

function todayAsInputValue(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

function getInitialPeriodStart(): string {
  const savedDate = localStorage.getItem(PERIOD_START_KEY);
  return savedDate && /^\d{4}-\d{2}-\d{2}$/.test(savedDate)
    ? savedDate
    : todayAsInputValue();
}

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

function RankingList<T>({
  title,
  description,
  entries,
  getKey,
  renderEntry,
  className,
}: {
  title: string;
  description: string;
  entries: T[];
  getKey: (entry: T) => string;
  renderEntry: (entry: T, rank: number) => React.ReactNode;
  className: string;
}) {
  return (
    <section className={className}>
      <div className="mb-2">
        <h2 className="font-bold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      {entries.length === 0 ? (
        <p className="py-4 text-sm text-gray-500">Pas encore de données.</p>
      ) : (
        <ol className="divide-y divide-gray-200">
          {entries.map((entry, index) => (
            <li key={getKey(entry)} className="flex items-center gap-3 py-3">
              <span className="w-6 shrink-0 text-sm font-bold text-gray-400">{index + 1}.</span>
              {renderEntry(entry, index + 1)}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function StatsView() {
  const [periodStart, setPeriodStart] = useState(getInitialPeriodStart);
  const jobs = useLiveQuery(() => db.stringingJobs.toArray()) || [];
  const clients = useLiveQuery(() => db.clients.toArray()) || [];
  const clientsById = new Map<string, Client>(
    clients.flatMap((client) => client.id ? [[client.id, client] as const] : [])
  );

  const clientTotals = new Map<string, ClientRanking>();
  const stringTotals = new Map<string, StringRanking>();

  for (const job of jobs) {
    if (job.clientId) {
      const client = clientsById.get(job.clientId);
      if (client) {
        const current = clientTotals.get(job.clientId) ?? {
          id: job.clientId,
          name: `${client.prenom} ${client.nom}`,
          jobs: 0,
          revenue: 0,
        };
        current.jobs += 1;
        if (job.statut === 'livre') current.revenue += job.prixTotal;
        clientTotals.set(job.clientId, current);
      }
    }

    const cordageName = job.cordageNom?.trim();
    const storedBrand = job.cordageMarque?.trim();
    const isSupplyType = ['bobine perso', 'garniture'].includes(
      storedBrand?.toLocaleLowerCase('fr') ?? ''
    );
    const normalizedStringName =
      cordageName || (!isSupplyType ? storedBrand : undefined) || 'Cordage non renseigné';
    const currentString = stringTotals.get(normalizedStringName) ?? {
      name: normalizedStringName,
      quantity: 0,
    };
    currentString.quantity += job.quantite || 1;
    stringTotals.set(normalizedStringName, currentString);
  }

  const topClients = [...clientTotals.values()]
    .sort((a, b) => b.revenue - a.revenue || b.jobs - a.jobs || a.name.localeCompare(b.name, 'fr'))
    .slice(0, 3);
  const topStrings = [...stringTotals.values()]
    .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name, 'fr'))
    .slice(0, 3);

  const jobsSinceStart = jobs.filter((job) => {
    const receivedDate = job.dateReception?.slice(0, 10) || job.createdAt.slice(0, 10);
    return receivedDate >= periodStart;
  });
  const revenueSinceStart = jobsSinceStart
    .filter((job) => job.statut === 'livre')
    .reduce((sum, job) => sum + job.prixTotal, 0);

  const handlePeriodStartChange = (value: string) => {
    setPeriodStart(value);
    localStorage.setItem(PERIOD_START_KEY, value);
  };

  return (
    <div className="w-full min-w-0 flex-1 space-y-6 p-4 pb-24">
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <RankingList
          title="Top 3 clients"
          description="Classés par chiffre d’affaires encaissé"
          entries={topClients}
          getKey={(client) => client.id}
          className="min-w-0 rounded-xl border-2 border-blue-200 border-b-4 border-b-blue-300 bg-blue-50 p-3"
          renderEntry={(client) => (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{client.name}</p>
              <p className="text-xs text-gray-500">
                {client.jobs} prise{client.jobs > 1 ? 's' : ''} en charge · {euroFormatter.format(client.revenue)} encaissés
              </p>
            </div>
          )}
        />

        <RankingList
          title="Top 3 cordages"
          description="Classés par nombre de raquettes cordées"
          entries={topStrings}
          getKey={(string) => string.name}
          className="min-w-0 rounded-xl border-2 border-emerald-200 border-b-4 border-b-emerald-300 bg-emerald-50 p-3"
          renderEntry={(string) => (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{string.name}</p>
              <p className="text-xs text-gray-500">
                {string.quantity} raquette{string.quantity > 1 ? 's' : ''}
              </p>
            </div>
          )}
        />

        <section
          style={{ gridColumn: '1 / -1' }}
          className="space-y-4 rounded-xl border-2 border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col items-start gap-3">
            <div className="self-start">
              <h2 className="font-bold text-gray-900">Activité depuis le</h2>
              <p className="text-xs text-gray-500">Les gains comptent uniquement les travaux clôturés et réglés.</p>
            </div>
            <div>
              <label
                htmlFor="stats-period-start"
                className="mb-2 block text-xs font-medium text-gray-600"
              >
                Date de début
              </label>
              <input
                id="stats-period-start"
                type="date"
                value={periodStart}
                max={todayAsInputValue()}
                onChange={(event) => handlePeriodStartChange(event.target.value)}
                className="block rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-blue-200 border-l-4 border-l-blue-500 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase text-blue-900">Prises en charge</p>
              <p className="mt-1 text-3xl font-black text-blue-700">{jobsSinceStart.length}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 border-l-4 border-l-emerald-500 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase text-emerald-900">Gains encaissés</p>
              <p className="mt-1 text-2xl font-black text-emerald-700">{euroFormatter.format(revenueSinceStart)}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
