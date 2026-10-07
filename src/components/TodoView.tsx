import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { JobCard } from '@/components/cards/JobCard';

export function TodoView() {
  // Récupération réactive des travaux à faire ('recu')
  const jobs = useLiveQuery(() =>
    db.stringingJobs
      .where('statut')
      .equals('recu')
      .toArray()
  ) || [];

  // Récupération réactive de tous les clients pour faire la jointure
  const clients = useLiveQuery(() => db.clients.toArray()) || [];

  // Map d'accès rapide pour les clients par leur ID
  const clientsMap = new Map(clients.map((c) => [c.id, c]));

  return (
    <div className="w-full min-w-0 flex-1 p-4 space-y-4 pb-20">
      {jobs.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-300 space-y-2">
          <p className="text-2xl">🎉</p>
          <p className="text-sm font-medium text-gray-600">
            Aucun cordage en attente !
          </p>
          <p className="text-xs text-gray-400">
            Tous les travaux récents ont été terminés.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {jobs.map((job) => {
            const client = job.clientId ? clientsMap.get(job.clientId) : undefined;
            const clientName = client ? `${client.prenom} ${client.nom}` : undefined;

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